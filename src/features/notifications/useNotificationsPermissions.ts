import { useEffect, useState } from "react";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { AppState } from "react-native";

export function useNotificationsPermissions() {
  const [granted, setGranted] = useState(false);

  async function checkPermission() {
    const settings = await notifee.getNotificationSettings();

    const isGranted =
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    setGranted(isGranted);
  }

  useEffect(() => {
    checkPermission();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkPermission();
      }
    });

    return () => sub.remove();
  }, []);

  return { permissionGranted: granted };
}
