import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";

import { timerToMs } from "@/utils/time";
import { useMMKVBoolean } from "react-native-mmkv";
import { KEYS, storage } from "@/utils/storage";
import {
  dismissServiceNotification,
  upsertServiceNotification,
} from "../notifications/notificationService";
import { accessibilityProps } from "react-native-paper/lib/typescript/components/MaterialCommunityIcon";
import { stopVolumeScheduler } from "./stopVolumeScheduler";

type TaskData =
  | {
      delay: number;
    }
  | undefined;

//  TODO: change the delay in runtime
export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  const task = useCallback(
    async (taskData: TaskData) => {
      const interval = 1000;
      const { delay } = taskData!;
      let remaining = delay;
      storage.set(KEYS.isTaskRunning, true);

      while (remaining > 0) {
        await new Promise((r) => setTimeout(r, interval));
        remaining -= interval;

        const isAppActive = storage.getBoolean(KEYS.isActive);
        const isTaskRunning = storage.getBoolean(KEYS.isTaskRunning);

        if (!isAppActive || isTaskRunning === false) {
          console.log("NOT ACTIVE OR RUNNING");
          await stopVolumeScheduler();
          return;
        }
        await upsertServiceNotification({
          title: "Waiting to adjust the volume.",
          body: `Faltam ${Math.ceil(remaining / 1000)}s`,
        });
      }

      VolumeManager.setVolume(Number((volumeValue / 100).toFixed(2)));

      //  TODO: check to see how it was ended and react dif
      await upsertServiceNotification(
        {
          title: "Service finished.",
          body: "Volume adjusted ✅",
        },
        [],
      );
      await stopVolumeScheduler();
    },
    [volumeValue],
  );

  useEffect(() => {
    async function startDelayedAdjustment() {
      if (!isActive) {
        return;
      }

      if (BackgroundService.isRunning()) {
        console.log("SERVICE ALREADY RUNNING");
        return;
      }

      const options = {
        taskName: "Volume Timer",
        taskTitle: " ",
        taskDesc: " ",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
        color: "#ffffff",
        parameters: {
          delay: timerToMs(timerRef.current),
        },
      };

      try {
        console.log("STARTING SERVICE");
        await BackgroundService.start(task, options);
      } catch (error) {
        console.error("BACKGROUND SERVICE ERROR", error);
      }
    }

    const subscription = VolumeManager.addVolumeListener(() => {
      console.log("VOLUME changed");
      startDelayedAdjustment();
    });

    return () => subscription.remove();
  }, [isActive, task, volumeValue]);
}
