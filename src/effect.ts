import { TrackOpTypes, TriggerOpTypes } from "./operations";
let shouldTrack = true;
export const track = (
  target: object,
  type: TrackOpTypes,
  key: string | symbol
) => {
  console.log(key, type, { shouldTrack });
  if (!shouldTrack) {
    return;
  }
  console.log("在收集依赖中", `[${type}] ${String(key)}属性被读取`);
};

export const trigger = (
  target: object,
  type: TriggerOpTypes,
  key: string | symbol
) => {
  console.log("在派发更新中", `[${type}] ${String(key)}属性更改，触发更新`);
};
// 暂停依赖收集
export function pauseTracking() {
  shouldTrack = false;
}

// 开启依赖收集
export function enableTracking() {
  shouldTrack = true;
}
