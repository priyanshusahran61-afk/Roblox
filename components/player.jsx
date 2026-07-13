'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

const WALK_SPEED = 12
const JUMP_VELOCITY = 22
const SPAWN = [0, 6, 0]

// Classic Roblox "noob" colors
const COLORS = {
  head: '#f8d210',
  torso: '#0f6cbd',
  arms: '#f8d210',
  legs: '#a3c11a',
}

function Avatar({ groupRef }) {
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={COLORS.head} />
      </mesh>
      {/* Face */}
      <mesh position={[0.18, 1.72, 0.46]}>
        <boxGeometry args={[0.12, 0.16, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.18, 1.72, 0.46]}>
        <boxGeometry args={[0.12, 0.16, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 1.42, 0.46]}>
        <boxGeometry args={[0.4, 0.08, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.2, 1.2, 0.6]} />
        <meshStandardMaterial color={COLORS.torso} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.9, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 1.2, 0.6]} />
        <meshStandardMaterial color={COLORS.arms} />
      </mesh>
      <mesh position={[0.9, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 1.2, 0.6]} />
        <meshStandardMaterial color={COLORS.arms} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.31, -0.65, 0]} castShadow>
        <boxGeometry args={[0.58, 1.2, 0.6]} />
        <meshStandardMaterial color={COLORS.legs} />
      </mesh>
      <mesh position={[0.31, -0.65, 0]} castShadow>
        <boxGeometry args={[0.58, 1.2, 0.6]} />
        <meshStandardMaterial color={COLORS.legs} />
      </mesh>
    </group>
  )
}

export default function Player() {
  const body = useRef(null)
  const avatar = useRef(null)
  const [, getKeys] = useKeyboardControls()
  const { gl } = useThree()

  // Camera orbit state (Roblox-style right/left drag to rotate)
  const cam = useRef({ yaw: 0, pitch: 0.35, dist: 12, dragging: false, lx: 0, ly: 0 })
  const grounded = useRef(false)
  const targetYaw = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    const down = (e) => {
      cam.current.dragging = true
      cam.current.lx = e.clientX
      cam.current.ly = e.clientY
    }
    const up = () => {
      cam.current.dragging = false
    }
    const move = (e) => {
      if (!cam.current.dragging) return
      cam.current.yaw -= (e.clientX - cam.current.lx) * 0.006
      cam.current.pitch = THREE.MathUtils.clamp(
        cam.current.pitch + (e.clientY - cam.current.ly) * 0.006,
        -0.2,
        1.2,
      )
      cam.current.lx = e.clientX
      cam.current.ly = e.clientY
    }
    const wheel = (e) => {
      cam.current.dist = THREE.MathUtils.clamp(cam.current.dist + e.deltaY * 0.01, 5, 25)
    }
    const touchStart = (e) => {
      if (e.touches.length === 1) down(e.touches[0])
    }
    const touchMove = (e) => {
      if (e.touches.length === 1) move(e.touches[0])
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointermove', move)
    el.addEventListener('wheel', wheel, { passive: true })
    el.addEventListener('touchstart', touchStart, { passive: true })
    el.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('touchend', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointermove', move)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('touchstart', touchStart)
      el.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', up)
    }
  }, [gl])

  useFrame((state, delta) => {
    const rb = body.current
    if (!rb) return

    const { forward, backward, left, right, jump } = getKeys()
    const pos = rb.translation()
    const vel = rb.linvel()

    // Respawn if fallen off the map
    if (pos.y < -30) {
      rb.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    // Movement relative to camera yaw
    const yaw = cam.current.yaw
    const dir = new THREE.Vector3(
      (right ? 1 : 0) - (left ? 1 : 0),
      0,
      (backward ? 1 : 0) - (forward ? 1 : 0),
    )
    if (dir.lengthSq() > 0) {
      dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      targetYaw.current = Math.atan2(dir.x, dir.z)
    }
    rb.setLinvel({ x: dir.x * WALK_SPEED, y: vel.y, z: dir.z * WALK_SPEED }, true)

    // Simple grounded check + jump
    if (Math.abs(vel.y) < 0.2) grounded.current = true
    if (jump && grounded.current) {
      rb.setLinvel({ x: vel.x, y: JUMP_VELOCITY, z: vel.z }, true)
      grounded.current = false
    }

    // Rotate avatar toward movement direction
    if (avatar.current) {
      const cur = avatar.current.rotation.y
      let diff = targetYaw.current - cur
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      avatar.current.rotation.y = cur + diff * Math.min(1, delta * 12)
    }

    // Third-person camera orbit
    const { pitch, dist } = cam.current
    const target = new THREE.Vector3(pos.x, pos.y + 1.5, pos.z)
    const offset = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    ).multiplyScalar(dist)
    state.camera.position.lerp(target.clone().add(offset), Math.min(1, delta * 10))
    state.camera.lookAt(target)
  })

  return (
    <RigidBody
      ref={body}
      position={SPAWN}
      enabledRotations={[false, false, false]}
      colliders={false}
      friction={0}
    >
      <CapsuleCollider args={[0.9, 0.6]} position={[0, 0.5, 0]} />
      <Avatar groupRef={avatar} />
    </RigidBody>
  )
}
