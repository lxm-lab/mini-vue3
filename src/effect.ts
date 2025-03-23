import { TrackOpTypes, TriggerOpTypes } from "./operations";
export const track = (
  target: object,
  type: TrackOpTypes,
  key: string | symbol
) => {
  console.log("在收集依赖中", `[${type}] ${String(key)}属性被读取`);
};

export const trigger = (
  target: object,
  type: TriggerOpTypes,
  key: string | symbol
) => {
  console.log("在派发更新中", `[${type}] ${String(key)}属性更改，触发更新`);
};
