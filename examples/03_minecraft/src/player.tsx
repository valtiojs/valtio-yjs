/* eslint react/no-unknown-property: "off" */

import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import Axe from './axe';

const SPEED = 5;
const keys = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'jump',
};
const moveFieldByKey = (key: string) => keys[key as keyof typeof keys];
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();
const speed = new THREE.Vector3();

const usePlayerControls = () => {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) =>
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }));
    const handleKeyUp = (e: KeyboardEvent) =>
      setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }));
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return movement;
};

export const Player = () => {
  const axe = useRef<Group>(null!);
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 10, 0],
  }));
  const { forward, backward, left, right, jump } = usePlayerControls();
  const { camera } = useThree();
  const velocity = useRef([0, 0, 0]);
  useEffect(
    () => api.velocity.subscribe((v) => (velocity.current = v)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useFrame((state) => {
    ref.current!.getWorldPosition(camera.position);
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);
    speed.fromArray(velocity.current);
    axe.current.children[0]!.rotation.x = THREE.MathUtils.lerp(
      axe.current.children[0]!.rotation.x,
      Math.sin(
        ((speed.length() > 1) as unknown as number) /* FIXME proper typing */ *
          state.clock.elapsedTime *
          10,
      ) / 6,
      0.1,
    );
    axe.current.rotation.copy(camera.rotation);
    axe.current.position
      .copy(camera.position)
      .add(camera.getWorldDirection(rotation).multiplyScalar(1));
    api.velocity.set(direction.x, velocity.current[1]!, direction.z);
    if (
      jump &&
      Math.abs(
        velocity.current[1]!.toFixed(
          2,
        ) as unknown as number /* FIXME proper typing */,
      ) < 0.05
    )
      api.velocity.set(velocity.current[0]!, 10, velocity.current[2]!);
  });
  return (
    <>
      <mesh ref={ref as never /* FIXME type it correctly */} />
      <group
        ref={axe}
        onPointerMissed={() => (axe.current.children[0]!.rotation.x = -0.5)}
      >
        <Axe position={[0.3, -0.35, 0.5]} />
      </group>
    </>
  );
};
