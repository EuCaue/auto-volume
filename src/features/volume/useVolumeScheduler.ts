import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";

import { timerToMs } from "@/utils/time";
import { useMMKVBoolean } from "react-native-mmkv";
import { KEYS, storage } from "@/utils/storage";

type TaskData = {
  delay: number;
} | undefined;

//  TODO: change the delay in runtime 
//  TODO: add background notification with actions 
export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  const task = useCallback(async (taskData: TaskData) => {
    const interval = 1000;
    const { delay } = taskData!
    let remaining = delay;

    while (remaining > 0) {
      await new Promise(r => setTimeout(r, interval));
      remaining -= interval;

      const isActiveNow = storage.getBoolean(KEYS.isActive);
      if (!isActiveNow) {
        console.log("NOT ACTIVE")
        await BackgroundService.stop();
        return;
      }
    }

    VolumeManager.setVolume(Number((volumeValue / 100).toFixed(2)));
    await BackgroundService.stop();
  }, [volumeValue]);

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

      // console.log("OPTIONS", options);

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
