'use client'

/*
 * "Scout" - an original blocky character with the classic R6 silhouette:
 * 6 box body parts, jointed at shoulders / hips / neck so it can animate.
 * Unique touches: cyan visor eyes, chest panel + belt, shoulder pads,
 * a little backpack and an antenna. No external model assets.
 */

const C = {
  skin: '#f2c14e', // warm blocky yellow
  torso: '#0e7c86', // deep teal shirt
  panel: '#f76f2d', // orange chest panel
  belt: '#233138',
  legs: '#39424e', // charcoal pants
  boot: '#20262d',
  visor: '#12333a',
  eye: '#4ef0ff', // glowing cyan eyes
  pack: '#f76f2d',
  packStrap: '#233138',
}

export default function Avatar({ rig }) {
  return (
    <group ref={(n) => (rig.current.root = n)}>
      {/* ---- Head (pivots at neck) ---- */}
      <group position={[0, 1.15, 0]} ref={(n) => (rig.current.head = n)}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
          <meshStandardMaterial color={C.skin} roughness={0.7} />
        </mesh>
        {/* Visor band */}
        <mesh position={[0, 0.58, 0.41]}>
          <boxGeometry args={[0.7, 0.28, 0.06]} />
          <meshStandardMaterial color={C.visor} roughness={0.3} />
        </mesh>
        {/* Glowing eyes */}
        <mesh position={[-0.17, 0.58, 0.45]}>
          <boxGeometry args={[0.14, 0.14, 0.02]} />
          <meshStandardMaterial color={C.eye} emissive={C.eye} emissiveIntensity={1.6} />
        </mesh>
        <mesh position={[0.17, 0.58, 0.45]}>
          <boxGeometry args={[0.14, 0.14, 0.02]} />
          <meshStandardMaterial color={C.eye} emissive={C.eye} emissiveIntensity={1.6} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, 0.3, 0.43]}>
          <boxGeometry args={[0.34, 0.06, 0.02]} />
          <meshStandardMaterial color={C.visor} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0.28, 0.98, 0]} castShadow>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial color={C.belt} />
        </mesh>
        <mesh position={[0.28, 1.13, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={C.eye} emissive={C.eye} emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* ---- Torso ---- */}
      <group>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.15, 1.2, 0.6]} />
          <meshStandardMaterial color={C.torso} roughness={0.8} />
        </mesh>
        {/* Chest panel */}
        <mesh position={[0, 0.72, 0.31]}>
          <boxGeometry args={[0.6, 0.42, 0.04]} />
          <meshStandardMaterial color={C.panel} roughness={0.6} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.18, 0.14, 0.63]} />
          <meshStandardMaterial color={C.belt} roughness={0.6} />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0.65, -0.42]} castShadow>
          <boxGeometry args={[0.7, 0.75, 0.26]} />
          <meshStandardMaterial color={C.pack} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.65, -0.56]}>
          <boxGeometry args={[0.5, 0.2, 0.04]} />
          <meshStandardMaterial color={C.packStrap} />
        </mesh>
      </group>

      {/* ---- Left arm (pivots at shoulder) ---- */}
      <group position={[-0.85, 1.1, 0]} ref={(n) => (rig.current.leftArm = n)}>
        {/* Shoulder pad */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.6, 0.24, 0.66]} />
          <meshStandardMaterial color={C.panel} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[0.52, 1.15, 0.58]} />
          <meshStandardMaterial color={C.skin} roughness={0.7} />
        </mesh>
        {/* Glove */}
        <mesh position={[0, -1.02, 0]} castShadow>
          <boxGeometry args={[0.54, 0.26, 0.6]} />
          <meshStandardMaterial color={C.belt} roughness={0.6} />
        </mesh>
      </group>

      {/* ---- Right arm ---- */}
      <group position={[0.85, 1.1, 0]} ref={(n) => (rig.current.rightArm = n)}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.6, 0.24, 0.66]} />
          <meshStandardMaterial color={C.panel} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[0.52, 1.15, 0.58]} />
          <meshStandardMaterial color={C.skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, -1.02, 0]} castShadow>
          <boxGeometry args={[0.54, 0.26, 0.6]} />
          <meshStandardMaterial color={C.belt} roughness={0.6} />
        </mesh>
      </group>

      {/* ---- Left leg (pivots at hip) ---- */}
      <group position={[-0.3, -0.05, 0]} ref={(n) => (rig.current.leftLeg = n)}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.55, 1.2, 0.58]} />
          <meshStandardMaterial color={C.legs} roughness={0.8} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -1.12, 0.03]} castShadow>
          <boxGeometry args={[0.57, 0.24, 0.64]} />
          <meshStandardMaterial color={C.boot} roughness={0.6} />
        </mesh>
      </group>

      {/* ---- Right leg ---- */}
      <group position={[0.3, -0.05, 0]} ref={(n) => (rig.current.rightLeg = n)}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.55, 1.2, 0.58]} />
          <meshStandardMaterial color={C.legs} roughness={0.8} />
        </mesh>
        <mesh position={[0, -1.12, 0.03]} castShadow>
          <boxGeometry args={[0.57, 0.24, 0.64]} />
          <meshStandardMaterial color={C.boot} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
