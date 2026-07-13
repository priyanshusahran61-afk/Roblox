'use client'

import { useEffect, useRef, useState } from 'react'
import { useGame, mobileInput } from '../lib/store'

const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

const panelStyle = {
  background: 'rgba(18,22,26,0.72)',
  borderRadius: 10,
  padding: '8px 14px',
  color: '#fff',
  fontFamily: font,
  pointerEvents: 'none',
  backdropFilter: 'blur(4px)',
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/* ---------- Top stats bar ---------- */

function StatsBar() {
  const coins = useGame((s) => s.coins)
  const totalCoins = useGame((s) => s.totalCoins)
  const deaths = useGame((s) => s.deaths)
  const stage = useGame((s) => s.stage)
  const startTime = useGame((s) => s.startTime)
  const endTime = useGame((s) => s.endTime)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (stage !== 'playing') return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [stage])

  const elapsed = stage === 'won' ? endTime - startTime : now - startTime

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>SCOUT&apos;S OBBY</span>
        <span style={{ fontSize: 11, opacity: 0.75 }}>Reach the golden pad!</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#ffc61a',
              boxShadow: '0 0 6px #ffc61a',
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {coins}/{totalCoins}
          </span>
        </div>
        <div style={{ ...panelStyle, fontWeight: 700, fontSize: 14 }}>
          <span style={{ opacity: 0.6, fontWeight: 500, fontSize: 12 }}>Deaths </span>
          {deaths}
        </div>
        <div style={{ ...panelStyle, fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: 'center' }}>
          {startTime ? formatTime(Math.max(0, elapsed)) : '0:00'}
        </div>
      </div>
    </div>
  )
}

/* ---------- Start menu ---------- */

function Menu() {
  const start = useGame((s) => s.start)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,14,18,0.55)',
        fontFamily: font,
        color: '#fff',
        textAlign: 'center',
        padding: 16,
      }}
    >
      <div style={{ fontSize: 'clamp(34px, 9vw, 64px)', fontWeight: 900, letterSpacing: 1, textShadow: '0 4px 0 rgba(0,0,0,0.35)' }}>
        BLOXCRAFT
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#4ef0ff', marginTop: 2, marginBottom: 20 }}>
        Scout&apos;s Obby
      </div>
      <button
        onClick={start}
        style={{
          fontFamily: font,
          fontSize: 20,
          fontWeight: 800,
          padding: '14px 52px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          background: '#27b34c',
          boxShadow: '0 5px 0 #1a8a37, 0 8px 18px rgba(0,0,0,0.4)',
          letterSpacing: 1,
        }}
      >
        PLAY
      </button>
      <div style={{ marginTop: 26, fontSize: 13, lineHeight: 1.6, opacity: 0.85, maxWidth: 340 }}>
        <div>WASD / arrows to move, Space to jump</div>
        <div>Drag to rotate camera, scroll to zoom</div>
        <div>Avoid red bricks and lava. Grab every coin!</div>
      </div>
    </div>
  )
}

/* ---------- Win screen ---------- */

function WinScreen() {
  const start = useGame((s) => s.start)
  const coins = useGame((s) => s.coins)
  const totalCoins = useGame((s) => s.totalCoins)
  const deaths = useGame((s) => s.deaths)
  const startTime = useGame((s) => s.startTime)
  const endTime = useGame((s) => s.endTime)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,14,18,0.6)',
        fontFamily: font,
        color: '#fff',
        textAlign: 'center',
        padding: 16,
      }}
    >
      <div style={{ fontSize: 'clamp(30px, 8vw, 54px)', fontWeight: 900, color: '#ffc61a', textShadow: '0 4px 0 rgba(0,0,0,0.35)' }}>
        YOU WIN!
      </div>
      <div
        style={{
          marginTop: 18,
          background: 'rgba(18,22,26,0.85)',
          borderRadius: 12,
          padding: '16px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        <div>
          Time: <span style={{ color: '#4ef0ff' }}>{formatTime(Math.max(0, endTime - startTime))}</span>
        </div>
        <div>
          Coins:{' '}
          <span style={{ color: '#ffc61a' }}>
            {coins}/{totalCoins}
          </span>
        </div>
        <div>
          Deaths: <span style={{ color: '#ff6b5e' }}>{deaths}</span>
        </div>
      </div>
      <button
        onClick={start}
        style={{
          marginTop: 22,
          fontFamily: font,
          fontSize: 17,
          fontWeight: 800,
          padding: '12px 40px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          background: '#1e78d4',
          boxShadow: '0 5px 0 #155a9f, 0 8px 18px rgba(0,0,0,0.4)',
          letterSpacing: 1,
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}

/* ---------- Mobile controls ---------- */

function Joystick() {
  const base = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef(false)

  const handle = (clientX, clientY) => {
    const rect = base.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = (clientX - cx) / (rect.width / 2)
    let dy = (clientY - cy) / (rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    mobileInput.x = dx
    mobileInput.y = dy
    setKnob({ x: dx * 34, y: dy * 34 })
  }

  const reset = () => {
    active.current = false
    mobileInput.x = 0
    mobileInput.y = 0
    setKnob({ x: 0, y: 0 })
  }

  return (
    <div
      ref={base}
      onTouchStart={(e) => {
        active.current = true
        handle(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchMove={(e) => {
        if (active.current) handle(e.touches[0].clientX, e.touches[0].clientY)
      }}
      onTouchEnd={reset}
      onTouchCancel={reset}
      style={{
        position: 'absolute',
        left: 20,
        bottom: 24,
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: 'rgba(18,22,26,0.4)',
        border: '2px solid rgba(255,255,255,0.35)',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.75)',
          transform: `translate(${knob.x}px, ${knob.y}px)`,
        }}
      />
    </div>
  )
}

function JumpButton() {
  return (
    <button
      aria-label="Jump"
      onTouchStart={(e) => {
        e.preventDefault()
        mobileInput.jump = true
      }}
      onTouchEnd={() => {
        mobileInput.jump = false
      }}
      style={{
        position: 'absolute',
        right: 22,
        bottom: 32,
        width: 84,
        height: 84,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.35)',
        background: 'rgba(39,179,76,0.65)',
        color: '#fff',
        fontFamily: font,
        fontWeight: 800,
        fontSize: 15,
        touchAction: 'none',
      }}
    >
      JUMP
    </button>
  )
}

/* ---------- Root HUD ---------- */

export default function Hud() {
  const stage = useGame((s) => s.stage)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <StatsBar />
      {stage === 'playing' && isTouch && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <Joystick />
          <JumpButton />
        </div>
      )}
      {stage === 'menu' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <Menu />
        </div>
      )}
      {stage === 'won' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <WinScreen />
        </div>
      )}
    </div>
  )
}
