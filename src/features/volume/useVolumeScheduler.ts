import { useCallback, useEffect } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";
import { useMMKVBoolean } from "react-native-mmkv";
import { KEYS, storage } from "@/utils/storage";
import { timerToMs } from "@/utils/time";
import { upsertServiceNotification } from "../notifications/notificationService";
import { stopVolumeScheduler } from "./stopVolumeScheduler";

type ServiceTaskData = undefined;

export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    storage.set(KEYS.timerValue, timerValue);
  }, [timerValue]);

  useEffect(() => {
    storage.set(KEYS.volumeValue, volumeValue);
  }, [volumeValue]);

  const task = useCallback(async (_taskData: ServiceTaskData) => {
    let executeAt = 0;
    let lastVolume = -1;

    const clearPendingTimer = () => {
      executeAt = 0;
      storage.set(KEYS.isTaskRunning, false);
    };

    try {
      while (BackgroundService.isRunning()) {
        const active = storage.getBoolean(KEYS.isActive);
        if (!active) break;

        // Polling — verifica volume atual
        const { volume } = await VolumeManager.getVolume();

        if (lastVolume !== -1 && volume !== lastVolume) {
          const timerValueFromStorage = storage.getString(KEYS.timerValue) ?? "0m";
          const delay = timerToMs(timerValueFromStorage);

          if (delay <= 0) {
            clearPendingTimer();
          } else {
            executeAt = Date.now() + delay;
            storage.set(KEYS.isTaskRunning, true);
          }
        }

        lastVolume = volume;

        if (executeAt > 0) {
          const remaining = Math.max(0, executeAt - Date.now());

          await upsertServiceNotification({
            title: "Waiting to adjust the volume.",
            body: `${Math.ceil(remaining / 1000)}s remaining`,
          });

          if (remaining <= 0) {
            const latestVolume = Number(storage.getNumber(KEYS.volumeValue) ?? 0);
            const safeVolume = Math.max(0, Math.min(1, Number((latestVolume / 100).toFixed(2))));

            try {
              await VolumeManager.setVolume(safeVolume);
            } catch (error) {
              console.error("FAILED TO SET VOLUME", error);
            }

            await upsertServiceNotification({ title: "Service finished.", body: "Volume adjusted ✅" }, []);
            clearPendingTimer();
          }
        } else {
          await upsertServiceNotification({
            title: "Volume Timer",
            body: "Listening for volume changes...",
          });
        }

        await new Promise((r) => setTimeout(r, 1000));
      }
    } finally {
      clearPendingTimer();
    }
  }, []);

  useEffect(() => {
    async function syncServiceState() {
      if (!isActive) {
        if (BackgroundService.isRunning()) await stopVolumeScheduler();
        return;
      }

      if (BackgroundService.isRunning()) return;

      await BackgroundService.start(task, {
        taskName: "Volume Timer",
        taskTitle: "Volume Timer",
        taskDesc: "Listening for volume changes...",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#ffffff",
      });
    }

    void syncServiceState();
  }, [isActive, task]);
}
