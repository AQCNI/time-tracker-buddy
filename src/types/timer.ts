export interface TimerEntry {
  id: string;
  name: string;
  description: string;
  isRunning: boolean;
  isFixed: boolean;
  elapsedMs: number; // accumulated milliseconds
  lastStartedAt: number | null; // timestamp when last started
}
