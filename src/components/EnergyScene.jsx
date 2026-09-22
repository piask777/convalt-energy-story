import { Component, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function SolarField({ reducedMotion }) {
  const sweep = useRef()
  useFrame((state) => {
    if (!reducedMotion && sweep.current) sweep.current.position.x = Math.sin(state.clock.elapsedTime * 0.55) * 1.7
  })
  return (
    <group rotation={[0.04, -0.22, 0]}>
      {Array.from({ length: 15 }, (_, index) => {
        const row = Math.floor(index / 5)
        const column = index % 5
        return (
          <group key={index} position={[(column - 2) * 0.8, 0.05, (row - 1) * 0.9]} rotation={[-0.34, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.64, 0.055, 0.68]} />
              <meshPhysicalMaterial color="#173f48" metalness={0.78} roughness={0.18} clearcoat={0.7} />
            </mesh>
            <mesh position={[0, 0.034, 0]}>
              <boxGeometry args={[0.56, 0.012, 0.6]} />
              <meshBasicMaterial color={index % 3 === 0 ? '#75c7b3' : '#285e62'} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, -0.36, 0]} receiveShadow><boxGeometry args={[4.8, 0.18, 3.5]} /><meshStandardMaterial color="#111b18" roughness={0.85} /></mesh>
      <group ref={sweep} position={[0, 0.75, 0]}>
        <mesh castShadow><boxGeometry args={[0.12, 1.55, 0.12]} /><meshStandardMaterial color="#d7d9d0" metalness={0.8} /></mesh>
        <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.2, 0.1, 0.12]} /><meshStandardMaterial color="#b8ff68" emissive="#5b872b" emissiveIntensity={0.8} /></mesh>
      </group>
    </group>
  )
}

function Turbine({ x, z, phase, reducedMotion }) {
  const rotor = useRef()
  useFrame((_, delta) => {
    if (!reducedMotion && rotor.current) rotor.current.rotation.z -= delta * 0.58
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.78, 0]} castShadow><cylinderGeometry args={[0.08, 0.16, 2.65, 16]} /><meshStandardMaterial color="#d7ddd6" metalness={0.55} roughness={0.3} /></mesh>
      <group ref={rotor} position={[0, 2.08, 0.05]} rotation={[0, 0, phase]}>
        {[0, 2.094, 4.188].map((angle) => (
          <group key={angle} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[0.13, 1.35, 0.07]} /><meshStandardMaterial color="#edf0e9" metalness={0.3} roughness={0.25} /></mesh>
          </group>
        ))}
        <mesh castShadow><sphereGeometry args={[0.2, 20, 12]} /><meshStandardMaterial color="#b8ff68" emissive="#72b52a" emissiveIntensity={1.7} /></mesh>
      </group>
    </group>
  )
}

function PowerField({ reducedMotion }) {
  return (
    <group position={[0, -0.55, 0]} rotation={[0.05, -0.25, 0]}>
      <Turbine x={-1.55} z={0.15} phase={0.2} reducedMotion={reducedMotion} />
      <Turbine x={0} z={-0.35} phase={0.8} reducedMotion={reducedMotion} />
      <Turbine x={1.55} z={0.2} phase={1.4} reducedMotion={reducedMotion} />
      <mesh position={[0, -0.08, 0]} receiveShadow><cylinderGeometry args={[2.85, 2.85, 0.18, 64]} /><meshStandardMaterial color="#13201c" roughness={0.9} /></mesh>
    </group>
  )
}

function DataField() {
  return (
    <group position={[0, 0.15, 0]} rotation={[0.08, -0.4, 0]}>
      {Array.from({ length: 10 }, (_, index) => {
        const side = index % 2 ? 1 : -1
        const row = Math.floor(index / 2)
        return (
          <group key={index} position={[side * 1.35, 0, (row - 2) * 0.78]} rotation={[0, side * -0.12, 0]}>
            <mesh castShadow receiveShadow><boxGeometry args={[0.78, 2.25, 0.58]} /><meshPhysicalMaterial color={index % 3 ? '#142522' : '#21483f'} metalness={0.72} roughness={0.23} clearcoat={0.35} /></mesh>
            {[-0.68, -0.34, 0, 0.34, 0.68].map((y, light) => <mesh key={y} position={[-side * 0.398, y, 0.12]}><boxGeometry args={[0.012, 0.045, 0.3]} /><meshBasicMaterial color={light % 3 ? '#b8ff68' : '#f3b860'} /></mesh>)}
          </group>
        )
      })}
      <mesh position={[0, -1.18, 0]} receiveShadow><boxGeometry args={[4.1, 0.12, 4.7]} /><meshStandardMaterial color="#101a18" roughness={0.82} /></mesh>
      <mesh position={[0, 1.42, 0]}><boxGeometry args={[0.08, 0.08, 4.1]} /><meshBasicMaterial color="#b8ff68" /></mesh>
    </group>
  )
}

function RecyclingField({ reducedMotion }) {
  const group = useRef()
  useFrame((_, delta) => { if (!reducedMotion && group.current) group.current.rotation.z += delta * 0.11 })
  return (
    <group ref={group} rotation={[0.72, 0.2, 0.12]}>
      {[1, 1.55, 2.05].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, index * 0.25, 0]} castShadow>
          <torusGeometry args={[radius, 0.13 + index * 0.035, 14, 72, Math.PI * 1.72]} />
          <meshPhysicalMaterial color={index === 1 ? '#b8ff68' : '#3f655b'} metalness={0.65} roughness={0.22} emissive={index === 1 ? '#355d22' : '#000000'} clearcoat={0.45} />
        </mesh>
      ))}
      <mesh castShadow><icosahedronGeometry args={[0.68, 1]} /><meshStandardMaterial color="#d8d6c9" metalness={0.7} roughness={0.18} wireframe /></mesh>
    </group>
  )
}

function Stage({ chapter, progress, compact, reducedMotion }) {
  const stage = useRef()
  const core = useRef()
  useFrame((state, delta) => {
    const targetX = compact ? 0 : 1.55
    const targetY = compact ? 1.18 : 0
    stage.current.position.x = THREE.MathUtils.damp(stage.current.position.x, targetX, 4, delta)
    stage.current.position.y = THREE.MathUtils.damp(stage.current.position.y, targetY, 4, delta)
    stage.current.rotation.y = THREE.MathUtils.damp(stage.current.rotation.y, (chapter - 1.5) * -0.12, 3.5, delta)
    if (!reducedMotion) {
      core.current.rotation.x += delta * 0.08
      core.current.rotation.y += delta * 0.13
    }
    const drift = reducedMotion ? 0 : Math.sin(progress * Math.PI) * 0.2
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, compact ? 0 : 4.8 + state.pointer.x * 0.18, 2.8, delta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, (compact ? 3.05 : 2.6) + drift + state.pointer.y * 0.12, 2.8, delta)
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, compact ? 8.7 : 7.4, 2.8, delta)
    state.camera.lookAt(compact ? 0 : 1.2, compact ? 0.95 : 0.1, 0)
  })

  const scenes = [
    <SolarField key="solar" reducedMotion={reducedMotion} />,
    <PowerField key="power" reducedMotion={reducedMotion} />,
    <DataField key="data" />,
    <RecyclingField key="recycling" reducedMotion={reducedMotion} />,
  ]

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.75} color="#dfffe8" groundColor="#06110e" />
      <directionalLight position={[4, 7, 5]} intensity={3.5} color="#fff8df" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, 1, 3]} intensity={24} color="#69dca5" distance={10} />
      <pointLight position={[4, 3, -3]} intensity={16} color="#b8ff68" distance={9} />
      <group ref={stage}>
        <group key={chapter}>{scenes[chapter]}</group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
          <circleGeometry args={[4.8, 64]} />
          <meshStandardMaterial color="#0c1714" roughness={0.88} metalness={0.12} />
        </mesh>
        {[2.8, 3.5, 4.2].map((radius) => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.26, 0]}><ringGeometry args={[radius, radius + 0.012, 96]} /><meshBasicMaterial color="#44665c" transparent opacity={0.55} /></mesh>)}
      </group>
      <mesh ref={core} scale={0.24} position={[compact ? 0 : -0.65, compact ? 0.1 : -0.65, 1]}>
        <octahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#b8ff68" emissive="#68a832" emissiveIntensity={1.4} wireframe />
      </mesh>
      <fog attach="fog" args={['#07100e', 8, 16]} />
    </>
  )
}

export default function EnergyScene({ chapter, progress, compact, reducedMotion, onFailure }) {
  const context = useRef()
  const [ready, setReady] = useState(false)
  useEffect(() => () => context.current?.removeEventListener('webglcontextlost', onFailure), [onFailure])
  return (
    <SceneBoundary onFailure={onFailure}>
      <p className={`scene-status ${ready ? 'is-ready' : ''}`}>Initializing energy field</p>
      <Canvas shadows={!compact} camera={{ position: compact ? [0, 3.05, 8.7] : [4.8, 2.6, 7.4], fov: compact ? 42 : 38 }} dpr={compact ? [1, 1.25] : [1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
        context.current = gl.domElement
        gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true })
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        setReady(true)
      }}>
        <Stage chapter={chapter} progress={progress} compact={compact} reducedMotion={reducedMotion} />
      </Canvas>
    </SceneBoundary>
  )
}
