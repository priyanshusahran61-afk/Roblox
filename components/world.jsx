'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useGame } from '../lib/store'

const isPlayer = (other) =>
  other.rigidBody?.userData?.type === 'player' ||
  other.rigidBodyObject?.userData?.type === 'player'

/* ---------- Building blocks ---------- */

function Part({ position, size, color, rotation, ...props }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation} {...props}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

function KillBrick({ position, size = [3, 0.6, 3] }) {
  const die = useGame((s) => s.die)
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={position}
      onCollisionEnter={({ other }) => isPlayer(other) && die()}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#e0301e" emissive="#ff2200" emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
    </RigidBody>
  )
}

function Lava({ position, size }) {
  const die = useGame((s) => s.die)
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        sensor
        onIntersectionEnter={({ other }) => isPlayer(other) && die()}
      />
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#ff4d00" emissive="#ff3300" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
    </RigidBody>
  )
}

function Checkpoint({ id, position }) {
  const setCheckpoint = useGame((s) => s.setCheckpoint)
  const active = useGame((s) => s.activeCheckpoint >= id)
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <CuboidCollider
        args={[2, 1.2, 2]}
        position={[0, 1.4, 0]}
        sensor
        onIntersectionEnter={({ other }) =>
          isPlayer(other) && setCheckpoint(id, [position[0], position[1] + 3, position[2]])
        }
      />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial
          color={active ? '#27b34c' : '#3f4c58'}
          emissive={active ? '#1f9e40' : '#000000'}
          emissiveIntensity={active ? 0.5 : 0}
        />
      </mesh>
      {/* Flag pole */}
      <mesh position={[1.6, 1.6, 1.6]} castShadow>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshStandardMaterial color="#8a949e" />
      </mesh>
      <mesh position={[1.15, 2.7, 1.6]} castShadow>
        <boxGeometry args={[0.8, 0.55, 0.06]} />
        <meshStandardMaterial
          color={active ? '#27b34c' : '#e0a112'}
          emissive={active ? '#27b34c' : '#000000'}
          emissiveIntensity={active ? 0.6 : 0}
        />
      </mesh>
    </RigidBody>
  )
}

function Coin({ id, position }) {
  const collect = useGame((s) => s.collect)
  const taken = useGame((s) => s.collected[id])
  const mesh = useRef(null)
  useFrame((st) => {
    if (mesh.current) {
      mesh.current.rotation.y = st.clock.elapsedTime * 2.4
      mesh.current.position.y = Math.sin(st.clock.elapsedTime * 2 + position[0]) * 0.15
    }
  })
  if (taken) return null
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[0.7, 0.9, 0.7]}
        sensor
        onIntersectionEnter={({ other }) => isPlayer(other) && collect(id)}
      />
      <mesh ref={mesh} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.14, 20]} />
        <meshStandardMaterial
          color="#ffc61a"
          emissive="#c78a00"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </RigidBody>
  )
}

function WinPad({ position }) {
  const win = useGame((s) => s.win)
  const star = useRef(null)
  useFrame((st) => {
    if (star.current) {
      star.current.rotation.y = st.clock.elapsedTime * 1.5
      star.current.position.y = 2.2 + Math.sin(st.clock.elapsedTime * 1.8) * 0.25
    }
  })
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <CuboidCollider
        args={[2.5, 1.5, 2.5]}
        position={[0, 1.8, 0]}
        sensor
        onIntersectionEnter={({ other }) => isPlayer(other) && win()}
      />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 0.5, 5]} />
        <meshStandardMaterial color="#ffc61a" emissive="#b8860b" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Beacon beam */}
      <mesh position={[0, 14, 0]}>
        <cylinderGeometry args={[0.5, 1.2, 28, 12, 1, true]} />
        <meshBasicMaterial color="#ffe27a" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Floating trophy cube */}
      <mesh ref={star} position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffd94d" emissive="#ffaa00" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>
  )
}

function MovingPlatform({ position, range = 5, speed = 0.9, axis = 'x', size = [4, 0.6, 4], color = '#7f5fd4' }) {
  const ref = useRef(null)
  useFrame((st) => {
    if (!ref.current) return
    const t = Math.sin(st.clock.elapsedTime * speed) * range
    ref.current.setNextKinematicTranslation({
      x: position[0] + (axis === 'x' ? t : 0),
      y: position[1] + (axis === 'y' ? t : 0),
      z: position[2] + (axis === 'z' ? t : 0),
    })
  })
  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </RigidBody>
  )
}

function Spinner({ position, speed = 2 }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.setAngvel({ x: 0, y: speed, z: 0 }, true)
  }, [speed])
  return (
    <RigidBody ref={ref} type="kinematicVelocity" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[9, 0.8, 0.8]} />
        <meshStandardMaterial color="#e0301e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.9]} />
        <meshStandardMaterial color="#3f4c58" />
      </mesh>
    </RigidBody>
  )
}

/* ---------- Decorations (no colliders needed for leaves/clouds) ---------- */

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.9, 3, 0.9]} />
          <meshStandardMaterial color="#6e4a2b" roughness={0.9} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[3, 2.4, 3]} />
        <meshStandardMaterial color="#2f9e44" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.6, 0]} castShadow>
        <boxGeometry args={[1.8, 1.4, 1.8]} />
        <meshStandardMaterial color="#37b24d" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Cloud({ position, scale = 1 }) {
  const ref = useRef(null)
  useFrame((st) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(st.clock.elapsedTime * 0.08 + position[2]) * 6
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[7, 1.8, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <mesh position={[3, 1, 0.5]}>
        <boxGeometry args={[4, 1.6, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  )
}

/* ---------- Coin layout ---------- */

const COINS = [
  [4, 1.4, -4],
  [-4, 1.4, -4],
  [0, 2, -12],
  [0, 4, -20],
  [0, 5.6, -28],
  [0, 5.8, -38],
  [-2, 5.6, -52],
  [2, 5.6, -56],
  [-2, 5.6, -60],
  [0, 5.6, -70],
  [-3, 7.5, -80],
  [3, 9.5, -88],
  [0, 11.6, -96],
  [0, 11.8, -104],
]

export default function World() {
  const registerCoins = useGame((s) => s.registerCoins)
  useEffect(() => {
    registerCoins(COINS.length)
  }, [registerCoins])

  return (
    <>
      {/* ---- Baseplate (classic studded look via grid) ---- */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[140, 1, 140]} />
          <meshStandardMaterial color="#5f7d63" roughness={0.95} />
        </mesh>
      </RigidBody>
      <Grid
        position={[0, 0.01, 0]}
        args={[140, 140]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#527056"
        sectionSize={8}
        sectionThickness={1}
        sectionColor="#46604a"
        fadeDistance={110}
      />

      {/* ---- Spawn pad ---- */}
      <Part position={[0, 0.15, 0]} size={[8, 0.3, 8]} color="#c8cdd2" />
      <Part position={[0, 0.35, 0]} size={[3, 0.15, 3]} color="#0e7c86" />

      {/* ---- Stage 1: stairs ---- */}
      <Part position={[0, 0.5, -10]} size={[5, 1, 3]} color="#e0301e" />
      <Part position={[0, 1.3, -14]} size={[5, 1, 3]} color="#f28c1e" />
      <Part position={[0, 2.1, -18]} size={[5, 1, 3]} color="#f2c61e" />
      <Part position={[0, 2.9, -22]} size={[5, 1, 3]} color="#27b34c" />
      <Part position={[0, 3.7, -26]} size={[5, 1, 3]} color="#1e78d4" />
      <Part position={[0, 4, -30]} size={[6, 1, 4]} color="#c8cdd2" />

      {/* ---- Stage 2: moving platform over lava ---- */}
      <Lava position={[0, 0.2, -39]} size={[18, 0.4, 12]} />
      <MovingPlatform position={[0, 4.2, -39]} range={5.5} speed={1.1} axis="x" />
      <Part position={[0, 4, -48]} size={[8, 1, 6]} color="#c8cdd2" />
      <Checkpoint id={0} position={[0, 4.7, -48]} />

      {/* ---- Stage 3: kill brick hops ---- */}
      <Lava position={[0, 0.2, -58]} size={[16, 0.4, 16]} />
      <Part position={[-2, 4.6, -52.5]} size={[2.6, 0.6, 2.6]} color="#e6eaee" />
      <KillBrick position={[2, 4.6, -52.5]} size={[2.6, 0.6, 2.6]} />
      <KillBrick position={[-2, 4.6, -56.5]} size={[2.6, 0.6, 2.6]} />
      <Part position={[2, 4.6, -56.5]} size={[2.6, 0.6, 2.6]} color="#e6eaee" />
      <Part position={[-2, 4.6, -60.5]} size={[2.6, 0.6, 2.6]} color="#e6eaee" />
      <KillBrick position={[2, 4.6, -60.5]} size={[2.6, 0.6, 2.6]} />

      {/* ---- Stage 4: spinner arena ---- */}
      <Part position={[0, 4, -70]} size={[11, 1, 11]} color="#3f4c58" />
      <Spinner position={[0, 5.2, -70]} speed={2.1} />
      <Checkpoint id={1} position={[0, 4.7, -74.5]} />

      {/* ---- Stage 5: floating ascent over the void ---- */}
      <Part position={[-3, 6.2, -80]} size={[3, 0.6, 3]} color="#7f5fd4" />
      <Part position={[3, 7.6, -84]} size={[3, 0.6, 3]} color="#1e78d4" />
      <Part position={[-3, 9, -88]} size={[3, 0.6, 3]} color="#27b34c" />
      <MovingPlatform position={[0, 10.2, -93]} range={3} speed={1.2} axis="x" size={[3, 0.6, 3]} color="#f2c61e" />

      {/* ---- Stage 6: victory tower ---- */}
      <Part position={[0, 10.5, -101]} size={[10, 1, 10]} color="#e6eaee" />
      <WinPad position={[0, 11.2, -103]} />

      {/* ---- Coins ---- */}
      {COINS.map((p, i) => (
        <Coin key={i} id={i} position={p} />
      ))}

      {/* ---- Playground near spawn: pushable bricks + ramp ---- */}
      <RigidBody type="fixed" colliders="cuboid" position={[-14, 1, -6]} rotation={[0.4, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 0.5, 10]} />
          <meshStandardMaterial color="#8a949e" />
        </mesh>
      </RigidBody>
      {[
        [12, 2, 4, '#e0301e'],
        [13.5, 3, 4.5, '#f2c61e'],
        [12.8, 4, 3.5, '#1e78d4'],
        [-11, 2, 6, '#27b34c'],
        [-12.5, 3, 7, '#f28c1e'],
      ].map(([x, y, z, color], i) => (
        <RigidBody key={i} colliders="cuboid" position={[x, y, z]} mass={0.4}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.4, 1.4]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}

      {/* ---- Decorations ---- */}
      <Tree position={[-22, 0, -14]} />
      <Tree position={[24, 0, -10]} scale={1.25} />
      <Tree position={[-28, 0, 14]} scale={0.9} />
      <Tree position={[20, 0, 20]} />
      <Tree position={[-16, 0, 24]} scale={1.15} />
      <Tree position={[30, 0, -26]} scale={1.1} />
      <Cloud position={[-30, 26, -50]} scale={1.4} />
      <Cloud position={[25, 30, -80]} />
      <Cloud position={[0, 34, -30]} scale={1.8} />
      <Cloud position={[40, 28, 10]} />

      {/* Distant blocky hills */}
      <Part position={[-58, 3, -40]} size={[18, 8, 16]} color="#4c6b50" />
      <Part position={[55, 2, -55]} size={[14, 6, 14]} color="#4c6b50" />
      <Part position={[60, 4, 25]} size={[16, 10, 18]} color="#4c6b50" />
    </>
  )
}
