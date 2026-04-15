import { useEffect } from "react";
import { Platform } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import { KEYS, storage } from "@/utils/storage";
import { timerToMs } from "@/utils/time";

import {
  startOrUpdateAutoVolumeBackground,
  stopAutoVolumeBackground,
} from "./autoVolumeBackground";

export function useVolumeScheduler(
  timerValue: string,
  volumeValue: number,
  canRunInBackground = true,
) {
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    storage.set(KEYS.timerValue, timerValue);
  }, [timerValue]);

  useEffect(() => {
    storage.set(KEYS.volumeValue, volumeValue);
  }, [volumeValue]);

  useEffect(() => {
    async function syncServiceState() {
      if (Platform.OS !== "android") {
        return;
      }

      if (!isActive || !canRunInBackground) {
        storage.set(KEYS.executeAt, 0);
        storage.set(KEYS.isTaskRunning, false);
        await stopAutoVolumeBackground();
        return;
      }

      storage.set(KEYS.executeAt, 0);
      storage.set(KEYS.isTaskRunning, false);

      await startOrUpdateAutoVolumeBackground({
        isActive: true,
        timerMs: timerToMs(timerValue),
        targetVolume: volumeValue,
      });
    }

    void syncServiceState();
  }, [canRunInBackground, isActive, timerValue, volumeValue]);
}
