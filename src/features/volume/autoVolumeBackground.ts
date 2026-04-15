import { NativeModules, Platform } from "react-native";

type AutoVolumeBackgroundModuleType = {
  startOrUpdate(config: {
    isActive: boolean;
    timerMs: number;
    targetVolume: number;
  }): Promise<void>;
  stop(): Promise<void>;
};

const nativeModule = NativeModules.AutoVolumeBackground as
  | AutoVolumeBackgroundModuleType
  | undefined;

export async function startOrUpdateAutoVolumeBackground(config: {
  isActive: boolean;
  timerMs: number;
  targetVolume: number;
}) {
  if (Platform.OS !== "android") {
    return;
  }

  if (!nativeModule) {
    throw new Error("AutoVolumeBackground native module is unavailable.");
  }

  await nativeModule.startOrUpdate(config);
}

export async function stopAutoVolumeBackground() {
  if (Platform.OS !== "android" || !nativeModule) {
    return;
  }

  await nativeModule.stop();
}
