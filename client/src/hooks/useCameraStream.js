import { useEffect, useRef, useState } from 'react';

export function useCameraStream({ enabled }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    let stream;
    let isMounted = true;

    const start = async () => {
      setStatus('requesting');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (!isMounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          try {
            await videoRef.current.play();
          } catch (playError) {
            // Some browsers require a user gesture; the video will still render when allowed.
          }
        }
        setStatus('ready');
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || 'Camera permission denied.');
        setStatus('error');
      }
    };

    start();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enabled]);

  return { videoRef, status, error };
}
