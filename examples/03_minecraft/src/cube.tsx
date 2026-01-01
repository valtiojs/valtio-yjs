/* eslint react/no-unknown-property: "off" */

import * as THREE from 'three';
import { useCallback, useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import type { BoxProps } from '@react-three/cannon';
import { proxy, subscribe, snapshot } from 'valtio';
import * as Y from 'yjs';
import { bind } from 'valtio-yjs';
import { WebrtcProvider } from 'y-webrtc';
// @ts-expect-error no types
import dirt from './assets/dirt.jpg';

const ydoc = new Y.Doc();
new WebrtcProvider('minecraft-valtio-yjs-demo-2', ydoc);
const ymap = ydoc.getMap('map');

// This is a super naive implementation and wouldn't allow for more than a few thousand boxes.
// In order to make this scale this has to be one instanced mesh, then it could easily be
// hundreds of thousands.

const cubeStore = proxy({
  cubes: [] as [number, number, number][],
});
const addCube = (x: number, y: number, z: number) => {
  cubeStore.cubes.push([x, y, z]);
};
const useCubes = () => {
  const [slice, setSlice] = useState(() => snapshot(cubeStore).cubes);
  useEffect(() => {
    return subscribe(cubeStore, () => {
      setSlice(snapshot(cubeStore).cubes);
    });
  }, []);
  return slice || [];
};

bind(cubeStore, ymap);

export const Cubes = () => {
  const cubes = useCubes();
  return cubes.map((coords, index) => (
    <Cube key={index} position={coords as [number, number, number]} />
  ));
};

export const Cube = (props: BoxProps) => {
  const [ref] = useBox(() => ({ type: 'Static', ...props }));
  const [hover, setHover] = useState<number | null>(null);
  const texture = useLoader(THREE.TextureLoader, dirt);
  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(Math.floor(e.faceIndex! / 2));
  }, []);
  const onOut = useCallback(() => setHover(null), []);
  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { x, y, z } = ref.current!.position;
    const dir = [
      [x + 1, y, z],
      [x - 1, y, z],
      [x, y + 1, z],
      [x, y - 1, z],
      [x, y, z + 1],
      [x, y, z - 1],
    ] as (readonly [number, number, number])[];
    addCube(...dir[Math.floor(e.faceIndex! / 2)]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <mesh
      ref={ref as never /* FIXME proper typing */}
      receiveShadow
      castShadow
      onPointerMove={onMove}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {[...Array(6)].map((_, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          map={texture}
          color={hover === index ? 'hotpink' : 'white'}
        />
      ))}
      <boxGeometry />
    </mesh>
  );
};
