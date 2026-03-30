import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { parseQrPayload } from '../utils/validators.js';

function cornersFromLocation(location) {
  if (!location) return null;
  return [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner
  ].map((corner) => ({ x: corner.x, y: corner.y }));
}

export function useQRScanner({ videoRef, enabled }) {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    raw: '',
    error: '',
    corners: null,
    lastSeen: 0
  });
  const lastRawRef = useRef('');
  const rafRef = useRef(0);
  const canvasRef = useRef(null);
  const lastScanRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, status: 'idle' }));
      return undefined;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvasRef.current = canvas;

    const scan = (time) => {
      if (!videoRef.current || !ctx) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      if (time - lastScanRef.current < 80) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }
      lastScanRef.current = time;

      const video = videoRef.current;
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, width, height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code?.data) {
        const raw = code.data.trim();
        const parsed = parseQrPayload(raw);
        const corners = cornersFromLocation(code.location);
        const now = performance.now();

        if (raw !== lastRawRef.current) {
          lastRawRef.current = raw;
          setState({
            status: parsed.ok ? 'found' : 'invalid',
            data: parsed.ok ? parsed.data : null,
            raw,
            error: parsed.ok ? '' : parsed.error,
            corners,
            lastSeen: now
          });
        } else {
          setState((prev) => ({
            ...prev,
            status: parsed.ok ? 'found' : 'invalid',
            data: parsed.ok ? prev.data ?? parsed.data : null,
            error: parsed.ok ? '' : parsed.error,
            corners,
            lastSeen: now
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          status: prev.data ? 'lost' : 'scanning',
          corners: null
        }));
      }

      rafRef.current = requestAnimationFrame(scan);
    };

    rafRef.current = requestAnimationFrame(scan);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, videoRef]);

  return state;
}
