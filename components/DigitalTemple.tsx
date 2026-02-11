'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Stars, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { useStore, Structure } from '../store/useStore';
import * as THREE from 'three';

/* ─── Individual Structure Mesh ─── */
const StructureMesh = ({ data }: { data: Structure }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const glowRef = useRef<THREE.PointLight>(null!);

    const isGold = data.value > 5;
    const color = isGold ? '#FFD700' : '#836EF9';
    const emissiveColor = isGold ? '#FFD700' : '#00E5FF';

    // Gentle rotation
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    const height = Math.max(1.5, data.value * 0.6);
    const baseRadius = 0.3 + data.value * 0.05;

    return (
        <group position={[data.x, 0, data.y]}>
            {/* Glow light at base */}
            <pointLight
                ref={glowRef}
                position={[0, height / 2, 0]}
                color={emissiveColor}
                intensity={2}
                distance={8}
                decay={2}
            />

            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
                <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow>
                    {data.type === 'pillar' && (
                        <cylinderGeometry args={[baseRadius * 0.7, baseRadius, height, 6]} />
                    )}
                    {data.type === 'obelisk' && (
                        <coneGeometry args={[baseRadius, height * 1.5, 4]} />
                    )}
                    {data.type === 'node' && (
                        <dodecahedronGeometry args={[baseRadius * 2, 0]} />
                    )}
                    <meshStandardMaterial
                        color={color}
                        emissive={emissiveColor}
                        emissiveIntensity={0.6}
                        roughness={0.15}
                        metalness={0.9}
                        toneMapped={false}
                    />
                </mesh>
            </Float>

            {/* Base glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[baseRadius * 1.2, baseRadius * 2, 32]} />
                <meshBasicMaterial
                    color={emissiveColor}
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

/* ─── Ground Plane (subtle reflective floor) ─── */
const GroundPlane = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
            color="#141414"
            roughness={0.9}
            metalness={0.05}
        />
    </mesh>
);

/* ─── Scene Content ─── */
const SceneContent = () => {
    const structures = useStore((state) => state.structures);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} color="#836EF9" />
            <directionalLight position={[10, 20, 10]} intensity={0.4} color="#E8E0FF" />
            <pointLight position={[-15, 10, -15]} intensity={0.5} color="#836EF9" />
            <pointLight position={[15, 5, 15]} intensity={0.3} color="#00E5FF" />

            {/* Starfield */}
            <Stars
                radius={150}
                depth={80}
                count={8000}
                factor={5}
                saturation={0.2}
                fade
                speed={0.5}
            />

            {/* Grid Floor */}
            <Grid
                renderOrder={-1}
                position={[0, 0, 0]}
                infiniteGrid
                cellSize={2}
                sectionSize={6}
                cellThickness={0.4}
                sectionThickness={0.8}
                cellColor="#2a2a2a"
                sectionColor="rgba(131, 110, 249, 0.5)"
                fadeDistance={55}
                fadeStrength={1.5}
            />

            <GroundPlane />

            {/* Structures */}
            {structures.map((s) => (
                <StructureMesh key={s.id} data={s} />
            ))}

            {/* Fog for depth */}
            <fog attach="fog" args={['#141414', 25, 70]} />
        </>
    );
};

/* ─── Main Component ─── */
export default function DigitalTemple() {
    return (
        <Canvas
            shadows
            camera={{ position: [15, 12, 15], fov: 50, near: 0.1, far: 200 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onCreated={({ gl }) => {
                gl.setClearColor('#141414');
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.2;
            }}
        >
            <SceneContent />
            <OrbitControls
                makeDefault
                autoRotate
                autoRotateSpeed={0.4}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={8}
                maxDistance={50}
                enableDamping
                dampingFactor={0.05}
            />
        </Canvas>
    );
}
