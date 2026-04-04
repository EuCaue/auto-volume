import notifee from '@notifee/react-native';

export async function createChannel() {
  await notifee.createChannel({
    id: 'service',
    name: 'Service Notifications',
  });
}
