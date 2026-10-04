import { useEffect, useState } from 'react';

export function usePasswordResetCooldown() {
  const [retryAt, setRetryAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!retryAt) return;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  return {
    secondsLeft,
    startCooldown: () => {
      setSecondsLeft(60);
      setRetryAt(Date.now() + 60_000);
    },
  };
}
