import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { ARButton, XR, useXREvent } from '@react-three/xr';
import * as THREE from 'three';
import PizzaModel from './PizzaModel.jsx';

function XRPlacement({ pizza, userControls }) {
  const reticleRef = useRef(null);
  const [placed, setPlaced] = useState(false);
  const [pizzaPos, setPizzaPos] = useState(new THREE.Vector3(0, 0, -1));
  const { gl, camera } = useThree();
  const hitTestSourceRef = useRef(null);
  const hitTestRequestedRef = useRef(false);

  useEffect(() => {
    if (reticleRef.current) {
      reticleRef.current.matrixAutoUpdate = false;
    }
  }, []);

  useXREvent('select', () => {
    if (!pizza) return;
    if (!reticleRef.current) return;
    if (reticleRef.current.visible) {
      setPizzaPos(reticleRef.current.position.clone());
    } else {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      setPizzaPos(camera.position.clone().add(direction.multiplyScalar(1)));
    }
    setPlaced(true);
  });

  useFrame((_, delta) => {
    const session = gl.xr.getSession();
    if (!session) return;

    if (!hitTestRequestedRef.current) {
      hitTestRequestedRef.current = true;
      if (session.requestHitTestSource) {
        session
          .requestReferenceSpace('viewer')
          .then((viewerSpace) => session.requestHitTestSource({ space: viewerSpace }))
          .then((hitTestSource) => {
            hitTestSourceRef.current = hitTestSource;
          })
          .catch(() => {
            hitTestSourceRef.current = null;
          });
      }

      session.addEventListener('end', () => {
        hitTestRequestedRef.current = false;
        hitTestSourceRef.current = null;
      });
    }

    const frame = gl.xr.getFrame();
    const referenceSpace = gl.xr.getReferenceSpace();
    if (!frame || !referenceSpace || !hitTestSourceRef.current || !reticleRef.current) return;

    const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
    if (hitTestResults.length) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace);
      if (pose) {
        reticleRef.current.visible = true;
        reticleRef.current.matrix.fromArray(pose.transform.matrix);
        reticleRef.current.matrix.decompose(
          reticleRef.current.position,
          reticleRef.current.quaternion,
          reticleRef.current.scale
        );
      }
    } else if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
  });

  return (
    <>
      <group ref={reticleRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshStandardMaterial color="#f1591f" emissive="#f1591f" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {placed && (
        <group
          position={[
            pizzaPos.x + userControls.offsetX,
            pizzaPos.y,
            pizzaPos.z + userControls.offsetY
          ]}
          rotation={[0, THREE.MathUtils.degToRad(userControls.rotation), 0]}
          scale={[userControls.scale, userControls.scale, userControls.scale]}
        >
          {pizza ? <PizzaModel data={pizza} /> : null}
        </group>
      )}
    </>
  );
}

function FallbackScene({ pizza, userControls }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
      <group
        position={[userControls.offsetX, 0, userControls.offsetY]}
        rotation={[0, THREE.MathUtils.degToRad(userControls.rotation), 0]}
        scale={[userControls.scale, userControls.scale, userControls.scale]}
      >
        {pizza ? <PizzaModel data={pizza} /> : null}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial transparent opacity={0.25} />
      </mesh>
      <OrbitControls enablePan enableRotate enableZoom />
    </>
  );
}

export default function MarkerlessARView({ enabled, pizza, userControls, onCanvasReady, onXrSupport }) {
  const [xrSupported, setXrSupported] = useState(false);

  useEffect(() => {
    let active = true;
    const checkSupport = async () => {
      if (!navigator.xr) {
        if (active) {
          setXrSupported(false);
          onXrSupport?.(false);
        }
        return;
      }
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (active) {
          setXrSupported(supported);
          onXrSupport?.(supported);
        }
      } catch (error) {
        if (active) {
          setXrSupported(false);
          onXrSupport?.(false);
        }
      }
    };

    checkSupport();
    return () => {
      active = false;
    };
  }, [onXrSupport]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        className="absolute inset-0 touch-none"
        shadows
        camera={{ fov: 55, position: [0, 1.4, 2.4], near: 0.01, far: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={(state) => onCanvasReady?.(state.gl.domElement)}
      >
        {xrSupported ? (
          <XR>
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 4, 2]} intensity={1.2} />
            <XRPlacement pizza={pizza} userControls={userControls} />
            <Html fullscreen zIndexRange={[10, 20]}>
              <div
                className="pointer-events-auto absolute left-3 top-3 sm:left-4 sm:top-4"
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
              >
                {pizza ? (
                  <ARButton
                    className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-glow"
                    sessionInit={{ requiredFeatures: ['hit-test'] }}
                  />
                ) : (
                  <div className="rounded-full bg-slate-900/85 px-4 py-2 text-sm text-slate-100 shadow-glow">
                    Pick a pizza from the menu first
                  </div>
                )}
              </div>
            </Html>
          </XR>
        ) : (
          <FallbackScene pizza={pizza} userControls={userControls} />
        )}
      </Canvas>

      {!xrSupported ? (
        <div
          className="pointer-events-none absolute inset-x-3 bottom-24 mx-auto w-fit max-w-[calc(100vw-1.5rem)] rounded-3xl bg-slate-900/80 px-4 py-2 text-center text-sm text-ember-100 shadow-glow sm:inset-x-0 sm:rounded-full"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {pizza ? 'WebXR not supported. Showing interactive 3D preview.' : 'Open the scanned menu and choose a pizza to start the 3D preview.'}
        </div>
      ) : null}
    </div>
  );
}
