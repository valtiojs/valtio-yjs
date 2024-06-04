/* eslint react/no-unknown-property: "off" */

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Ground } from './ground';
import { Player } from './player';
import { Cube, Cubes } from './cube';
import './styles.css';

// The original was made by Maksim Ivanow: https://www.youtube.com/watch?v=Lc2JvBXMesY&t=124s
// This demo needs pointer-lock, that works only if you open it in a new window
// Controls: WASD + left click

function InnerApp() {
  return (
    <Canvas shadows gl={{ alpha: false }} camera={{ fov: 45 }}>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={1} />
      <pointLight castShadow intensity={100000} position={[100, 100, 100]} />
      <Physics gravity={[0, -30, 0]}>
        <Ground />
        <Player />
        <Cube position={[0, 0.5, -10]} />
        <Cubes />
      </Physics>
      <PointerLockControls />
    </Canvas>
  );
}

export default function App() {
  const [ready, set] = useState(false);
  return (
    <>
      <InnerApp />
      <div className="dot" />
      <div
        className={`fullscreen bg ${ready ? 'ready' : 'notready'} ${ready && 'clicked'}`}
      >
        <div className="stack">
          <button onClick={() => set(true)}>Click (needs fullscreen)</button>
        </div>
      </div>
    </>
  );
}
