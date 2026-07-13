# Decisions

1. Web-based clone using React Three Fiber + Rapier (not Roblox Studio/Luau) - runs in browser, previewable, no external engine needed.
2. Next.js 16 App Router, plain JSX (no TS) - keeps codebase simple and fast to iterate.
3. Rapier physics with high gravity (-55) and velocity-based movement (setLinvel) - matches Roblox's snappy, non-floaty character feel.
4. Third-person orbit camera controlled by drag (not pointer lock) - closest to default Roblox camera and works on touch.
5. Avatar built from box primitives (classic R6 noob) instead of loaded models - zero assets required, authentic classic look.
6. "type": "module" in package.json - required by Next 16/Turbopack for ESM source files.
