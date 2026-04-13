import { storage, KEYS, DEFAULT_VALUES } from "@/utils/storage";
import { VolumeManager } from "react-native-volume-manager";
import notifee, { EventType } from "@notifee/react-native";
import { stopVolumeScheduler } from "../volume/stopVolumeScheduler";

export function registerNotificationEvents() {
  notifee.onBackgroundEvent(async () => {});

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
