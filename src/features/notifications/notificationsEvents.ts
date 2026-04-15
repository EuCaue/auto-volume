import { EventType } from "@notifee/react-native";
import { VolumeManager } from "react-native-volume-manager";

import { DEFAULT_VALUES, KEYS, storage } from "@/utils/storage";

import { stopVolumeScheduler } from "../volume/stopVolumeScheduler";

type NotificationEvent = {
  type: EventType;
  detail: {
    pressAction?: {
      id?: string;
    };
  };
};

export async function handleNotificationEvent({
  type,
  detail,
}: NotificationEvent) {
  if (type !== EventType.ACTION_PRESS) {
    return;
  }

  const action = detail.pressAction?.id;

  if (action === "stop_service") {
    await stopVolumeScheduler();
  }

  if (action === "run_now") {
    await stopVolumeScheduler(() => {
      const volumeValue =
        (storage.getNumber(KEYS.volumeValue) ?? DEFAULT_VALUES.volumeValue) /
        100;

      void VolumeManager.setVolume(Number(volumeValue.toFixed(2)));
    });
  }
}
