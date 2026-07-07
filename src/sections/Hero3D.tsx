"use client"

import { useRef, useMemo, type ComponentPropsWithoutRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Sphere, Box, Cylinder, Cone } from "@react-three/drei"
import * as THREE from "three"

type Vec3 = [number, number, number]

type SceneProps = {
  position?: Vec3
  rotationSpeed?: number
  scale?: number
}

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let t = Math.imul(state ^ (state >>> 15), state | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Coin({ position, rotationSpeed = 0.5, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005 * rotationSpeed
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + (position?.[0] ?? 0)) * 0.002
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Cylinder args={[0.3, 0.3, 0.08, 32]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.8} roughness={0.15} clearcoat={0.2} envMapIntensity={1.5} />
      </Cylinder>
      <Cylinder args={[0.25, 0.25, 0.085, 32]} position={[0, 0.005, 0]}>
        <meshPhysicalMaterial color="#E8A800" metalness={0.9} roughness={0.1} clearcoat={0.3} envMapIntensity={1.5} />
      </Cylinder>
    </group>
  )
}

function BankBuilding({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.3 + 1) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Box args={[0.8, 1.2, 0.6]}>
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.3} roughness={0.5} clearcoat={0.1} />
      </Box>
      <Box args={[0.6, 0.15, 0.4]} position={[0, -0.3, 0]}>
        <meshPhysicalMaterial color="#1a5276" metalness={0.4} roughness={0.4} />
      </Box>
      <Cone args={[0.5, 0.3, 4]} position={[0, 0.8, 0]}>
        <meshPhysicalMaterial color="#1a5276" metalness={0.3} roughness={0.4} />
      </Cone>
      <Box args={[0.2, 0.4, 0.05]} position={[0, 0.1, 0.31]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.6} roughness={0.2} clearcoat={0.2} />
      </Box>
    </group>
  )
}

function PiggyBank({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + 2) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Sphere args={[0.25, 28, 28]}>
        <meshPhysicalMaterial color="#16A34A" metalness={0.2} roughness={0.3} clearcoat={0.2} />
      </Sphere>
      <Sphere args={[0.18, 28, 28]} position={[0, 0.18, 0]}>
        <meshPhysicalMaterial color="#16A34A" metalness={0.2} roughness={0.3} clearcoat={0.2} />
      </Sphere>
      <Cone args={[0.04, 0.08, 4]} position={[0, 0.28, 0.02]}>
        <meshPhysicalMaterial color="#22c55e" metalness={0.1} roughness={0.4} />
      </Cone>
      <Sphere args={[0.04, 20, 20]} position={[-0.1, 0.05, 0.22]}>
        <meshPhysicalMaterial color="#111827" roughness={0.8} />
      </Sphere>
      <Sphere args={[0.04, 20, 20]} position={[0.1, 0.05, 0.22]}>
        <meshPhysicalMaterial color="#111827" roughness={0.8} />
      </Sphere>
      <Box args={[0.02, 0.06, 0.02]} position={[0, -0.1, 0.25]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.4} roughness={0.4} />
      </Box>
    </group>
  )
}

function Shield({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.003
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.6 + 3) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Sphere args={[0.22, 28, 28]}>
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.6} roughness={0.2} clearcoat={0.3} transparent opacity={0.9} />
      </Sphere>
      <Box args={[0.12, 0.12, 0.03]} position={[0, 0, 0.12]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.5} roughness={0.3} clearcoat={0.2} emissive="#F4B400" emissiveIntensity={0.05} />
      </Box>
    </group>
  )
}

function Vault({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  return (
    <group ref={ref} position={position} {...props}>
      <Cylinder args={[0.2, 0.25, 0.35, 20]}>
        <meshPhysicalMaterial color="#4B5563" metalness={0.9} roughness={0.15} clearcoat={0.3} envMapIntensity={2} />
      </Cylinder>
      <Sphere args={[0.06, 20, 20]} position={[0, 0, 0.18]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.7} roughness={0.15} clearcoat={0.2} />
      </Sphere>
      <Box args={[0.08, 0.08, 0.02]} position={[0, 0, 0.16]}>
        <meshPhysicalMaterial color="#1F2937" metalness={0.5} roughness={0.4} />
      </Box>
    </group>
  )
}

function GrowthChart({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + 4) * 0.001
    }
  })
  const bars = useMemo(() => {
    const heights = [0.15, 0.25, 0.18, 0.35, 0.22, 0.4, 0.3]
    return heights.map((h, i) => ({
      height: h,
      position: [(i - 3) * 0.08, h / 2 - 0.15, 0] as [number, number, number],
    }))
  }, [])
  return (
    <group ref={ref} position={position} {...props}>
      <Box args={[0.6, 0.02, 0.02]} position={[0, -0.15, 0]}>
        <meshPhysicalMaterial color="#16A34A" />
      </Box>
      {bars.map((bar, i) => (
        <Box key={i} args={[0.05, bar.height, 0.05]} position={bar.position}>
          <meshPhysicalMaterial
            color={i === 5 ? "#F4B400" : "#16A34A"}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.85}
            clearcoat={0.1}
          />
        </Box>
      ))}
    </group>
  )
}

function DigitalCard({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.004
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.7 + 5) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Box args={[0.5, 0.3, 0.02]}>
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.2} roughness={0.2} clearcoat={0.3} envMapIntensity={0.5} />
      </Box>
      <Box args={[0.1, 0.02, 0.025]} position={[-0.12, -0.05, 0.02]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.5} roughness={0.3} />
      </Box>
      <Box args={[0.3, 0.02, 0.025]} position={[0, 0.08, 0.02]}>
        <meshPhysicalMaterial color="#FFFFFF" metalness={0.1} roughness={0.5} />
      </Box>
      <Box args={[0.05, 0.05, 0.025]} position={[0.18, -0.08, 0.02]}>
        <meshPhysicalMaterial color="#16A34A" metalness={0.3} roughness={0.4} clearcoat={0.2} />
      </Box>
    </group>
  )
}

function Diamond({ position, scale = 1, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + 6) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} scale={scale} {...props}>
      <mesh>
        <octahedronGeometry args={[0.15, 0]} />
        <meshPhysicalMaterial color="#16A34A" metalness={0.8} roughness={0.1} clearcoat={0.5} emissive="#16A34A" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.06, 0.06, 4]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.6} roughness={0.2} emissive="#F4B400" emissiveIntensity={0.05} />
      </mesh>
    </group>
  )
}

function Star({ position, scale = 1, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const outerR = 0.18
    const innerR = 0.07
    const points = 5
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i * Math.PI) / points - Math.PI / 2
      if (i === 0) s.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
      else s.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    s.closePath()
    return s
  }, [])
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.3
      ref.current.rotation.y += 0.003
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + 7) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} scale={scale} {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 4 }]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.5} roughness={0.15} clearcoat={0.3} emissive="#F4B400" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

function Wallet({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.003
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + 8) * 0.001
    }
  })
  return (
    <group ref={ref} position={position} {...props}>
      <Box args={[0.38, 0.26, 0.05]}>
        <meshPhysicalMaterial color="#7C5C3E" metalness={0.3} roughness={0.5} />
      </Box>
      <Box args={[0.36, 0.24, 0.06]} position={[0, 0, 0.01]}>
        <meshPhysicalMaterial color="#8B6914" metalness={0.2} roughness={0.4} />
      </Box>
      <Box args={[0.02, 0.06, 0.07]} position={[0.2, 0, 0]}>
        <meshPhysicalMaterial color="#F4B400" metalness={0.5} roughness={0.3} />
      </Box>
    </group>
  )
}

function Document({ position, ...props }: SceneProps & ComponentPropsWithoutRef<"group">) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + 9) * 0.001
    }
  })
  const lines = useMemo(() => [
    { width: 0.22, y: 0.12 },
    { width: 0.16, y: 0.04 },
    { width: 0.2, y: -0.04 },
    { width: 0.12, y: -0.12 },
  ], [])
  return (
    <group ref={ref} position={position} {...props}>
      <Box args={[0.35, 0.45, 0.015]}>
        <meshPhysicalMaterial color="#F8FAFC" metalness={0.05} roughness={0.7} />
      </Box>
      {lines.map((line, i) => (
        <Box key={i} args={[line.width, 0.015, 0.003]} position={[0, line.y, 0.02]}>
          <meshPhysicalMaterial color="#CBD5E1" roughness={0.9} />
        </Box>
      ))}
    </group>
  )
}

function Particles({ count = 80 }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const random = seeded(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (random() - 0.5) * 6
      pos[i * 3 + 1] = (random() - 0.5) * 4
      pos[i * 3 + 2] = (random() - 0.5) * 3 - 1
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return geo
  }, [count])

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0002
    }
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.02} color="#F4B400" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function SceneContent() {
  const { mouse } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (mouse.y * 0.02 - groupRef.current.rotation.x) * 0.02
      groupRef.current.rotation.y += (mouse.x * 0.02 - groupRef.current.rotation.y) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Coin position={[-1.2, 0.8, 0]} rotationSpeed={0.8} />
        <Coin position={[1.5, -0.5, -0.3]} rotationSpeed={0.6} />
        <Coin position={[-0.8, -1, 0.2]} rotationSpeed={1} />
        <Coin position={[2, 0.6, -0.5]} rotationSpeed={0.7} />
      </Float>

      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
        <BankBuilding position={[-2.2, -0.3, -0.8]} />
      </Float>

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <PiggyBank position={[2.5, -0.2, -0.6]} />
      </Float>

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Shield position={[-1.8, 1.2, -0.4]} />
      </Float>

      <group position={[0, -1.5, -0.7]}>
        <Vault />
      </group>

      <Float speed={0.9} rotationIntensity={0.1} floatIntensity={0.3}>
        <GrowthChart position={[1, 1.3, -0.5]} />
      </Float>

      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.4}>
        <DigitalCard position={[-0.5, -1.3, -0.3]} />
      </Float>

      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.6}>
        <Diamond position={[-2.5, 0.5, -0.6]} scale={1.3} />
        <Diamond position={[2.8, -0.8, -0.7]} scale={0.9} />
      </Float>

      <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.4}>
        <Star position={[0.5, 1.5, -0.8]} scale={1.2} />
        <Star position={[-1.5, -0.8, -0.5]} scale={0.8} />
      </Float>

      <Float speed={1.0} rotationIntensity={0.15} floatIntensity={0.4}>
        <Wallet position={[-0.3, 0.5, -0.2]} />
      </Float>

      <Float speed={0.9} rotationIntensity={0.1} floatIntensity={0.3}>
        <Document position={[1.8, -1.0, -0.3]} />
      </Float>

      <Particles count={120} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-3, 2, 4]} intensity={0.3} color="#F4B400" />
      <directionalLight position={[0, -2, -4]} intensity={0.4} color="#F4B400" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#16A34A" />
      <pointLight position={[-2, -1, 1]} intensity={0.3} color="#F4B400" />
      <hemisphereLight args={["#0B3C5D", "#16A34A", 0.3]} />
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
