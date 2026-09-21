import { Component, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

class SceneBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function SolarField() {
  return (
    <group>
      {Array.from({ length: 18 }, (_, index) => {
        const row = Math.floor(index / 6)
        const column = index % 6
        return (
          <mesh key={index} position={[(column - 2.5) * 0.62, (row - 1) * 0.68, Math.sin(column) * 0.08]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[0.48, 0.03, 0.56]} />
            <meshStandardMaterial color="#163c35" metalness={0.7} roughness={0.28} />
          </mesh>
        )
      })}
      <mesh position={[0, -1.08, 0]}><boxGeometry args={[4.3, 0.08, 2.6]} /><meshStandardMaterial color="#17201d" /></mesh>
    </group>
  )
}

function PowerField() {
  return (
    <group>
      {[-1.35, 0, 1.35].map((x, index) => (
        <group position={[x, -0.25, index === 1 ? 0.15 : -0.25]} key={x}>
          <mesh><cylinderGeometry args={[0.12, 0.18, 2.3, 12]} /><meshStandardMaterial color="#d5d9ce" metalness={0.6} /></mesh>
          <group position={[0, 1.05, 0]} rotation={[0, 0, index * 0.7]}>
            {[0, 2.094, 4.188].map((angle) => <mesh key={angle} rotation={[0, 0, angle]} position={[0, 0.54, 0]}><boxGeometry args={[0.1, 1.05, 0.06]} /><meshStandardMaterial color="#e8e7dc" /></mesh>)}
            <mesh><sphereGeometry args={[0.18, 16, 10]} /><meshStandardMaterial color="#b8ff68" emissive="#72b52a" emissiveIntensity={1.5} /></mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function DataField() {
  return (
    <group>
      {Array.from({ length: 10 }, (_, index) => {
        const x = (index % 5 - 2) * 0.72
        const y = Math.floor(index / 5) * 1.2 - 0.55
        return <mesh key={index} position={[x, y, Math.abs(x) * -0.18]}><boxGeometry args={[0.48, 0.92, 0.7]} /><meshStandardMaterial color={index % 3 ? '#172724' : '#255347'} metalness={0.65} roughness={0.3} /></mesh>
      })}
      {Array.from({ length: 15 }, (_, index) => <mesh key={`light-${index}`} position={[(index % 5 - 2) * 0.72, Math.floor(index / 5) * 0.24 - 0.68, 0.39]}><boxGeometry args={[0.22, 0.035, 0.02]} /><meshBasicMaterial color={index % 4 ? '#b8ff68' : '#f3b860'} /></mesh>)}
    </group>
  )
}

function RecyclingField() {
  const group = useRef()
  useFrame((_, delta) => { group.current.rotation.z += delta * 0.08 })
  return (
    <group ref={group} rotation={[0.65, 0.1, 0]}>
      {[1, 1.55, 2.05].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, index * 0.25, 0]}>
          <torusGeometry args={[radius, 0.09 + index * 0.025, 10, 64, Math.PI * 1.65]} />
          <meshStandardMaterial color={index === 1 ? '#b8ff68' : '#3f655b'} emissive={index === 1 ? '#355d22' : '#000000'} />
        </mesh>
      ))}
      <mesh><icosahedronGeometry args={[0.58, 1]} /><meshStandardMaterial color="#d8d6c9" wireframe /></mesh>
    </group>
  )
}

function World({ chapter, progress }) {
  const rig = useRef()
  const core = useRef()
  useFrame((state, delta) => {
    const target = chapter * Math.PI * 0.5
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, target, 3.2, delta)
    core.current.rotation.x += delta * 0.08
    core.current.rotation.y += delta * 0.13
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, Math.sin(progress * Math.PI) * 0.22, 3, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 5]} intensity={2.8} color="#fff8df" />
      <pointLight position={[-3, -1, 2]} intensity={18} color="#69dca5" distance={8} />
      <group ref={rig}>
        <group position={[0, 0, 3.2]}><SolarField /></group>
        <group position={[-3.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}><PowerField /></group>
        <group position={[0, 0, -3.2]} rotation={[0, Math.PI, 0]}><DataField /></group>
        <group position={[3.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><RecyclingField /></group>
      </group>
      <mesh ref={core} scale={0.42}>
        <octahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#b8ff68" emissive="#68a832" emissiveIntensity={1.4} wireframe />
      </mesh>
      <fog attach="fog" args={['#07100e', 5.5, 13]} />
    </>
  )
}

export default function EnergyScene({ chapter, progress, onFailure }) {
  const context = useRef()
  const [ready, setReady] = useState(false)
  useEffect(() => () => context.current?.removeEventListener('webglcontextlost', onFailure), [onFailure])
  return (
    <SceneBoundary onFailure={onFailure}>
      <p className={`scene-status ${ready ? 'is-ready' : ''}`}>Initializing energy field</p>
      <Canvas camera={{ position: [0, 0.2, 6.2], fov: 40 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
        context.current = gl.domElement
        gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true })
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        setReady(true)
      }}>
        <World chapter={chapter} progress={progress} />
      </Canvas>
    </SceneBoundary>
  )
}
