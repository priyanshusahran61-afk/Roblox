Project Name: Bloxcraft

Description: A web-based Roblox clone. Goal is a 3D game platform with the closest possible Roblox feel: blocky avatar, physics playground, third-person camera, and eventually user-built worlds/multiplayer.

Tech Stack:
- Next.js 16 (App Router, JSX, no TypeScript)
- React Three Fiber (three.js) for 3D rendering
- @react-three/rapier for physics
- @react-three/drei for helpers (Sky, Grid, KeyboardControls)
- Plain CSS (no Tailwind)

Goals:
1. Core character controller + physics world (DONE)
2. Character animations (walk cycle, jump pose)
3. Better world: more Roblox-like parts, materials, kill bricks, checkpoints
4. UI shell (menus, game list) resembling Roblox
5. Multiplayer / persistence (later)

Coding Standards:
- Client components in /components, marked 'use client'
- One component per file, plain JSX, functional components
- Physics constants at top of file (WALK_SPEED, JUMP_VELOCITY)
