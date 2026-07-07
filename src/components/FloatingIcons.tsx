"use client"

import { useRef, useMemo, type ComponentType } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import { usePathname } from "next/navigation"
import * as THREE from "three"

function DiamondIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <octahedronGeometry args={[0.2, 0]} />
        <meshPhysicalMaterial
          color="#16A34A"
          metalness={0.7}
          roughness={0.1}
          clearcoat={0.3}
          emissive="#16A34A"
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.08, 0.08, 4]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.6} roughness={0.2} emissive="#F4B400" emissiveIntensity={0.05} />
      </mesh>
    </group>
  )
}

function GlobeIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += 0.005
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.3} roughness={0.4} clearcoat={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.21, 20, 20]} />
        <meshPhysicalMaterial
          color="#16A34A"
          transparent
          opacity={0.15}
          wireframe
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

function StarIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const outerR = 0.2
    const innerR = 0.08
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
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    ref.current.rotation.y += 0.003
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 4 }]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.5} roughness={0.2} emissive="#F4B400" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

function DocumentIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.15, 0.2, 0.02]} />
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.04, 0.02]}>
        <boxGeometry args={[0.08, 0.01, 0.01]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.01, 0.02]}>
        <boxGeometry args={[0.1, 0.01, 0.01]} />
        <meshPhysicalMaterial color="#16A34A" metalness={0.2} roughness={0.4} />
      </mesh>
    </group>
  )
}

function HandshakeIcon({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.4) * 0.001
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[-0.08, 0, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshPhysicalMaterial color="#16A34A" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

function CoinsStack({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += 0.004
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      {[0, 0.04, 0.08].map((y, i) => (
        <mesh key={i} position={[0, y - 0.04, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
          <meshPhysicalMaterial
            color={i === 1 ? "#F4B400" : i === 0 ? "#E8A800" : "#D4A000"}
            metalness={0.7}
            roughness={0.2}
            clearcoat={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

function IconsLayout() {
  const icons: { Component: ComponentType<{ position: [number, number, number]; scale?: number }>; pos: [number, number, number]; scale: number }[] = [
    { Component: DiamondIcon, pos: [-4, 1.5, -2], scale: 1.2 },
    { Component: GlobeIcon, pos: [4.5, -1, -1.5], scale: 1 },
    { Component: StarIcon, pos: [-3.5, -1.8, -2.5], scale: 1.3 },
    { Component: DocumentIcon, pos: [3, 2, -1.8], scale: 1.1 },
    { Component: HandshakeIcon, pos: [-2, -2.2, -2], scale: 1 },
    { Component: CoinsStack, pos: [2.5, -2, -2.2], scale: 1 },
    { Component: DiamondIcon, pos: [5, 1.8, -3], scale: 0.8 },
    { Component: StarIcon, pos: [-5, -0.5, -3.5], scale: 0.9 },
    { Component: GlobeIcon, pos: [0, 2.5, -2.8], scale: 0.7 },
    { Component: CoinsStack, pos: [-1, -2.8, -3], scale: 0.8 },
  ]

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-3, 2, 4]} intensity={0.2} color="#F4B400" />
      <hemisphereLight args={["#0B3C5D", "#16A34A", 0.2]} />

      {icons.map(({ Component, pos, scale }, i) => (
        <Float key={i} speed={0.6 + i * 0.05} rotationIntensity={0.1} floatIntensity={0.4}>
          <Component position={pos} scale={scale} />
        </Float>
      ))}
    </>
  )
}

export default function FloatingIcons() {
  const pathname = usePathname()

  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <IconsLayout />
      </Canvas>
    </div>
  )
}
