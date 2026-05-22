import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Expo Go で実行中か */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/**
 * バックグラウンドのローカル通知を使えるか。
 * Android の Expo Go（SDK 53+）ではリモート/ローカル通知ともに非対応。
 */
export function canUseBackgroundNotifications(): boolean {
  return !(isExpoGo() && Platform.OS === 'android');
}
