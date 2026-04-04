import { createMMKV } from "react-native-mmkv";

type KEYS_TYPE = {
  volumeValue: number;
  timerValue: string;
  isActive: boolean;
  isTaskRunning: boolean;
};
export const DEFAULT_VALUES: KEYS_TYPE = {
  volumeValue: 0,
  timerValue: "00:00:30",
  isActive: true,
  isTaskRunning: false,
};

export const KEYS: { [K in keyof typeof DEFAULT_VALUES]: K } = {
  volumeValue: "volumeValue",
  timerValue: "timerValue",
  isActive: "isActive",
  isTaskRunning: "isTaskRunning",
};

export const storage = createMMKV();

for (const [k, v] of Object.entries(DEFAULT_VALUES)) {
  const value = storage.getString(k);
  console.log("VALUE", value);
  if (value === undefined) {
    storage.set(k, v);
    console.log(`Storage does not include ${k}.`);
  }
}
