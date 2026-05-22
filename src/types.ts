export interface TimerMaster {
  id: string;
  name: string;
  duration: number;
}

export interface ActiveTimer {
  id: string;
  masterId: string;
  name: string;
  remainingSeconds: number;
  totalSeconds: number;
  intervalId: any;
}

export interface TimerHistory {
  id: string;
  name: string;
  completedAt: string;
}

export type ScreenName = 'List' | 'Master';

export interface PendingAlert {
  id: string;
  name: string;
}
