import { useCallback, useEffect } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";
import { useMMKVBoolean } from "react-native-mmkv";

import { KEYS, storage } from "@/utils/storage";
import { timerToMs } from "@/utils/time";

import { stopVolumeScheduler } from "./stopVolumeScheduler";

type ServiceTaskData = undefined;

const SERVICE_OPTIONS = {
  taskName: "Volume Timer",
  taskTitle: "Volume Timer",
  taskDesc: "Listening for volume changes...",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#ffffff",
} as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateServiceNotification(taskDesc: string) {
  if (!BackgroundService.isRunning()) {
    return;
  }

  await BackgroundService.updateNotification({ taskDesc });
}

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

  const task = useCallback(async (_taskData: ServiceTaskData) => {
    let executeAt = Number(storage.getNumber(KEYS.executeAt) ?? 0);
    let lastNotificationText = "";
    let ignoreVolumeEventsUntil = 0;

    const clearPendingTimer = () => {
      executeAt = 0;
      storage.set(KEYS.executeAt, 0);
      storage.set(KEYS.isTaskRunning, false);
    };

    const scheduleVolumeUpdate = () => {
      const timerValueFromStorage =
        storage.getString(KEYS.timerValue) ?? "00:00:00";
      const delay = timerToMs(timerValueFromStorage);

      if (delay <= 0) {
        clearPendingTimer();
        return;
      }

      executeAt = Date.now() + delay;
      storage.set(KEYS.executeAt, executeAt);
      storage.set(KEYS.isTaskRunning, true);
    };

    const volumeListener = VolumeManager.addVolumeListener(() => {
      if (!storage.getBoolean(KEYS.isActive)) {
        return;
      }

      if (Date.now() < ignoreVolumeEventsUntil) {
        return;
      }

      scheduleVolumeUpdate();
    });

    try {
      while (BackgroundService.isRunning()) {
        const active = storage.getBoolean(KEYS.isActive);

        if (!active) {
          break;
        }

        let nextNotificationText = "Listening for volume changes...";

        if (executeAt > 0) {
          const remaining = Math.max(0, executeAt - Date.now());
          nextNotificationText = `${Math.ceil(remaining / 1000)}s remaining`;

          if (remaining <= 0) {
            const latestVolume = Number(storage.getNumber(KEYS.volumeValue) ?? 0);
            const safeVolume = Math.max(
              0,
              Math.min(1, Number((latestVolume / 100).toFixed(2))),
            );

            try {
              ignoreVolumeEventsUntil = Date.now() + 1500;
              await VolumeManager.setVolume(safeVolume);
            } catch (error) {
              console.error("FAILED TO SET VOLUME", error);
            }

            nextNotificationText = "Volume adjusted.";
            clearPendingTimer();
          }
        }

        if (lastNotificationText !== nextNotificationText) {
          await updateServiceNotification(nextNotificationText);
          lastNotificationText = nextNotificationText;
        }

        await sleep(1000);
      }
    } finally {
      volumeListener.remove();
      clearPendingTimer();
    }
  }, []);

  useEffect(() => {
    async function syncServiceState() {
      if (!isActive || !canRunInBackground) {
        if (BackgroundService.isRunning()) {
          await stopVolumeScheduler();
        }
        return;
      }

      if (BackgroundService.isRunning()) {
        return;
      }

      await BackgroundService.start(task, SERVICE_OPTIONS);
    }

    void syncServiceState();
  }, [canRunInBackground, isActive, task]);
}
