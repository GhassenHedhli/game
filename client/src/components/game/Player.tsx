import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, useGLTF } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { ZeroGravityPhysics } from '../../lib/physics';
import { Character, getMovementStats, calculateForce } from '../../lib/gameData';
import { useGameStore } from '../../lib/stores/useGameStore';
import { useAudio } from '../../lib/stores/useAudio';
import { useParticleStore, createImpactParticles } from '../../lib/stores/useParticleStore';
import { triggerCameraShake } from './CameraController';

// Preload the model
useGLTF.preload('/geometries/player_gladiator.glb');

interface PlayerProps {
  character: Character;
  physics: ZeroGravityPhysics;
  onBodyCreated: (index: number) => void;
  enemyBodyIndex: number;
}

const Player = ({ character, physics, onBodyCreated, enemyBodyIndex }: PlayerProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [bodyIndex, setBodyIndex] = useState<number>(-1);
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  const { setPlayerCharge, setEnemyHealth, enemyHealth } = useGameStore();
  const { playHit } = useAudio();
  const { addEffect } = useParticleStore();

  // Get keyboard controls
  const [, get] = useKeyboardControls();

  const movementStats = getMovementStats(character);
  
  // Load the 3D model
  const { scene } = useGLTF('/geometries/player_gladiator.glb');

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

    // Apply thrust with improved acceleration
    if (thrustVector.length() > 0) {
      // Use weight-compensated acceleration from movement stats
      physics.applyThrust(bodyIndex, thrustVector.clone(), movementStats.acceleration * 10);
      
      // Create thrust particles for visual feedback
      if (Math.random() < 0.3) {
        const thrustColor = new THREE.Color(character.color);
        const thrustDirection = thrustVector.clone().normalize();
        const particlePosition = body.position.clone().sub(thrustDirection.multiplyScalar(1.5));
        const thrustParticles = createImpactParticles(particlePosition, thrustColor, 3);
        addEffect(thrustParticles);
      }
    }
    
    // Apply velocity clamping based on character's max velocity
    const currentSpeed = body.velocity.length();
    if (currentSpeed > movementStats.maxVelocity) {
      body.velocity.normalize().multiplyScalar(movementStats.maxVelocity);
    }

    // Rotation controls with improved responsiveness
    if (controls.rotateLeft) {
      meshRef.current.rotation.z += movementStats.rotationSpeed * delta * 10;
    }
    if (controls.rotateRight) {
      meshRef.current.rotation.z -= movementStats.rotationSpeed * delta * 10;
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
    
    // Trigger camera shake based on attack strength
    const shakeIntensity = isCharged ? 0.8 * (charge / 100) : 0.3;
    triggerCameraShake(shakeIntensity, 0.2);

    // Create impact particles at enemy position
    const impactColor = isCharged ? new THREE.Color('#ffff00') : new THREE.Color('#ff6600');
    const particleCount = isCharged ? 40 + (charge / 100) * 30 : 25;
    const particles = createImpactParticles(enemyBody.position, impactColor, particleCount);
    addEffect(particles);

    console.log(`Player attack: ${isCharged ? 'Charged' : 'Basic'}, Force: ${force.toFixed(2)}, Damage: ${damage}`);
  };

  return (
    <group ref={meshRef}>
      {/* 3D Gladiator Model with enhanced rendering */}
      <primitive 
        object={scene.clone()} 
        scale={2.8}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
      
      {/* Enhanced color energy sphere */}
      <mesh scale={[2.2, 2.2, 2.2]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial 
          color={character.color}
          transparent
          opacity={isCharging ? 0.4 + (charge / 100) * 0.3 : 0.25}
          emissive={character.color}
          emissiveIntensity={isCharging ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Charge indicator with enhanced effects */}
      {isCharging && (
        <>
          <mesh position={[0, 3.5, 0]}>
            <sphereGeometry args={[0.6 + (charge / 100) * 0.8, 16, 16]} />
            <meshStandardMaterial 
              color="#ffff00" 
              transparent 
              opacity={0.4 + (charge / 100) * 0.5}
              emissive="#ffff00"
              emissiveIntensity={1.5 + (charge / 100)}
            />
          </mesh>
          
          {/* Charging energy rings */}
          <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1 + (charge / 100), 0.1, 8, 32]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {/* Enhanced energy aura with glow */}
      <mesh scale={[2.4, 2.4, 2.4]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshBasicMaterial 
          color={character.color} 
          transparent 
          opacity={0.12}
          wireframe
        />
      </mesh>
      
      {/* Outer energy field */}
      <mesh scale={[2.6, 2.6, 2.6]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial 
          color={character.color} 
          transparent 
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Player directional indicator */}
      <mesh position={[0, 0, 1.8]} scale={[0.3, 0.3, 0.8]}>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial 
          color={character.color}
          emissive={character.color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

export default Player;
