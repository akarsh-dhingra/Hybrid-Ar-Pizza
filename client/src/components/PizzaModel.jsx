import { useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getRadiusForSize, getSizeMeasurement, normalizeToppings, TOPPING_STYLES } from '../utils/pizza.js';
import { seededRandom } from '../utils/random.js';

function generatePositions(count, radius, seedText) {
  const rand = seededRandom(seedText);
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const r = Math.sqrt(rand()) * radius * 0.85;
    const theta = rand() * Math.PI * 2;
    positions.push({
      x: Math.cos(theta) * r,
      z: Math.sin(theta) * r,
      rot: rand() * Math.PI * 2,
      scale: 0.75 + rand() * 0.5
    });
  }
  return positions;
}

function ToppingCluster({ name, radius, topY }) {
  const style = TOPPING_STYLES[name] || {
    count: 14,
    color: '#8bd1a9',
    roughness: 0.9,
    metalness: 0.1,
    shape: 'chunk'
  };

  const positions = useMemo(
    () => generatePositions(style.count, radius, `topping-${name}-${radius}`),
    [name, radius, style.count]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: style.color,
        roughness: style.roughness ?? 0.7,
        metalness: style.metalness ?? 0.1
      }),
    [style.color, style.roughness, style.metalness]
  );

  const discGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, radius * 0.025, 24),
    [radius]
  );

  const ringGeometry = useMemo(
    () => new THREE.TorusGeometry(radius * 0.08, radius * 0.025, 10, 24),
    [radius]
  );

  const chunkGeometry = useMemo(
    () => new THREE.DodecahedronGeometry(radius * 0.07),
    [radius]
  );

  const cubeGeometry = useMemo(
    () => new THREE.BoxGeometry(radius * 0.12, radius * 0.08, radius * 0.12),
    [radius]
  );

  const mushroomCap = useMemo(
    () => new THREE.SphereGeometry(radius * 0.08, 18, 12),
    [radius]
  );

  const mushroomStem = useMemo(
    () => new THREE.CylinderGeometry(radius * 0.03, radius * 0.04, radius * 0.07, 12),
    [radius]
  );

  const leafGeometry = useMemo(
    () => new THREE.PlaneGeometry(radius * 0.18, radius * 0.08, 1, 1),
    [radius]
  );

  const splashGeometry = useMemo(
    () => new THREE.CircleGeometry(radius * 0.08, 20),
    [radius]
  );

  return (
    <group>
      {positions.map((pos, index) => {
        const key = `${name}-${index}`;
        if (style.shape === 'disc') {
          return (
            <mesh
              key={key}
              geometry={discGeometry}
              material={material}
              position={[pos.x, topY, pos.z]}
              rotation={[Math.PI / 2, 0, pos.rot]}
              scale={pos.scale}
              castShadow
            />
          );
        }
        if (style.shape === 'ring') {
          return (
            <mesh
              key={key}
              geometry={ringGeometry}
              material={material}
              position={[pos.x, topY + radius * 0.02, pos.z]}
              rotation={[Math.PI / 2, 0, pos.rot]}
              scale={pos.scale}
              castShadow
            />
          );
        }
        if (style.shape === 'mushroom') {
          return (
            <group key={key} position={[pos.x, topY + radius * 0.03, pos.z]} rotation={[0, pos.rot, 0]}>
              <mesh geometry={mushroomCap} material={material} position={[0, radius * 0.05, 0]} castShadow />
              <mesh geometry={mushroomStem} material={material} position={[0, 0, 0]} castShadow />
            </group>
          );
        }
        if (style.shape === 'leaf') {
          return (
            <mesh
              key={key}
              geometry={leafGeometry}
              material={material}
              position={[pos.x, topY + radius * 0.02, pos.z]}
              rotation={[Math.PI / 2, 0, pos.rot]}
              scale={pos.scale}
              castShadow
            />
          );
        }
        if (style.shape === 'cube') {
          return (
            <mesh
              key={key}
              geometry={cubeGeometry}
              material={material}
              position={[pos.x, topY + radius * 0.03, pos.z]}
              rotation={[pos.rot, pos.rot, 0]}
              scale={pos.scale}
              castShadow
            />
          );
        }
        if (style.shape === 'splash') {
          return (
            <mesh
              key={key}
              geometry={splashGeometry}
              material={material}
              position={[pos.x, topY + radius * 0.025, pos.z]}
              rotation={[-Math.PI / 2, 0, pos.rot]}
              scale={pos.scale}
              castShadow
            />
          );
        }
        return (
          <mesh
            key={key}
            geometry={chunkGeometry}
            material={material}
            position={[pos.x, topY, pos.z]}
            rotation={[pos.rot, pos.rot, pos.rot]}
            scale={pos.scale}
            castShadow
          />
        );
      })}
    </group>
  );
}

export default function PizzaModel({ data }) {
  if (!data) {
    return null;
  }

  const radius = getRadiusForSize(data?.size || 'medium');
  const measurement = getSizeMeasurement(data?.size || 'medium');
  const toppings = normalizeToppings(data?.toppings || []);

  const doughMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e2b07e',
        roughness: 0.85,
        metalness: 0.05
      }),
    []
  );

  const crustMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c98a52',
        roughness: 0.8,
        metalness: 0.05
      }),
    []
  );

  const sauceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b93a2b',
        roughness: 0.7,
        metalness: 0.05
      }),
    []
  );

  const cheeseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f5d48a',
        roughness: 0.6,
        metalness: 0.05
      }),
    []
  );

  const baseThickness = radius * 0.18;
  const sauceThickness = radius * 0.05;
  const cheeseThickness = radius * 0.07;

  const baseGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius * 0.98, baseThickness, 64),
    [radius, baseThickness]
  );

  const crustGeometry = useMemo(
    () => new THREE.TorusGeometry(radius * 0.92, radius * 0.08, 18, 48),
    [radius]
  );

  const sauceGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, sauceThickness, 48),
    [radius, sauceThickness]
  );

  const cheeseGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius * 0.93, radius * 0.93, cheeseThickness, 48),
    [radius, cheeseThickness]
  );

  const topY = baseThickness / 2 + sauceThickness + cheeseThickness * 0.5;
  const labelY = topY + radius * 0.22;

  return (
    <group>
      <mesh geometry={baseGeometry} material={doughMaterial} castShadow receiveShadow />
      <mesh
        geometry={crustGeometry}
        material={crustMaterial}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, baseThickness * 0.15, 0]}
        castShadow
      />
      <mesh
        geometry={sauceGeometry}
        material={sauceMaterial}
        position={[0, baseThickness / 2 + sauceThickness / 2, 0]}
        castShadow
      />
      <mesh
        geometry={cheeseGeometry}
        material={cheeseMaterial}
        position={[0, baseThickness / 2 + sauceThickness + cheeseThickness / 2, 0]}
        castShadow
      />

      {toppings.map((topping) => (
        <ToppingCluster key={topping} name={topping} radius={radius} topY={topY} />
      ))}

      <Billboard position={[0, labelY, 0]} follow>
        <Text
          fontSize={radius * 0.16}
          color="#fbe3b2"
          outlineWidth={radius * 0.015}
          outlineColor="#2a150a"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          maxWidth={radius * 2}
        >
          {`${measurement.diameterIn} in / ${measurement.diameterCm} cm\\n${String(
            data?.size || 'medium'
          ).toUpperCase()}`}
        </Text>
      </Billboard>
    </group>
  );
}
