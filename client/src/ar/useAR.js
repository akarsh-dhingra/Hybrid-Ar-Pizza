import { useEffect, useState } from 'react';
import { computeQrTarget } from './qrPose.js';

export function useAR({ corners, enabled }) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setTarget(null);
      return;
    }
    if (!corners) return;
    const next = computeQrTarget(corners);
    if (next) {
      setTarget({
        ...next,
        lastSeen: performance.now()
      });
    }
  }, [corners, enabled]);

  return target;
}
