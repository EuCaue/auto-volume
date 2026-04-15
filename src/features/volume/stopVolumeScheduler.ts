import { KEYS, storage } from "@/utils/storage";
import BackgroundService from "react-native-background-actions";

export async function stopVolumeScheduler(cb?: CallableFunction) {
  storage.set(KEYS.isTaskRunning, false);
  storage.set(KEYS.executeAt, 0);
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
  cb?.();
}
