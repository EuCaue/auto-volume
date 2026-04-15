import { KEYS, storage } from "@/utils/storage";

import { stopAutoVolumeBackground } from "./autoVolumeBackground";

export async function stopVolumeScheduler(cb?: CallableFunction) {
  storage.set(KEYS.isTaskRunning, false);
  storage.set(KEYS.executeAt, 0);
  await stopAutoVolumeBackground();
  cb?.();
}
