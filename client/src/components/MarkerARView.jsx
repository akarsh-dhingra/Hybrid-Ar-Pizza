import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import PizzaModel from './PizzaModel.jsx';
import { useCameraStream } from '../hooks/useCameraStream.js';
import { useQRScanner } from '../hooks/useQRScanner.js';
import { useAR } from '../ar/useAR.js';
import { computeDepth, screenToWorld, worldScaleFromPixels } from '../ar/qrPose.js';

function MarkerScene({ target, pizza, userControls, videoSize }) {
  const groupRef = useRef(null);
  const targetRef = useRef(target);
  const { camera, size } = useThree();
  const scaleRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const now = performance.now();
    const current = targetRef.current;
    const isVisible = current && now - current.lastSeen < 650;

    const smoothing = 1 - Math.exp(-6 * delta);

    if (!isVisible || !videoSize.width || !videoSize.height) {
      scaleRef.current.lerp(new THREE.Vector3(0, 0, 0), smoothing);
      group.scale.copy(scaleRef.current);
      group.visible = scaleRef.current.length() > 0.001;
      return;
    }

    // Match the video's object-cover scaling so QR pixels map to screen pixels.
    const scale = Math.max(size.width / videoSize.width, size.height / videoSize.height);
    const displayWidth = videoSize.width * scale;
    const displayHeight = videoSize.height * scale;
    const offsetX = (displayWidth - size.width) / 2;
    const offsetY = (displayHeight - size.height) / 2;

    const center = {
      x: current.center.x * scale - offsetX,
      y: current.center.y * scale - offsetY
    };

    const sizePx = current.size * scale;
    // Approximate depth from QR size to place the pizza in front of the camera.
    const depth = computeDepth(sizePx, size);
    const worldPos = screenToWorld(center, depth, camera, size);
    const baseScale = worldScaleFromPixels(sizePx, depth, camera, size) * 1.1;
    const rotation = current.rotation + THREE.MathUtils.degToRad(userControls.rotation || 0);

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const offset = right.multiplyScalar(userControls.offsetX).add(up.multiplyScalar(userControls.offsetY));

    worldPos.add(offset);

    scaleRef.current.lerp(new THREE.Vector3(baseScale * userControls.scale, baseScale * userControls.scale, baseScale * userControls.scale), smoothing);
    group.position.lerp(worldPos, smoothing);
    group.rotation.set(Math.PI / 2, 0, rotation);
    group.scale.copy(scaleRef.current);
    group.visible = true;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group ref={groupRef}>
        {pizza ? <PizzaModel data={pizza} /> : null}
      </group>
      {pizza ? (
        <ContactShadows
          position={[0, -0.4, 0]}
          opacity={0.35}
          scale={3}
          blur={2.2}
          far={1}
        />
      ) : null}
    </>
  );
}

export default function MarkerARView({
  enabled,
  pizza,
  userControls,
  onQrPayload,
  onQrRaw,
  onQrError,
  onScanStatus,
  onCameraStatus,
  onVideoReady,
  onCanvasReady
}) {
  const { videoRef, status, error, startCamera } = useCameraStream({ enabled });
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const qrState = useQRScanner({ videoRef, enabled: status === 'ready' });
  const target = useAR({ corners: qrState.corners, enabled: status === 'ready' });

  useEffect(() => {
    onCameraStatus?.(status);
  }, [status, onCameraStatus]);

  useEffect(() => {
    if (error) {
      onQrError?.(error);
    }
  }, [error, onQrError]);

  useEffect(() => {
    if (qrState.raw) {
      onQrRaw?.(qrState.raw);
    }
    if (qrState.data) {
      onQrPayload?.(qrState.data);
    }
    if (qrState.error) {
      onQrError?.(qrState.error);
    }
  }, [qrState.raw, qrState.data, qrState.error, onQrPayload, onQrRaw, onQrError]);

  useEffect(() => {
    onScanStatus?.(qrState.status);
  }, [qrState.status, onScanStatus]);

  useEffect(() => {
    if (videoRef.current && status === 'ready') {
      onVideoReady?.(videoRef.current);
      const handleLoaded = () => {
        if (videoRef.current) {
          setVideoSize({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
        }
      };
      videoRef.current.addEventListener('loadedmetadata', handleLoaded);
      handleLoaded();
      return () => videoRef.current?.removeEventListener('loadedmetadata', handleLoaded);
    }
    return undefined;
  }, [status, videoRef, onVideoReady]);

  const overlayMessage = useMemo(() => {
    if (status === 'requesting') return 'Requesting camera access...';
    if (status === 'needs-user-action') return 'Mobile browsers sometimes need one tap before the camera can start.';
    if (status === 'error') return 'Camera unavailable. Check permissions or try the retry button.';
    if (qrState.status === 'scanning') return 'Scanning QR code...';
    if (qrState.status === 'invalid') return 'QR detected but JSON is invalid.';
    return '';
  }, [status, qrState.status]);

  const showCameraAction = status === 'needs-user-action' || status === 'error';

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover bg-slate-950"
        muted
        autoPlay
        playsInline
      />
      <Canvas
        className="absolute inset-0 touch-none"
        shadows
        camera={{ fov: 50, position: [0, 0, 0], near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={(state) => {
          onCanvasReady?.(state.gl.domElement);
        }}
      >
        <MarkerScene target={target} pizza={pizza} userControls={userControls} videoSize={videoSize} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="scan-ring h-44 w-44 rounded-full border border-ember-400/60" />
      </div>

      {overlayMessage ? (
        <div className="absolute inset-x-3 bottom-24 z-10 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] flex-col items-center gap-3 rounded-3xl bg-slate-950/82 px-4 py-3 text-center text-sm text-ember-100 shadow-glow sm:inset-x-0 sm:rounded-full">
          <p className="pointer-events-none">{overlayMessage}</p>
          {showCameraAction ? (
            <button
              type="button"
              onClick={() => startCamera(true)}
              className="pointer-events-auto rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-ember-400"
            >
              {status === 'error' ? 'Retry Camera' : 'Start Camera'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
