import notifee, { AndroidAction } from "@notifee/react-native";

const NOTIFICATION_ID = "volume-service";

type ServiceNotificationInput = {
  title?: string;
  body?: string;
};

export async function upsertServiceNotification(
  input?: ServiceNotificationInput,
  actions?: AndroidAction[],
) {
  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: input?.title ?? "Volume Timer running",
    body: input?.body ?? "Waiting...",
    android: {
      channelId: "service",
      asForegroundService: true,
      ongoing: true,
      actions: actions ?? [
        {
          title: "Stop",
          pressAction: { id: "stop_service" },
        },
        {
          title: "Run",
          pressAction: { id: "run_now" },
        },
      ],
    },
  });
}

export async function dismissServiceNotification() {
  await notifee.cancelNotification(NOTIFICATION_ID);
  await notifee.stopForegroundService();
}
