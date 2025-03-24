import { isObject } from "./utils";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowHandlers,
} from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive", // 判断是否代理过
  RAW = "__v_raw", // 判断是不是原始对象
  IS_READONLY = "__v_isReadonly", // 判断是不是只读对象
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.RAW]?: any;
  [ReactiveFlags.IS_READONLY]?: boolean;
}
// 用于判断对象是否被代理过
export const reactiveMap = new WeakMap<object, any>();
export const readonlyMap = new WeakMap<object, any>();
//
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>
) {
  // 首先判断 传入数据是不是对象
  if (!isObject(target)) {
    return target;
  }

  // 此函数抽象为封装跟用到proxy相关的函数，如readonly，reactive
  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  // 如果同一个对象已经被代理过了  就不需要再重新代理了
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  // 判断是不是 响应式对象 如果是直接返回
  // 是响应式对象 必有 RAW 和 IS_REACTIVE这两个值 严谨性判断
  if (target[ReactiveFlags.RAW] && target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  // vue3的核心 通过 proxy 代理对象
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

// 函数重载
export function reactive<T extends object>(target: T): T;
export function reactive(target: object) {
  // 如果传入的是只读对象 那么直接返回
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers);
}

// 提供 只读 函数
type DeepReadonly<T extends Record<string, any>> = {
  readonly [K in keyof T]: T[K] extends Record<string, any>
    ? DeepReadonly<T[K]>
    : T[K];
};
export function readonly<T extends object>(target: T): DeepReadonly<T> {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReactive<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowHandlers);
}
export function toRaw<T>(target: T): T {
  return (target && (target as Target)[ReactiveFlags.RAW]) || target;
}
