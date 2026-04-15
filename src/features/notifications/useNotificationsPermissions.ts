import { useEffect, useState } from "react";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { AppState, Platform } from "react-native";

export function useNotificationsPermissions() {
  const [granted, setGranted] = useState(false);

  async function checkPermission() {
    const settings = await notifee.getNotificationSettings();
    const isGranted =
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    setGranted(isGranted);

    return isGranted;
  }

  async function requestPermission() {
    if (Platform.OS !== "android") {
      return checkPermission();
    }

    const settings = await notifee.requestPermission();
    const isGranted =
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    setGranted(isGranted);

    return isGranted;
  }

  useEffect(() => {
    void checkPermission();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void checkPermission();
      }
    });

    return () => sub.remove();
  }, []);

  return { permissionGranted: granted, requestPermission };
}
