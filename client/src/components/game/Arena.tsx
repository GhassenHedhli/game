import { useEffect } from 'react';
import * as THREE from 'three';
import { ZeroGravityPhysics } from '../../lib/physics';
import { Arena as ArenaData } from '../../lib/gameData';

interface ArenaProps {
  arenaData: ArenaData;
  physics: ZeroGravityPhysics;
  onHazardBodies: (bodies: number[]) => void;
}

const Arena = ({ arenaData, physics, onHazardBodies }: ArenaProps) => {
  useEffect(() => {
    const hazardBodies: number[] = [];

    // Add arena boundaries as static physics bodies
    const boundaryPositions = [
      [15, 0, 0], [-15, 0, 0], // Left/Right walls
      [0, 15, 0], [0, -15, 0], // Top/Bottom walls
      [0, 0, 15], [0, 0, -15]  // Front/Back walls
    ];

    boundaryPositions.forEach(([x, y, z]) => {
      const bodyIndex = physics.addBody({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        acceleration: new THREE.Vector3(0, 0, 0),
        mass: Infinity,
        radius: 2,
        isStatic: true
      });
      hazardBodies.push(bodyIndex);
    });

    onHazardBodies(hazardBodies);

    return () => {
      // Cleanup bodies when component unmounts
      hazardBodies.forEach(index => {
        physics.removeBody(index);
      });
    };
  }, [arenaData, physics, onHazardBodies]);

  return (
    <group>
      {/* Enhanced floor grid with glowing effect */}
      <gridHelper 
        args={[40, 40, arenaData.hazardColors.lasers || '#00d4ff', '#001122']} 
        position={[0, -12, 0]}
      />
      
      {/* Secondary smaller grid for detail */}
      <gridHelper 
        args={[40, 80, '#003355', '#000000']} 
        position={[0, -11.8, 0]}
      />

      {/* Glowing arena boundary sphere */}
      <mesh>
        <sphereGeometry args={[22, 32, 32]} />
        <meshStandardMaterial 
          color={arenaData.backgroundColor}
          transparent 
          opacity={0.15}
          side={THREE.BackSide}
          emissive={arenaData.backgroundColor}
          emissiveIntensity={0.3}
          wireframe={true}
        />
      </mesh>

      {/* Energy field walls with animated glow */}
      {[
        [18, 0, 0, [0.5, 36, 36]], [-18, 0, 0, [0.5, 36, 36]], // Sides
        [0, 18, 0, [36, 0.5, 36]], [0, -18, 0, [36, 0.5, 36]], // Top/Bottom
        [0, 0, 18, [36, 36, 0.5]], [0, 0, -18, [36, 36, 0.5]]  // Front/Back
      ].map(([x, y, z, size], index) => (
        <mesh key={index} position={[x, y, z] as [number, number, number]}>
          <boxGeometry args={size as [number, number, number]} />
          <meshStandardMaterial 
            color={arenaData.hazardColors.lasers || '#00ffff'}
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
            emissive={arenaData.hazardColors.lasers || '#00ffff'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Corner energy nodes */}
      {[
        [15, 15, 15], [-15, 15, 15], [15, -15, 15], [-15, -15, 15],
        [15, 15, -15], [-15, 15, -15], [15, -15, -15], [-15, -15, -15]
      ].map(([x, y, z], index) => (
        <mesh key={`node-${index}`} position={[x, y, z] as [number, number, number]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Floating space debris for atmosphere */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 25 + Math.random() * 5;
        return (
          <mesh 
            key={`debris-${i}`} 
            position={[
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 30,
              Math.sin(angle) * radius
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial 
              color="#333333"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default Arena;
