'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import Avatar from './avatar'
import { useGame, mobileInput } from '../lib/store'
import { sfx } from '../lib/sfx'

const WALK_SPEED = 12
const JUMP_VELOCITY = 24
const AIR_CONTROL = 0.85
const COYOTE_TIME = 0.12
const JUMP_BUFFER = 0.12
const KILL_Y = -25

const UP = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _target = new THREE.Vector3()
const _offset = new THREE.Vector3()

export default function Player() {
  const body = useRef(null)
  const rig = useRef({})
  const [, getKeys] = useKeyboardControls()
  const { gl } = useThree()
  const { world, rapier } = useRapier()

  // Camera orbit state (Roblox-style drag to rotate)
  const cam = useRef({ yaw: 0, pitch: 0.35, dist: 11, dragging: false, lx: 0, ly: 0 })
  const state = useRef({
    grounded: false,
    lastGrounded: -10,
    lastJumpPressed: -10,
    jumpHeld: false,
    wasAirborne: false,
    walkPhase: 0,
    targetYaw: 0,
    respawnTick: useGame.getState().respawnTick,
  })

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
        -0.25,
        1.25,
      )
      cam.current.lx = e.clientX
      cam.current.ly = e.clientY
    }
    const wheel = (e) => {
      cam.current.dist = THREE.MathUtils.clamp(cam.current.dist + e.deltaY * 0.01, 5, 24)
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

  useFrame((three, delta) => {
    const rb = body.current
    if (!rb) return
    const s = state.current
    const game = useGame.getState()
    const now = three.clock.elapsedTime
    const playing = game.stage === 'playing'

    // ---- Respawn (death or new run) ----
    if (game.respawnTick !== s.respawnTick) {
      s.respawnTick = game.respawnTick
      const [cx, cy, cz] = game.checkpoint
      rb.setTranslation({ x: cx, y: cy, z: cz }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      cam.current.yaw = 0
    }

    const pos = rb.translation()
    const vel = rb.linvel()

    // Fell off the map
    if (pos.y < KILL_Y) {
      if (playing) {
        game.die()
      } else {
        rb.setTranslation({ x: 0, y: 4, z: 0 }, true)
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      }
      return
    }

    // ---- Grounded check: raycast straight down from the capsule center ----
    const ray = new rapier.Ray({ x: pos.x, y: pos.y + 0.5, z: pos.z }, { x: 0, y: -1, z: 0 })
    const hit = world.castRay(ray, 1.75, true, undefined, undefined, undefined, rb)
    const toi = hit ? (hit.timeOfImpact ?? hit.toi) : Infinity
    const groundedNow = toi < 1.65
    if (groundedNow) s.lastGrounded = now
    if (groundedNow && s.wasAirborne && vel.y <= 0.5) sfx.land()
    s.wasAirborne = !groundedNow
    s.grounded = groundedNow

    // ---- Input ----
    const { forward, backward, left, right, jump } = getKeys()
    let ix = (right ? 1 : 0) - (left ? 1 : 0)
    let iz = (backward ? 1 : 0) - (forward ? 1 : 0)
    // Merge mobile joystick
    if (Math.abs(mobileInput.x) > 0.15 || Math.abs(mobileInput.y) > 0.15) {
      ix = mobileInput.x
      iz = mobileInput.y
    }
    const jumpPressed = jump || mobileInput.jump
    if (!playing) {
      ix = 0
      iz = 0
    }

    // ---- Movement relative to camera yaw ----
    const yaw = cam.current.yaw
    _dir.set(ix, 0, iz)
    const moving = _dir.lengthSq() > 0.02
    if (moving) {
      if (_dir.lengthSq() > 1) _dir.normalize()
      _dir.applyAxisAngle(UP, yaw)
      s.targetYaw = Math.atan2(_dir.x, _dir.z)
    }
    const control = groundedNow ? 1 : AIR_CONTROL
    rb.setLinvel(
      { x: _dir.x * WALK_SPEED * control, y: vel.y, z: _dir.z * WALK_SPEED * control },
      true,
    )

    // ---- Jump with coyote time + jump buffer ----
    if (jumpPressed && !s.jumpHeld) s.lastJumpPressed = now
    s.jumpHeld = jumpPressed
    if (
      playing &&
      now - s.lastJumpPressed < JUMP_BUFFER &&
      now - s.lastGrounded < COYOTE_TIME &&
      vel.y < 1
    ) {
      rb.setLinvel({ x: vel.x, y: JUMP_VELOCITY, z: vel.z }, true)
      s.lastGrounded = -10
      s.lastJumpPressed = -10
      sfx.jump()
    }

    // ---- Procedural R6 animation ----
    const r = rig.current
    if (r.root) {
      // Turn body toward movement direction
      const cur = r.root.rotation.y
      let diff = s.targetYaw - cur
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      r.root.rotation.y = cur + diff * Math.min(1, delta * 12)

      const hSpeed = Math.hypot(vel.x, vel.z)
      const lerp = (obj, key, to, k = 14) => {
        obj[key] = THREE.MathUtils.lerp(obj[key], to, Math.min(1, delta * k))
      }

      if (!groundedNow) {
        // Airborne: classic R6 jump - arms straight up, legs slightly tucked
        lerp(r.leftArm.rotation, 'z', 2.9, 10)
        lerp(r.rightArm.rotation, 'z', -2.9, 10)
        lerp(r.leftArm.rotation, 'x', 0, 10)
        lerp(r.rightArm.rotation, 'x', 0, 10)
        lerp(r.leftLeg.rotation, 'x', 0.35, 10)
        lerp(r.rightLeg.rotation, 'x', -0.2, 10)
        lerp(r.head.rotation, 'x', vel.y > 2 ? -0.12 : 0.12, 8)
        lerp(r.root.position, 'y', 0)
      } else if (hSpeed > 0.8) {
        // Walk cycle: opposite arm/leg swing, speed-scaled
        s.walkPhase += delta * (hSpeed * 1.15)
        const swing = Math.sin(s.walkPhase)
        lerp(r.leftArm.rotation, 'x', swing * 0.9, 20)
        lerp(r.rightArm.rotation, 'x', -swing * 0.9, 20)
        lerp(r.leftLeg.rotation, 'x', -swing * 0.95, 20)
        lerp(r.rightLeg.rotation, 'x', swing * 0.95, 20)
        lerp(r.leftArm.rotation, 'z', 0.06, 10)
        lerp(r.rightArm.rotation, 'z', -0.06, 10)
        lerp(r.head.rotation, 'x', 0, 8)
        // Bob up and down while walking
        lerp(r.root.position, 'y', Math.abs(Math.cos(s.walkPhase)) * 0.09, 20)
      } else {
        // Idle: gentle breathing sway
        const breathe = Math.sin(now * 2) * 0.045
        lerp(r.leftArm.rotation, 'x', 0, 8)
        lerp(r.rightArm.rotation, 'x', 0, 8)
        lerp(r.leftLeg.rotation, 'x', 0, 8)
        lerp(r.rightLeg.rotation, 'x', 0, 8)
        lerp(r.leftArm.rotation, 'z', 0.05 + breathe, 6)
        lerp(r.rightArm.rotation, 'z', -0.05 - breathe, 6)
        lerp(r.head.rotation, 'x', Math.sin(now * 1.3) * 0.04, 6)
        lerp(r.root.position, 'y', breathe * 0.4, 8)
        s.walkPhase = 0
      }
    }

    // ---- Third-person orbit camera ----
    const { pitch, dist } = cam.current
    _target.set(pos.x, pos.y + 1.5, pos.z)
    _offset
      .set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
      .multiplyScalar(dist)
    three.camera.position.lerp(_offset.add(_target), Math.min(1, delta * 10))
    three.camera.lookAt(_target)
  })

  return (
    <RigidBody
      ref={body}
      position={[0, 4, 0]}
      enabledRotations={[false, false, false]}
      colliders={false}
      friction={0}
      ccd
      userData={{ type: 'player' }}
    >
      <CapsuleCollider args={[0.9, 0.6]} position={[0, 0.5, 0]} />
      <Avatar rig={rig} />
    </RigidBody>
  )
}
