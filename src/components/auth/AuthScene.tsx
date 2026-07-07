"use client"

import { useMemo, useRef, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

function useBob(ref: RefObject<THREE.Group | null>, speed = 0.5, tilt = 0.04) {
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.0004
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * tilt
  })
}

function Coin({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group | null>(null)
  useBob(group, 0.5, 0.03)
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.005
  })
  return (
    <group ref={group} position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.07, 32]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.95} roughness={0.12} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.01, 0.01]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 32]} />
        <meshPhysicalMaterial color="#ffd977" metalness={0.6} roughness={0.18} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function Shield({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group | null>(null)
  useBob(group, 0.45, 0.05)
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.002
  })
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0.44)
    s.lineTo(0.26, 0.3)
    s.lineTo(0.23, -0.03)
    s.lineTo(0, -0.44)
    s.lineTo(-0.23, -0.03)
    s.lineTo(-0.26, 0.3)
    s.closePath()
    return s
  }, [])
  return (
    <group ref={group} position={position}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 6 }]} />
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.42} roughness={0.22} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0.02, 0.08]} castShadow>
        <boxGeometry args={[0.1, 0.18, 0.04]} />
        <meshPhysicalMaterial color="#F4B400" metalness={0.55} roughness={0.2} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

function CreditCard({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group | null>(null)
  useBob(group, 0.4, 0.03)
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.0015
  })
  return (
    <group ref={group} position={position}>
      <RoundedBox args={[0.95, 0.6, 0.05]} radius={0.08} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f8fafc" metalness={0.15} roughness={0.28} transparent opacity={0.65} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.1, 0.04]} radius={0.03} smoothness={4} position={[-0.26, -0.06, 0.04]} castShadow>
        <meshPhysicalMaterial color="#F4B400" metalness={0.6} roughness={0.2} transparent opacity={0.65} />
      </RoundedBox>
      <mesh position={[0.1, 0.08, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.04, 0.03]} />
        <meshPhysicalMaterial color="#0B3C5D" metalness={0.22} roughness={0.35} transparent opacity={0.65} />
      </mesh>
    </group>
  )
}

function Scene() {
  const { mouse } = useThree()
  const drift = useRef<THREE.Group | null>(null)

  useFrame(() => {
    if (!drift.current) return
    drift.current.rotation.x += (mouse.y * 0.03 - drift.current.rotation.x) * 0.02
    drift.current.rotation.y += (mouse.x * 0.04 - drift.current.rotation.y) * 0.02
  })

  return (
    <group ref={drift}>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#e2f0ff", "#0B3C5D", 0.4]} />
      <directionalLight position={[4, 5, 6]} intensity={1.2} color="#fff7d6" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 2, 3]} intensity={0.4} color="#F4B400" />
      <pointLight position={[-2, -1, 3]} intensity={0.5} color="#16A34A" />
      <pointLight position={[3, 1, 2]} intensity={0.5} color="#ffffff" />

      <Float speed={0.6} floatIntensity={0.2} rotationIntensity={0.08}>
        <Shield position={[-1.6, 1.0, -0.3]} />
      </Float>
      <Float speed={0.5} floatIntensity={0.18} rotationIntensity={0.06}>
        <CreditCard position={[0.2, 0.8, -0.7]} />
      </Float>
      <Float speed={0.7} floatIntensity={0.22} rotationIntensity={0.08}>
        <Coin position={[-1.0, -0.8, 0.2]} />
      </Float>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

export default function AuthScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
