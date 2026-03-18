import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";

import { timerToMs } from "@/utils/time";
import { useMMKVBoolean } from "react-native-mmkv";
import { KEYS, storage } from "@/utils/storage";

type TaskData = {
  delay: number;
};

//  TODO: stop when isActive is false whilte active
export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);
  const [isActive] = useMMKVBoolean(KEYS.isActive);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  const task = useCallback(
    async (taskDataArguments: TaskData | undefined) => {
      const { delay } = taskDataArguments!;
      console.log("TASK STARTED", delay, volumeValue, isActive);
      await new Promise(resolve => setTimeout(resolve, delay));
      const isActiveNow = storage.getBoolean(KEYS.isActive);

      if (!isActiveNow) {
        await BackgroundService.stop();
        return;
      }
      const v = Number((volumeValue / 100).toFixed(2));
      VolumeManager.setVolume(v);
      console.log("TASK FINISHED", delay, volumeValue, isActive);
      await BackgroundService.stop();
      //  TODO: notify user this action has been done 
    },
    [isActive, volumeValue]
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
        taskTitle: "Volume Timer running",
        taskDesc: "Waiting to adjust volume",
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
