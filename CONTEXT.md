# Project Context

## File map
- app/layout.jsx, app/page.jsx, app/globals.css - Next.js shell (fullscreen, no scroll)
- components/game.jsx - Canvas, Sky, lights, Physics wrapper, KeyboardControls key map
- components/player.jsx - Avatar (classic noob: yellow head/arms, blue torso, green legs), kinematic movement via setLinvel, camera-relative WASD, jump, drag-orbit + scroll-zoom third-person camera, respawn below y=-30
- components/world.jsx - Baseplate (120x120 gray + Grid overlay), spawn pad, obby stairs, floating platforms, walls, ramp, spinning kinematic platform, dynamic pushable bricks
- components/hud.jsx - Controls overlay (absolute positioned, pointer-events none)

## Key mechanics
- Physics: Rapier, gravity [0,-55,0] (snappy Roblox-like feel)
- Player: RigidBody with locked rotations + CapsuleCollider, friction 0
- WALK_SPEED=12, JUMP_VELOCITY=22 in player.jsx
- Grounded check: |vel.y| < 0.2 (simple; could be improved with raycast)
- Avatar rotates smoothly toward movement direction
- Camera: yaw/pitch/dist stored in ref, pointer drag events on canvas, works with touch

## Gotchas
- package.json must have "type": "module" (Turbopack module format error otherwise)
- Project is plain JSX, no TypeScript, no Tailwind
