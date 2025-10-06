import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { ZeroGravityPhysics } from '../../lib/physics';
import { Character, getMovementStats, calculateForce } from '../../lib/gameData';
import { useGameStore } from '../../lib/stores/useGameStore';
import { useAudio } from '../../lib/stores/useAudio';

interface PlayerProps {
  character: Character;
  physics: ZeroGravityPhysics;
  onBodyCreated: (index: number) => void;
  enemyBodyIndex: number;
}

const Player = ({ character, physics, onBodyCreated, enemyBodyIndex }: PlayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [bodyIndex, setBodyIndex] = useState<number>(-1);
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  const { setPlayerCharge, setEnemyHealth, enemyHealth } = useGameStore();
  const { playHit } = useAudio();

  // Get keyboard controls
  const [, get] = useKeyboardControls();

  const movementStats = getMovementStats(character);

  useEffect(() => {
    // Create physics body for player
    const index = physics.addBody({
      position: new THREE.Vector3(-8, 0, 0), // Start on left side
      velocity: new THREE.Vector3(0, 0, 0),
      acceleration: new THREE.Vector3(0, 0, 0),
      mass: character.stats.weight,
      radius: 1.5
    });
    
    setBodyIndex(index);
    onBodyCreated(index);

    return () => {
      if (index >= 0) {
        physics.removeBody(index);
      }
    };
  }, [character, physics, onBodyCreated]);

  useFrame((state, delta) => {
    if (bodyIndex < 0) return;

    const body = physics.getBody(bodyIndex);
    if (!body || !meshRef.current) return;

    // Update mesh position to match physics body
    meshRef.current.position.copy(body.position);

    // Get current control states
    const controls = get();

    // Movement controls
    const thrustVector = new THREE.Vector3(0, 0, 0);
    
    if (controls.thrustUp) thrustVector.y += 1;
    if (controls.thrustDown) thrustVector.y -= 1;
    if (controls.thrustLeft) thrustVector.x -= 1;
    if (controls.thrustRight) thrustVector.x += 1;

    // Apply thrust
    if (thrustVector.length() > 0) {
      physics.applyThrust(bodyIndex, thrustVector, movementStats.acceleration * character.stats.weight);
    }

    // Rotation controls
    if (controls.rotateLeft) {
      meshRef.current.rotation.z += movementStats.rotationSpeed * delta;
    }
    if (controls.rotateRight) {
      meshRef.current.rotation.z -= movementStats.rotationSpeed * delta;
    }

    // Charge attack
    if (controls.chargedSlam) {
      if (!isCharging) {
        setIsCharging(true);
        setCharge(0);
      }
      const newCharge = Math.min(100, charge + (delta * 100)); // 1 second to full charge
      setCharge(newCharge);
      setPlayerCharge(newCharge);
    } else if (isCharging) {
      // Release charged attack
      performAttack(true);
      setIsCharging(false);
      setCharge(0);
      setPlayerCharge(0);
    }

    // Basic punch
    if (controls.punch && !isCharging) {
      performAttack(false);
    }
  });

  const performAttack = (isCharged: boolean) => {
    if (bodyIndex < 0 || enemyBodyIndex < 0) return;

    const playerBody = physics.getBody(bodyIndex);
    const enemyBody = physics.getBody(enemyBodyIndex);
    
    if (!playerBody || !enemyBody) return;

    // Check if enemy is in range (within 3 units)
    const distance = playerBody.position.distanceTo(enemyBody.position);
    if (distance > 3) return;

    // Calculate attack force
    const baseAttackPower = character.stats.power;
    const chargeMultiplier = isCharged ? (charge / 100) * 3 + 1 : 1; // 1x to 4x multiplier
    const enemyWeight = 5; // Assuming enemy weight for now

    const force = calculateForce(baseAttackPower, chargeMultiplier, enemyWeight);
    
    // Apply knockback to enemy
    const knockbackDirection = new THREE.Vector3()
      .subVectors(enemyBody.position, playerBody.position)
      .normalize();
    
    physics.applyForce(enemyBodyIndex, knockbackDirection.multiplyScalar(force * 10));

    // Deal damage based on force
    const damage = Math.min(30, force * 2);
    setEnemyHealth(enemyHealth - damage);

    // Play hit sound
    playHit();

    console.log(`Player attack: ${isCharged ? 'Charged' : 'Basic'}, Force: ${force.toFixed(2)}, Damage: ${damage}`);
  };

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshLambertMaterial 
        color={character.color}
        transparent
        opacity={isCharging ? 0.8 + (charge / 100) * 0.2 : 0.8}
      />
      
      {/* Charge indicator */}
      {isCharging && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.5 + (charge / 100), 8, 8]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.3 + (charge / 100) * 0.4}
          />
        </mesh>
      )}

      {/* Thrust indicators */}
      <group>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(i * Math.PI * 0.5) * 1.2,
              Math.sin(i * Math.PI * 0.5) * 1.2,
              0
            ]}
          >
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </mesh>
  );
};

export default Player;
