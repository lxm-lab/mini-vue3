// 自定义守卫
// val is Record<any,any> 类型收窄，意味着如果判断成立，这val的类型收窄为 对象
export const isObject = (val: unknown): val is Record<any, any> => {
  // 这里不考虑值为function的情况
  return val !== null && typeof val === "object";
};
export const isArray = (val: unknown): val is unknown[] => {
  // 这里不考虑值为function的情况
  return Array.isArray(val);
};

export const hasChanged = (oldVal: any, val: any) => {
  // 不用 === 要考虑到 NaN === NaN 和 +0 === -0 的问题
  return !Object.is(oldVal, val);
};
