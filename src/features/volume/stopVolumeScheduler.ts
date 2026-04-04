import { KEYS, storage } from "@/utils/storage";
import { dismissServiceNotification } from "../notifications/notificationService";
import BackgroundService from "react-native-background-actions";

export async function stopVolumeScheduler(cb?: CallableFunction) {
  storage.set(KEYS.isTaskRunning, false);
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
  await dismissServiceNotification();
  cb?.();
}
