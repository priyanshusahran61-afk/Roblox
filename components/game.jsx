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
          {/* Atmosphere */}
          <Sky sunPosition={[80, 45, -120]} turbidity={6} rayleigh={1.2} />
          <fog attach="fog" args={['#bcd8e8', 60, 220]} />

          {/* Lighting: warm key sun + cool sky fill + bounce */}
          <hemisphereLight args={['#bfe3ff', '#5f7d63', 0.55]} />
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[45, 70, -35]}
            intensity={1.7}
            color="#fff4e0"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-70}
            shadow-camera-right={70}
            shadow-camera-top={70}
            shadow-camera-bottom={-70}
            shadow-camera-far={220}
            shadow-bias={-0.0002}
          />
          <directionalLight position={[-30, 25, 40]} intensity={0.35} color="#cfe6ff" />

          <Suspense
            fallback={
              <Html center>
                <div
                  style={{
                    background: 'rgba(20,24,28,0.9)',
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
