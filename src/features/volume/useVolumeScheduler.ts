import { useCallback, useEffect, useRef } from "react";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";

import { timerToMs } from "@/utils/time";

type TaskData = {
  delay: number;
};

export function useVolumeScheduler(timerValue: string, volumeValue: number) {
  const timerRef = useRef(timerValue);

  useEffect(() => {
    timerRef.current = timerValue;
  }, [timerValue]);

  const task = useCallback(
    async (taskDataArguments: TaskData | undefined) => {
      const { delay } = taskDataArguments!;
      console.log("TASK STARTED", delay);
      await new Promise(resolve => setTimeout(resolve, delay));
      VolumeManager.setVolume(volumeValue);
      console.log("TASK FINISHED", volumeValue, VolumeManager.getVolume());
      await BackgroundService.stop();
    },
    [volumeValue]
  );

  useEffect(() => {
    async function startDelayedAdjustment() {
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
