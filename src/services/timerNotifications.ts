import { Platform } from 'react-native';
import { canUseBackgroundNotifications } from '../utils/runtime';

async function loadNotifications() {
  return import('expo-notifications');
}

export async function initTimerNotifications(): Promise<void> {
  if (!canUseBackgroundNotifications()) return;

  const Notifications = await loadNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('通知の権限が許可されていません');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timer', {
      name: 'キッチンタイマー',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      sound: 'default',
    });
  }
}

export async function scheduleTimerNotification(
  name: string,
  seconds: number
): Promise<string | null> {
  if (!canUseBackgroundNotifications()) return null;

  const Notifications = await loadNotifications();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '調理完了',
      body: `${name}の調理が完了しました！`,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'timer' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, seconds),
    },
  });
}

export async function cancelTimerNotification(
  notificationId: string | null | undefined
): Promise<void> {
  if (!notificationId || !canUseBackgroundNotifications()) return;

  const Notifications = await loadNotifications();
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
