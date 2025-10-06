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
      {/* Arena floor grid */}
      <gridHelper 
        args={[30, 30, arenaData.hazardColors.lasers || '#444444', '#222222']} 
        position={[0, -10, 0]}
      />

      {/* Arena walls (visual only, physics handled above) */}
      {[
        [15, 0, 0, [1, 30, 30]], [-15, 0, 0, [1, 30, 30]], // Sides
        [0, 15, 0, [30, 1, 30]], [0, -15, 0, [30, 1, 30]], // Top/Bottom
        [0, 0, 15, [30, 30, 1]], [0, 0, -15, [30, 30, 1]]  // Front/Back
      ].map(([x, y, z, size], index) => (
        <mesh key={index} position={[x, y, z] as [number, number, number]}>
          <boxGeometry args={size as [number, number, number]} />
          <meshBasicMaterial 
            color={arenaData.backgroundColor}
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Arena name display */}
      <mesh position={[0, 12, -14]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export default Arena;
