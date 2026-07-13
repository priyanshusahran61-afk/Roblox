'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

function Part({ position, size, color, ...props }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} {...props}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

function SpinningPlatform({ position }) {
  const ref = useRef(null)
  useFrame((state) => {
    ref.current?.setNextKinematicRotation(
      // rotate around Y
      { x: 0, y: Math.sin(state.clock.elapsedTime * 0.25), z: 0, w: Math.cos(state.clock.elapsedTime * 0.25) },
    )
  })
  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[10, 1, 2.5]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
    </RigidBody>
  )
}

export default function World() {
  return (
    <>
      {/* Classic Roblox baseplate */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[120, 1, 120]} />
          <meshStandardMaterial color="#6d7d8b" />
        </mesh>
      </RigidBody>
      <Grid
        position={[0, 0.01, 0]}
        args={[120, 120]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#5a6975"
        sectionSize={8}
        sectionThickness={1}
        sectionColor="#4d5a66"
        fadeDistance={90}
      />

      {/* Spawn pad */}
      <Part position={[0, 0.15, 0]} size={[6, 0.3, 6]} color="#c8cdd2" />

      {/* Obstacle course stairs */}
      <Part position={[10, 0.5, -8]} size={[4, 1, 4]} color="#e74c3c" />
      <Part position={[14, 1.5, -12]} size={[4, 1, 4]} color="#f39c12" />
      <Part position={[18, 2.5, -16]} size={[4, 1, 4]} color="#f1c40f" />
      <Part position={[22, 3.5, -20]} size={[4, 1, 4]} color="#2ecc71" />
      <Part position={[26, 4.5, -24]} size={[4, 1, 4]} color="#3498db" />

      {/* Floating platforms */}
      <Part position={[-14, 2, -10]} size={[3, 0.5, 3]} color="#9b59b6" />
      <Part position={[-20, 4, -14]} size={[3, 0.5, 3]} color="#1abc9c" />
      <Part position={[-26, 6, -18]} size={[3, 0.5, 3]} color="#e67e22" />

      {/* Walls / big bricks to climb around */}
      <Part position={[-12, 1.5, 12]} size={[8, 3, 1]} color="#8e44ad" />
      <Part position={[12, 2, 14]} size={[1, 4, 10]} color="#16a085" />
      <Part position={[0, 1, 22]} size={[6, 2, 6]} color="#d35400" />

      {/* Ramp */}
      <RigidBody type="fixed" colliders="cuboid" position={[-8, 1, -22]} rotation={[0.4, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.5, 12]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      </RigidBody>

      {/* Spinning platform */}
      <SpinningPlatform position={[0, 1.2, -14]} />

      {/* Dynamic loose bricks you can push around */}
      {[
        [4, 3, 6, '#e74c3c'],
        [5.5, 4, 6.5, '#f1c40f'],
        [4.8, 5, 5.5, '#3498db'],
        [-5, 3, 7, '#2ecc71'],
      ].map(([x, y, z, color], i) => (
        <RigidBody key={i} colliders="cuboid" position={[x, y, z]} mass={0.4}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.4, 1.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}
