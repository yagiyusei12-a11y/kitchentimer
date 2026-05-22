import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import {
  TimerMaster,
  ActiveTimer,
  TimerHistory,
  PendingAlert,
} from '../types';

const ALARM_SOUND_URI =
  'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

interface TimerListScreenProps {
  masters: TimerMaster[];
  activeTimers: ActiveTimer[];
  history: TimerHistory[];
  pendingAlert: PendingAlert | null;
  onStartTimer: (master: TimerMaster) => void;
  onStopTimer: (id: string) => void;
  onDismissAlert: () => void;
  onNavigateToMaster: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  if (s === 0) return `${m}分`;
  return `${m}分${s}秒`;
}

function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export default function TimerListScreen({
  masters,
  activeTimers,
  history,
  pendingAlert,
  onStartTimer,
  onStopTimer,
  onDismissAlert,
  onNavigateToMaster,
}: TimerListScreenProps) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertShownRef = useRef<string | null>(null);

  const stopAlarm = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.release();
      } catch {
        // already released
      }
      playerRef.current = null;
    }
  };

  const startAlarm = async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });

    const player = createAudioPlayer(ALARM_SOUND_URI);
    player.loop = true;
    player.volume = 1;
    player.play();
    playerRef.current = player;

    hapticIntervalRef.current = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 350);
  };

  useEffect(() => {
    if (!pendingAlert) {
      alertShownRef.current = null;
      return;
    }

    if (alertShownRef.current === pendingAlert.id) return;
    alertShownRef.current = pendingAlert.id;

    const alertName = pendingAlert.name;

    (async () => {
      await startAlarm();

      Alert.alert(
        `${alertName}のタイマー完了`,
        '確認ボタンを押してアラームを停止してください',
        [
          {
            text: '確認',
            onPress: () => {
              stopAlarm();
              onDismissAlert();
            },
          },
        ],
        { cancelable: false }
      );
    })();

    return () => {
      stopAlarm();
    };
  }, [pendingAlert?.id]);

  const renderActiveTimer = ({ item }: { item: ActiveTimer }) => {
    const progress =
      item.totalSeconds > 0
        ? (item.totalSeconds - item.remainingSeconds) / item.totalSeconds
        : 0;
    const isUrgent = item.remainingSeconds <= 10;

    return (
      <View style={[styles.activeCard, isUrgent && styles.activeCardUrgent]}>
        <Text style={styles.activeName}>{item.name}</Text>
        <Text style={[styles.activeTime, isUrgent && styles.activeTimeUrgent]}>
          {formatTime(item.remainingSeconds)}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, progress * 100)}%` },
              isUrgent && styles.progressFillUrgent,
            ]}
          />
        </View>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => onStopTimer(item.id)}
        >
          <Text style={styles.stopButtonText}>ストップ（削除）</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>キッチンタイマー</Text>
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToMaster}>
          <Text style={styles.navButtonText}>マスタ編集</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTimers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              実行中（{activeTimers.length}件）
            </Text>
            <FlatList
              data={activeTimers}
              keyExtractor={(item) => item.id}
              renderItem={renderActiveTimer}
              scrollEnabled={false}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>メニューからスタート</Text>
        {masters.map((master) => (
          <View key={master.id} style={styles.masterRow}>
            <View style={styles.masterInfo}>
              <Text style={styles.masterName}>{master.name}</Text>
              <Text style={styles.masterDuration}>
                {formatDuration(master.duration)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStartTimer(master)}
            >
              <Text style={styles.startButtonText}>スタート</Text>
            </TouchableOpacity>
          </View>
        ))}

        {masters.length === 0 && (
          <Text style={styles.emptyText}>
            マスタにメニューを登録してください
          </Text>
        )}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>完了履歴（最大10件）</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>まだ完了履歴はありません</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <Text style={styles.historyName}>{item.name}</Text>
                <Text style={styles.historyDate}>
                  {formatHistoryDate(item.completedAt)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#e94560',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  navButton: {
    backgroundColor: '#533483',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 12,
    marginTop: 8,
  },
  activeCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#533483',
  },
  activeCardUrgent: {
    borderColor: '#e94560',
    backgroundColor: '#2d1f3d',
  },
  activeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  activeTime: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4ecca3',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  activeTimeUrgent: {
    color: '#e94560',
  },
  progressTrack: {
    height: 16,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecca3',
    borderRadius: 8,
  },
  progressFillUrgent: {
    backgroundColor: '#e94560',
  },
  stopButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  masterDuration: {
    fontSize: 18,
    color: '#4ecca3',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 12,
    marginLeft: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
  },
  historySection: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#533483',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  historyName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    color: '#888',
  },
});
