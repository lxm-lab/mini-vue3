import { isObject } from "./utils";
import { mutableHandlers } from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive", // 判断是否代理过
  RAW = "__v_raw", // 判断是不是原始对象
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.RAW]?: any;
}
// 用于判断对象是否被代理过
export const proxyMap = new WeakMap<object, any>();

// 函数重载
export function reactive<T extends object>(target: T): T;
export function reactive(target: object) {
  // 首先判断 传入数据是不是对象
  if (!isObject(target)) {
    return target;
  }

  // 如果同一个对象已经被代理过了  就不需要再重新代理了
  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  // 判断是不是 响应式对象 如果是直接返回
  // 是响应式对象 必有 RAW 和 IS_REACTIVE这两个值 严谨性判断
  if (target[ReactiveFlags.RAW] && target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  // vue3的核心 通过 proxy 代理对象
  const proxy = new Proxy(target, mutableHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

export function toRaw<T>(target: T): T {
  return (target && (target as Target)[ReactiveFlags.RAW]) || target;
}
