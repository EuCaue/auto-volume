import { KEYS, storage } from "@/utils/storage";
import { dismissServiceNotification } from "../notifications/notificationService";
import BackgroundService from "react-native-background-actions";

export async function stopVolumeScheduler(cb?: CallableFunction) {
  if (BackgroundService.isRunning()) {
    storage.set(KEYS.isTaskRunning, false);
    await BackgroundService.stop();
    await dismissServiceNotification();
    cb?.();
  }
}
