import { createMMKV } from "react-native-mmkv";

type KEYS_TYPE = {
  volumeValue: number;
  timerValue: string;
  isActive: boolean;
  isTaskRunning: boolean;
  executeAt: number;
};
export const DEFAULT_VALUES: KEYS_TYPE = {
  volumeValue: 0,
  timerValue: "00:00:30",
  isActive: true,
  isTaskRunning: false,
  executeAt: 0,
};

export const KEYS: { [K in keyof typeof DEFAULT_VALUES]: K } = {
  volumeValue: "volumeValue",
  timerValue: "timerValue",
  isActive: "isActive",
  isTaskRunning: "isTaskRunning",
  executeAt: "executeAt",
};

export const storage = createMMKV();

for (const [k, v] of Object.entries(DEFAULT_VALUES)) {
  const value =
    storage.getString(k) ?? storage.getNumber(k) ?? storage.getBoolean(k);

  if (value === undefined) {
    storage.set(k, v);
    console.log(`Storage does not include ${k}.`);
  }
}
