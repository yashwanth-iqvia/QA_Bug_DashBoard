import { useEffect, useState } from 'react';

export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Countdown until next auto-refresh; resets when lastRefreshAt changes. */
export function useRefreshCountdown(intervalMs: number, enabled: boolean, lastRefreshAt: number | null) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(intervalMs / 1000));

  useEffect(() => {
    if (!enabled || !lastRefreshAt) {
      setSecondsLeft(Math.ceil(intervalMs / 1000));
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - lastRefreshAt;
      const remaining = Math.max(0, intervalMs - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled, lastRefreshAt, intervalMs]);

  return {
    secondsLeft,
    label: formatCountdown(secondsLeft),
    isDue: secondsLeft <= 0,
  };
}
