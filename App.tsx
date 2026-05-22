import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import MasterScreen from './src/screens/MasterScreen';
import TimerListScreen from './src/screens/TimerListScreen';
import {
  initTimerNotifications,
  scheduleTimerNotification,
  cancelTimerNotification,
} from './src/services/timerNotifications';
import {
  TimerMaster,
  ActiveTimer,
  TimerHistory,
  ScreenName,
  PendingAlert,
} from './src/types';

const INITIAL_MASTERS: TimerMaster[] = [
  { id: 'preset-1', name: 'にんにく醤油唐揚げ', duration: 240 },
  { id: 'preset-2', name: '春巻き', duration: 180 },
  { id: 'preset-3', name: 'フライドチキン', duration: 300 },
];

const MAX_HISTORY = 10;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  useKeepAwake();

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('List');
  const [masters, setMasters] = useState<TimerMaster[]>(INITIAL_MASTERS);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [history, setHistory] = useState<TimerHistory[]>([]);
  const [alertQueue, setAlertQueue] = useState<PendingAlert[]>([]);
  const pendingAlert = alertQueue[0] ?? null;

  const notificationIdsRef = useRef<Record<string, string>>({});
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initTimerNotifications();
  }, []);

  const addHistoryEntry = useCallback((name: string) => {
    const entry: TimerHistory = {
      id: generateId(),
      name,
      completedAt: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
  }, []);

  const cancelNotification = useCallback(async (timerId: string) => {
    const notificationId = notificationIdsRef.current[timerId];
    await cancelTimerNotification(notificationId);
    delete notificationIdsRef.current[timerId];
  }, []);

  const scheduleNotification = useCallback(
    async (timerId: string, name: string, seconds: number) => {
      const notificationId = await scheduleTimerNotification(name, seconds);
      if (notificationId) {
        notificationIdsRef.current[timerId] = notificationId;
      }
    },
    []
  );

  const handleTimerComplete = useCallback(
    (timer: ActiveTimer) => {
      addHistoryEntry(timer.name);
      setAlertQueue((queue) => [
        ...queue,
        { id: timer.id, name: timer.name },
      ]);
    },
    [addHistoryEntry]
  );

  useEffect(() => {
    if (activeTimers.length === 0) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    if (tickIntervalRef.current) return;

    tickIntervalRef.current = setInterval(() => {
      setActiveTimers((prev) => {
        if (prev.length === 0) return prev;

        const stillRunning: ActiveTimer[] = [];
        const completed: ActiveTimer[] = [];

        for (const timer of prev) {
          if (timer.remainingSeconds <= 1) {
            completed.push(timer);
          } else {
            stillRunning.push({
              ...timer,
              remainingSeconds: timer.remainingSeconds - 1,
            });
          }
        }

        if (completed.length > 0) {
          completed.forEach((t) => {
            handleTimerComplete(t);
            cancelNotification(t.id);
          });
        }

        return stillRunning;
      });
    }, 1000);

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [activeTimers.length, handleTimerComplete, cancelNotification]);

  const handleStartTimer = useCallback(
    async (master: TimerMaster) => {
      const timerId = generateId();
      const newTimer: ActiveTimer = {
        id: timerId,
        masterId: master.id,
        name: master.name,
        remainingSeconds: master.duration,
        totalSeconds: master.duration,
        intervalId: null,
      };

      setActiveTimers((prev) => [...prev, newTimer]);
      await scheduleNotification(timerId, master.name, master.duration);
    },
    [scheduleNotification]
  );

  const handleStopTimer = useCallback(
    async (timerId: string) => {
      await cancelNotification(timerId);
      setActiveTimers((prev) => prev.filter((t) => t.id !== timerId));
    },
    [cancelNotification]
  );

  const handleAddMaster = useCallback((name: string, durationSeconds: number) => {
    const newMaster: TimerMaster = {
      id: generateId(),
      name,
      duration: durationSeconds,
    };
    setMasters((prev) => [...prev, newMaster]);
  }, []);

  const handleDeleteMaster = useCallback((id: string) => {
    setMasters((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleDismissAlert = useCallback(() => {
    setAlertQueue((queue) => queue.slice(1));
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      {currentScreen === 'List' ? (
        <TimerListScreen
          masters={masters}
          activeTimers={activeTimers}
          history={history}
          pendingAlert={pendingAlert}
          onStartTimer={handleStartTimer}
          onStopTimer={handleStopTimer}
          onDismissAlert={handleDismissAlert}
          onNavigateToMaster={() => setCurrentScreen('Master')}
        />
      ) : (
        <MasterScreen
          masters={masters}
          onAddMaster={handleAddMaster}
          onDeleteMaster={handleDeleteMaster}
          onNavigateToList={() => setCurrentScreen('List')}
        />
      )}
    </>
  );
}
