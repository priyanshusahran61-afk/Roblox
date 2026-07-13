'use client'

export default function Hud() {
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
        pointerEvents: 'none',
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        fontSize: 13,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.45)',
          borderRadius: 8,
          padding: '8px 12px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Bloxcraft</div>
        <div>WASD / arrows to move</div>
        <div>Space to jump</div>
        <div>Drag to rotate camera, scroll to zoom</div>
      </div>
    </div>
  )
}
