// 自定义守卫
// val is Record<any,any> 类型收窄，意味着如果判断成立，这val的类型收窄为 对象
export const isObject = (val: unknown): val is Record<any, any> => {
  // 这里不考虑值为function的情况
  return val !== null && typeof val === "object";
};
export const isString = (val: unknown): val is string => {
  return typeof val === "string";
};
export const isSymbol = (val: unknown): val is symbol => {
  return typeof val === "symbol";
};

export const isArray = Array.isArray;

export const hasChanged = (oldVal: any, val: any) => {
  // 不用 === 要考虑到 NaN === NaN 和 +0 === -0 的问题
  return !Object.is(oldVal, val);
};
export const isIntegerKey = (key: unknown) => {
  return (
    isString(key) &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key, 10) === key
  );
};
