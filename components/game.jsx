'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, KeyboardControls, Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './player'
import World from './world'
import Hud from './hud'

const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
]

export default function Game() {
  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <KeyboardControls map={keyMap}>
        <Canvas shadows camera={{ position: [0, 8, 14], fov: 70 }}>
          <Sky sunPosition={[100, 60, 100]} />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[50, 80, 30]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
          />
          <Suspense
            fallback={
              <Html center>
                <div
                  style={{
                    background: 'rgba(30,30,30,0.85)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontFamily: 'sans-serif',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Loading world...
                </div>
              </Html>
            }
          >
            <Physics gravity={[0, -55, 0]}>
              <World />
              <Player />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <Hud />
    </div>
  )
}
