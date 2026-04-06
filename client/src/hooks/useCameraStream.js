import { useCallback, useEffect, useRef, useState } from 'react';

const CAMERA_ATTEMPTS = [
  {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  },
  {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  },
  {
    video: {
      facingMode: 'environment'
    },
    audio: false
  },
  {
    video: true,
    audio: false
  }
];

function formatCameraError(error) {
  switch (error?.name) {
    case 'NotAllowedError':
      return 'Camera access was blocked. Allow camera permission in your browser settings.';
    case 'NotFoundError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
      return 'The camera is busy in another app. Close it there and try again.';
    case 'OverconstrainedError':
      return 'The requested camera mode is not available on this phone. Retrying with a fallback can help.';
    default:
      return error?.message || 'Camera permission denied.';
  }
}

export function useCameraStream({ enabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }
  }, []);

  const attachStream = useCallback(async (stream) => {
    streamRef.current = stream;
    const video = videoRef.current;

    if (!video) {
      setStatus('ready');
      return;
    }

    video.srcObject = stream;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('muted', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    await video.play();
    setStatus('ready');
  }, []);

  const startCamera = useCallback(async (fromUserGesture = false) => {
    if (!enabled) return false;

    if (!window.isSecureContext) {
      setError('Camera access on deployed mobile browsers requires HTTPS.');
      setStatus('error');
      return false;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support mobile camera access.');
      setStatus('error');
      return false;
    }

    setError('');
    setStatus('requesting');
    stopCamera();

    let lastError = null;

    for (const constraints of CAMERA_ATTEMPTS) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        try {
          await attachStream(stream);
          return true;
        } catch (playError) {
          lastError = playError;
          stopCamera();
          if (!fromUserGesture) {
            setError('Tap Start Camera to continue on this mobile browser.');
            setStatus('needs-user-action');
            return false;
          }
        }
      } catch (streamError) {
        lastError = streamError;
      }
    }

    if (!fromUserGesture && lastError?.name === 'NotAllowedError') {
      setError('Tap Start Camera and allow permission to continue.');
      setStatus('needs-user-action');
      return false;
    }

    setError(formatCameraError(lastError));
    setStatus('error');
    return false;
  }, [attachStream, enabled, stopCamera]);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      setError('');
      setStatus('idle');
      return undefined;
    }

    startCamera(false);

    return () => {
      stopCamera();
    };
  }, [enabled, startCamera, stopCamera]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopCamera();
        return;
      }

      if (!streamRef.current) {
        startCamera(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', stopCamera);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', stopCamera);
    };
  }, [enabled, startCamera, stopCamera]);

  return { videoRef, status, error, startCamera, stopCamera };
}
