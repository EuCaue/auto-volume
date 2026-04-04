import { storage, KEYS, DEFAULT_VALUES } from "@/utils/storage";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";
import notifee, { EventType } from "@notifee/react-native";
import { dismissServiceNotification } from "./notificationService";

export function registerNotificationEvents() {
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      const action = detail.pressAction?.id;

      if (action === "stop_service") {
        console.log("STOP");
        if (BackgroundService.isRunning()) {
          console.debug("Running and stopping");
          await BackgroundService.stop();
          storage.set(KEYS.isTaskRunning, false);
          await dismissServiceNotification();
        }
      }

      if (action === "run_now") {
        console.log("RUN NOW");
        if (BackgroundService.isRunning()) {
          await BackgroundService.stop();
          storage.set(KEYS.isTaskRunning, false);
          const volumeValue: number =
            (storage.getNumber(KEYS.volumeValue) ??
              DEFAULT_VALUES.volumeValue) / 100;
          VolumeManager.setVolume(Number(volumeValue.toFixed(2)));
          await dismissServiceNotification();
        }
      }
    }
  });
}
