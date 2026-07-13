# Progress

## Completed
- Next.js 16 + R3F + Rapier project scaffolded
- Classic R6 noob avatar with face
- Character controller: WASD/arrows, jump, camera-relative movement, avatar turns toward movement
- Third-person orbit camera (drag rotate, scroll zoom, touch support)
- Physics world: baseplate, spawn pad, obby stairs, floating platforms, walls, ramp, spinning platform, pushable dynamic bricks
- Respawn when falling off map
- HUD controls overlay
- Verified working in browser (movement + jump tested)

## Status
Core playable prototype complete. ~15% toward full Roblox-like experience.

## Known Bugs
- Grounded check is velocity-based; can occasionally jump at apex. Fix with downward raycast.
- No walk/jump animations yet (avatar is rigid).

## Remaining Issues
- No mobile joystick (touch only rotates camera)
