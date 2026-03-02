import { useState, useCallback, useEffect, useRef } from "react";
import { TimerEntry } from "@/types/timer";

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = "time-tracker-timers";

function loadTimers(): TimerEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTimers(timers: TimerEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

export function useTimers() {
  const [timers, setTimers] = useState<TimerEntry[]>(loadTimers);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<number>();

  // Persist on change
  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Tick every 100ms for live display
  useEffect(() => {
    intervalRef.current = window.setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(intervalRef.current);
  }, []);

  const addTimer = useCallback((name: string, description: string) => {
    const entry: TimerEntry = {
      id: generateId(),
      name,
      description,
      isRunning: false,
      isFixed: false,
      elapsedMs: 0,
      lastStartedAt: null,
    };
    setTimers((prev) => [...prev, entry]);
  }, []);

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startTimer = useCallback((id: string) => {
    const now = Date.now();
    setTimers((prev) => {
      const timerBeingStarted = prev.find((t) => t.id === id);
      const isStartedTimerFixed = timerBeingStarted?.isFixed ?? false;

      return prev.map((t) => {
        if (t.id === id) {
          // only the requested timer is started
          return { ...t, isRunning: true, lastStartedAt: now };
        }
        // if the timer we’re starting is **not fixed**, stop any other
        // **non‑fixed** running timers.
        // – fixed timers never stop anything
        // – non‑fixed timers never stop fixed ones
        if (!isStartedTimerFixed && t.isRunning && !t.isFixed) {
          return {
            ...t,
            isRunning: false,
            elapsedMs: t.elapsedMs + (t.lastStartedAt ? now - t.lastStartedAt : 0),
            lastStartedAt: null,
          };
        }
        return t;
      });
    });
  }, []);

  const stopTimer = useCallback((id: string) => {
    const now = Date.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id && t.isRunning) {
          return {
            ...t,
            isRunning: false,
            elapsedMs: t.elapsedMs + (t.lastStartedAt ? now - t.lastStartedAt : 0),
            lastStartedAt: null,
          };
        }
        return t;
      })
    );
  }, []);

  const stopAllTimers = useCallback(() => {
    const now = Date.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.isRunning) {
          return {
            ...t,
            isRunning: false,
            elapsedMs: t.elapsedMs + (t.lastStartedAt ? now - t.lastStartedAt : 0),
            lastStartedAt: null,
          };
        }
        return t;
      })
    );
  }, []);

  const toggleFixed = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFixed: !t.isFixed } : t))
    );
  }, []);

  const updateTimer = useCallback((id: string, name: string, description: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name, description } : t))
    );
  }, []);

  const getElapsed = useCallback(
    (timer: TimerEntry) => {
      // Use tick to force recalculation
      void tick;
      if (timer.isRunning && timer.lastStartedAt) {
        return timer.elapsedMs + (Date.now() - timer.lastStartedAt);
      }
      return timer.elapsedMs;
    },
    [tick]
  );

  const exportToClipboard = useCallback(() => {
    const now = Date.now();
    const lines = timers.map((t) => {
      const totalMs = t.isRunning && t.lastStartedAt
        ? t.elapsedMs + (now - t.lastStartedAt)
        : t.elapsedMs;
      const hours = Math.floor(totalMs / 3600000);
      const mins = Math.floor((totalMs % 3600000) / 60000);
      const secs = Math.floor((totalMs % 60000) / 1000);
      const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      return `Title: ${t.name}\nTime: ${timeStr}\nFixed: ${t.isFixed ? "Yes" : "No"}\nDescription: ${t.description}\n`;
    });
    return lines.join("\n---\n\n");
  }, [timers]);

  return {
    timers,
    addTimer,
    removeTimer,
    startTimer,
    stopTimer,
    stopAllTimers,
    toggleFixed,
    updateTimer,
    getElapsed,
    exportToClipboard,
  };
}
