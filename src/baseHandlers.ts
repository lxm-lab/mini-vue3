import { reactive, proxyMap, toRaw } from "./reactive";
import { ReactiveFlags } from "./reactive";
import { isObject, hasChanged, isArray, isIntegerKey } from "./utils";
import { track, trigger, enableTracking, pauseTracking } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

const ITERATE_KEY = Symbol("iterate");

// 重写的数组方法，统一管理
const arrayInstrumentations: Record<string, Function> = {};

(["includes", "indexOf", "lastIndexOf"] as const).forEach((key) => {
  const method = Array.prototype[key] as any;
  arrayInstrumentations[key] = function (this: unknown[], ...args: unknown[]) {
    // 先给代理对象 去响应式
    const arr = toRaw(this);
    // 重写方法，要重新遍历收集依赖
    // 保证length只需要收集一次，并且遍历时只需要对每个值做GET的依赖收集 HAS省略
    for (let i = 0, l = this.length; i < l; i++) {
      track(arr, TrackOpTypes.GET, i + "");
    }
    // 再重新调用原来的函数
    const res = method.apply(arr, args);
    if (res === -1 || res === false) {
      // 这里在原始对象中没找到，因为这里的参数可能也是带响应式的，去响应式后再查找
      return method.apply(arr, args.map(toRaw));
    } else {
      return res;
    }
  };
});
(["push", "pop", "shift", "unshift", "splice"] as const).forEach((key) => {
  const method = Array.prototype[key] as any;
  arrayInstrumentations[key] = function (this: unknown[], ...args: unknown[]) {
    pauseTracking();
    const res = method.apply(this, args);
    enableTracking();
    return res;
  };
});
function get(target: object, key: string | symbol, receiver: object): any {
  // 用于判断是不是代理后的对象 打标识
  if (key === ReactiveFlags.IS_REACTIVE) {
    return true;
  }
  // 有些情况需要返回原始值，用IS_RAW这个键来返回， 并且判断 receiver 是否被代理过
  if (key === ReactiveFlags.RAW && receiver === proxyMap.get(target)) {
    return target;
  }

  // 判断传入值是不是数组，如果是数组 则将重写后的函数赋值给代理对象调用
  const targetIsArray = isArray(target);
  if (targetIsArray && arrayInstrumentations.hasOwnProperty(key)) {
    return Reflect.get(arrayInstrumentations, key, receiver);
  }
  track(target, TrackOpTypes.GET, key);
  const res = Reflect.get(target, key, receiver);
  // 如果读取的值是对象，在递归代理
  if (isObject(res)) {
    return reactive(res);
  }
  return res;
}

// 要判断是否有这个属性，区别修改还是新增，并且要判断前后更改的值是否相同
function set(
  target: Record<string | symbol, any>,
  key: string | symbol,
  value: unknown,
  receiver: object
): boolean {
  // 判断是否有这个属性
  const hadKey = target.hasOwnProperty(key);
  const oldVal = target[key];
  // 如果是数组，要判断新设置的下标是否＞原来length 要更新length 隐式长度变化
  // 如果是数组，显式把length改小，那需要修改length 和 把原来数组中的多余元素做DELETE操作
  const needUpdateLength =
    isArray(target) && isIntegerKey(key) && Number(key) >= target.length - 1;
  // 如果没有这个属性，说明是新增操作
  if (!hadKey) {
    trigger(target, TriggerOpTypes.ADD, key);
    // 不需要再额外判断是不是length属性 isIntegerKey 已经保证了
    if (needUpdateLength) {
      console.log(key);

      trigger(target, TriggerOpTypes.SET, "length");
    }
    // 如果有这个属性，并且确实改变了前后的值 那么派发更新
  } else if (hasChanged(oldVal, value)) {
    console.log(key);
    trigger(target, TriggerOpTypes.SET, key);
    if (
      isArray(target) &&
      key === "length" &&
      (value as number) < target.length
    ) {
      console.log(value, key, target.length);
      for (let i = value as number; i < target.length; i++) {
        console.log(i);
        trigger(target, TriggerOpTypes.DELETE, i + "");
      }
    }
  }
  return Reflect.set(target, key, value, receiver);
}
function has(target: object, key: string | symbol): boolean {
  track(target, TrackOpTypes.HAS, key);
  return Reflect.has(target, key);
}
function ownKeys(target: object): (string | symbol)[] {
  track(target, TrackOpTypes.ITERATE, ITERATE_KEY);
  return Reflect.ownKeys(target);
}
// 删除的时候要判断本身对象中有没有这个属性，有才触发更新
function deleteProperty(target: object, key: string | symbol) {
  // 判断对象是否有这个属性
  const hadKey = target.hasOwnProperty(key);
  // 并且判断删除是否成功
  const res = Reflect.deleteProperty(target, key);
  if (hadKey && res) {
    trigger(target, TriggerOpTypes.DELETE, key);
  }
  return res;
}
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  has,
  ownKeys,
  deleteProperty,
};
