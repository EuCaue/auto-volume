import { storage, KEYS, DEFAULT_VALUES } from "@/utils/storage";
import BackgroundService from "react-native-background-actions";
import { VolumeManager } from "react-native-volume-manager";
import notifee, { EventType } from "@notifee/react-native";
import { dismissServiceNotification } from "./notificationService";
import { stopVolumeScheduler } from "../volume/stopVolumeScheduler";

export function registerNotificationEvents() {
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      const action = detail.pressAction?.id;

      if (action === "stop_service") {
        console.log("STOP");
        await stopVolumeScheduler(() => console.log("STOP SERVICE"));
      }

      if (action === "run_now") {
        await stopVolumeScheduler(() => {
          const volumeValue: number =
            (storage.getNumber(KEYS.volumeValue) ??
              DEFAULT_VALUES.volumeValue) / 100;
          VolumeManager.setVolume(Number(volumeValue.toFixed(2)));
        });
      }
    }
  });
}
