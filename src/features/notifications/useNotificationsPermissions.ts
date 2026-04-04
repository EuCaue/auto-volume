import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { useEffect, useState } from "react";

export function useNotificationsPermissions() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    async function setup() {
      const settings = await notifee.requestPermission();
      const isGranted =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
      setGranted(isGranted);
    }
    setup();
  }, []);

  return { permissionGranted: granted };
}
