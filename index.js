import notifee from "@notifee/react-native";

import { handleNotificationEvent } from "./src/features/notifications/notificationsEvents";
import { createChannel } from "./src/features/notifications/notificationsChannel";

void createChannel();

notifee.onBackgroundEvent(handleNotificationEvent);
notifee.onForegroundEvent(handleNotificationEvent);

require("expo-router/entry");
