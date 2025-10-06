import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

import { ZeroGravityPhysics } from '../../lib/physics';
import { Arena } from '../../lib/gameData';
import { useGameStore } from '../../lib/stores/useGameStore';

interface HazardsProps {
  arenaData: Arena;
  physics: ZeroGravityPhysics;
  hazardBodies: number[];
}

const Hazards = ({ arenaData, physics, hazardBodies }: HazardsProps) => {
  const [laserPositions, setLaserPositions] = useState<THREE.Vector3[]>([]);
  const [pistonStates, setPistonStates] = useState<{ position: THREE.Vector3; extended: boolean }[]>([]);
  const [spikeRotation, setSpikeRotation] = useState(0);
  
  const laserRefs = useRef<THREE.Group[]>([]);
  const pistonRefs = useRef<THREE.Group[]>([]);
  const spikeRefs = useRef<THREE.Group[]>([]);

  const { endMatch } = useGameStore();

  // Initialize hazards based on arena
  useEffect(() => {
    if (arenaData.hazards.includes('lasers')) {
      // Create 3 laser walls that move across the arena
      const positions = [
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(0, 10, 0),
        new THREE.Vector3(10, 0, 0)
      ];
      setLaserPositions(positions);
    }

    if (arenaData.hazards.includes('pistons')) {
      // Create 4 pistons on the walls
      const states = [
        { position: new THREE.Vector3(14, 0, 0), extended: false },
        { position: new THREE.Vector3(-14, 0, 0), extended: false },
        { position: new THREE.Vector3(0, 14, 0), extended: false },
        { position: new THREE.Vector3(0, -14, 0), extended: false }
      ];
      setPistonStates(states);
    }

    if (arenaData.hazards.includes('spikes')) {
      setSpikeRotation(0);
    }
  }, [arenaData]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Animate lasers
    if (arenaData.hazards.includes('lasers')) {
      setLaserPositions(prev => prev.map((pos, index) => {
        const newPos = pos.clone();
        newPos.x = Math.sin(time + index * 2) * 8;
        newPos.y = Math.cos(time * 0.7 + index * 1.5) * 6;
        return newPos;
      }));
    }

    // Animate pistons
    if (arenaData.hazards.includes('pistons')) {
      setPistonStates(prev => prev.map((piston, index) => {
        const shouldExtend = Math.sin(time * 2 + index * Math.PI * 0.5) > 0.3;
        return { ...piston, extended: shouldExtend };
      }));
    }

    // Animate spikes
    if (arenaData.hazards.includes('spikes')) {
      setSpikeRotation(prev => prev + delta * 0.5);
    }

    // Check hazard collisions
    checkHazardCollisions();
  });

  const checkHazardCollisions = () => {
    const playerBody = physics.getBody(0); // Assuming player is body 0
    const enemyBody = physics.getBody(1); // Assuming enemy is body 1

    if (!playerBody || !enemyBody) return;

    // Check laser collisions
    if (arenaData.hazards.includes('lasers')) {
      laserPositions.forEach((laserPos) => {
        const playerDistance = playerBody.position.distanceTo(laserPos);
        const enemyDistance = enemyBody.position.distanceTo(laserPos);

        if (playerDistance < 2) {
          console.log('Player hit by laser!');
          endMatch(false);
        }
        if (enemyDistance < 2) {
          console.log('Enemy hit by laser!');
          endMatch(true);
        }
      });
    }

    // Check piston collisions
    if (arenaData.hazards.includes('pistons')) {
      pistonStates.forEach((piston) => {
        if (!piston.extended) return;

        const extendedPos = piston.position.clone();
        // Extend 6 units towards center
        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), piston.position).normalize();
        extendedPos.add(direction.multiplyScalar(6));

        const playerDistance = playerBody.position.distanceTo(extendedPos);
        const enemyDistance = enemyBody.position.distanceTo(extendedPos);

        if (playerDistance < 2) {
          console.log('Player crushed by piston!');
          endMatch(false);
        }
        if (enemyDistance < 2) {
          console.log('Enemy crushed by piston!');
          endMatch(true);
        }
      });
    }

    // Check spike collisions
    if (arenaData.hazards.includes('spikes')) {
      const spikePositions = [
        new THREE.Vector3(Math.cos(spikeRotation) * 8, Math.sin(spikeRotation) * 8, 0),
        new THREE.Vector3(Math.cos(spikeRotation + Math.PI) * 8, Math.sin(spikeRotation + Math.PI) * 8, 0)
      ];

      spikePositions.forEach((spikePos) => {
        const playerDistance = playerBody.position.distanceTo(spikePos);
        const enemyDistance = enemyBody.position.distanceTo(spikePos);

        if (playerDistance < 2) {
          console.log('Player hit by spike ball!');
          endMatch(false);
        }
        if (enemyDistance < 2) {
          console.log('Enemy hit by spike ball!');
          endMatch(true);
        }
      });
    }
  };

  return (
    <group>
      {/* Laser hazards */}
      {arenaData.hazards.includes('lasers') && laserPositions.map((position, index) => (
        <group key={`laser-${index}`} position={position.toArray()}>
          <mesh>
            <boxGeometry args={[0.2, 20, 0.2]} />
            <meshBasicMaterial color={arenaData.hazardColors.lasers || '#ff0066'} />
          </mesh>
          {/* Laser glow effect */}
          <mesh>
            <boxGeometry args={[1, 20, 1]} />
            <meshBasicMaterial 
              color={arenaData.hazardColors.lasers || '#ff0066'}
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Piston hazards */}
      {arenaData.hazards.includes('pistons') && pistonStates.map((piston, index) => {
        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), piston.position).normalize();
        const extendDistance = piston.extended ? 6 : 1;
        const pistonPos = piston.position.clone().add(direction.multiplyScalar(extendDistance));

        return (
          <group key={`piston-${index}`} position={pistonPos.toArray()}>
            <mesh>
              <boxGeometry args={[2, 2, 8]} />
              <meshLambertMaterial color={arenaData.hazardColors.pistons || '#666666'} />
            </mesh>
            {/* Piston warning light */}
            <mesh position={[0, 0, 5]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial 
                color={piston.extended ? '#ff0000' : '#ffaa00'} 
              />
            </mesh>
          </group>
        );
      })}

      {/* Spike ball hazards */}
      {arenaData.hazards.includes('spikes') && [0, Math.PI].map((offset, index) => {
        const x = Math.cos(spikeRotation + offset) * 8;
        const y = Math.sin(spikeRotation + offset) * 8;

        return (
          <group key={`spike-${index}`} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshLambertMaterial color={arenaData.hazardColors.spikes || '#ffaa00'} />
            </mesh>
            {/* Spikes */}
            {Array.from({ length: 8 }).map((_, spikeIndex) => {
              const angle = (spikeIndex / 8) * Math.PI * 2;
              const spikeX = Math.cos(angle) * 1.8;
              const spikeY = Math.sin(angle) * 1.8;

              return (
                <mesh key={spikeIndex} position={[spikeX, spikeY, 0]}>
                  <coneGeometry args={[0.2, 1, 4]} />
                  <meshLambertMaterial color={arenaData.hazardColors.spikes || '#ffaa00'} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export default Hazards;
