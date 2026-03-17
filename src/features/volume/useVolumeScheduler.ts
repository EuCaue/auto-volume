import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";

import { timerToMs } from "@/utils/time";
import { useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";
import { KEYS } from "@/utils/storage";

type TaskData = {
  delay: number;
};

export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);
  const [isActive] = useMMKVBoolean(KEYS.isActive);
  const [volume] = useMMKVNumber(KEYS.volumeValue);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  const task = useCallback(
    async (taskDataArguments: TaskData | undefined) => {
      const { delay } = taskDataArguments!;
      console.log("TASK STARTED", delay, volumeValue, volume);
      await new Promise(resolve => setTimeout(resolve, delay));
      const v = Number((volumeValue / 100).toFixed(2));
      console.log("V", v);
      VolumeManager.setVolume(v);
      console.log("TASK FINISHED", delay, volumeValue, volume, VolumeManager.getVolume());
      await BackgroundService.stop();
      //  TODO: notify user this action has been done 
    },
    [volumeValue]
  );

  useEffect(() => {
    async function startDelayedAdjustment() {
      console.log("IS ACTIVE: ", isActive);
      if (!isActive) {
        console.log("should not run.")
        return;
      }


      if (BackgroundService.isRunning()) {
        console.log("SERVICE ALREADY RUNNING");
        return;
      }

      console.log(
        "CURRENT: ",
        timerRef.current,
        timerToMs(timerRef.current),
        volumeValue
      );

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

      console.log("OPTIONS", options);

      try {
        console.log("STARTING SERVICE");
        await BackgroundService.start(task, options);
      } catch (error) {
        console.log("BACKGROUND ERROR", error);
      }
    }

    const subscription = VolumeManager.addVolumeListener(() => {
      console.log("VOLUME changed");
      startDelayedAdjustment();
    });

    return () => subscription.remove();
  }, [task, volumeValue]);
}
