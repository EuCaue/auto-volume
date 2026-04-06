import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";
import { timerToMs } from "@/utils/time";
import { useMMKVBoolean } from "react-native-mmkv";
import { KEYS, storage } from "@/utils/storage";
import { upsertServiceNotification } from "../notifications/notificationService";
import { stopVolumeScheduler } from "./stopVolumeScheduler";

type TaskData =
  | {
      delay: number;
    }
  | undefined;

//  TODO: change the delay in runtime
export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);
  const volumeRef = useRef(volumeValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  useEffect(() => {
    volumeRef.current = volumeValue;
  }, [volumeValue]);

  const task = useCallback(async (taskData: TaskData) => {
    const interval = 1000;
    const delay = taskData?.delay ?? 0;

    const executeAt = Date.now() + delay;

    storage.set(KEYS.isTaskRunning, true);

    while (true) {
      const isAppActive = storage.getBoolean(KEYS.isActive);
      const isTaskRunning = storage.getBoolean(KEYS.isTaskRunning);

      if (!isAppActive || isTaskRunning === false) {
        console.log("NOT ACTIVE OR RUNNING");
        await stopVolumeScheduler();
        return;
      }

      const remaining = Math.max(0, executeAt - Date.now());

      await upsertServiceNotification({
        title: "Waiting to adjust the volume.",
        body: `${Math.ceil(remaining / 1000)}s remaining`,
      });

      if (remaining <= 0) break;

      await new Promise((r) => setTimeout(r, interval));
    }

    const safeVolume = Math.max(
      0,
      Math.min(1, Number((volumeRef.current / 100).toFixed(2))),
    );

    try {
      await VolumeManager.setVolume(safeVolume);
    } catch (err) {
      console.error("FAILED TO SET VOLUME", err);
    }

    await upsertServiceNotification(
      {
        title: "Service finished.",
        body: "Volume adjusted ✅",
      },
      [],
    );

    storage.set(KEYS.isTaskRunning, false);

    await stopVolumeScheduler();
  }, []);

  useEffect(() => {
    async function startDelayedAdjustment() {
      if (!isActive) return;

      if (BackgroundService.isRunning()) {
        console.log("SERVICE ALREADY RUNNING");
        return;
      }

      const delay = timerToMs(timerRef.current);

      if (delay <= 0) return;

      const options = {
        taskName: "Volume Timer",
        taskTitle: "Volume Timer",
        taskDesc: "Waiting to adjust the volume.",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#ffffff",
        parameters: {
          delay,
        },
      };

      try {
        console.log("STARTING SERVICE", { delay });
        await BackgroundService.start(task, options);
      } catch (error) {
        console.error("BACKGROUND SERVICE ERROR", error);
      }
    }

    const subscription = VolumeManager.addVolumeListener(() => {
      console.log("VOLUME changed");

      if (!isActive) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        void startDelayedAdjustment();
      }, 1500);
    });

    return () => {
      subscription.remove();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isActive, task]);

  useEffect(() => {
    if (!isActive) {
      storage.set(KEYS.isTaskRunning, false);
      stopVolumeScheduler().catch(() => {});
    }
  }, [isActive]);
}
