import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { ZeroGravityPhysics } from '../../lib/physics';
import { Character, getMovementStats, calculateForce } from '../../lib/gameData';
import { useGameStore } from '../../lib/stores/useGameStore';
import { useAudio } from '../../lib/stores/useAudio';
import { useParticleStore, createImpactParticles } from '../../lib/stores/useParticleStore';
import { triggerCameraShake } from './CameraController';

interface EnemyProps {
  character: Character;
  physics: ZeroGravityPhysics;
  onBodyCreated: (index: number) => void;
  playerBodyIndex: number;
}

const Enemy = ({ character, physics, onBodyCreated, playerBodyIndex }: EnemyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [bodyIndex, setBodyIndex] = useState<number>(-1);
  const [aiState, setAiState] = useState<'idle' | 'approach' | 'attack' | 'retreat'>('idle');
  const [attackCooldown, setAttackCooldown] = useState(0);
  const [stateTimer, setStateTimer] = useState(0);

  const { setPlayerHealth, playerHealth, currentWave, gameMode } = useGameStore();
  const { playHit } = useAudio();
  const { addEffect } = useParticleStore();

  const movementStats = getMovementStats(character);
  
  // Scale enemy difficulty based on wave (for endless mode)
  const difficultyMultiplier = gameMode === 'endless' ? 1 + (currentWave - 1) * 0.1 : 1;

  useEffect(() => {
    // Create physics body for enemy
    const index = physics.addBody({
      position: new THREE.Vector3(8, 0, 0), // Start on right side
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
    if (bodyIndex < 0 || playerBodyIndex < 0) return;

    const body = physics.getBody(bodyIndex);
    const playerBody = physics.getBody(playerBodyIndex);
    
    if (!body || !playerBody || !meshRef.current) return;

    // Update mesh position
    meshRef.current.position.copy(body.position);

    // Update timers
    setAttackCooldown(Math.max(0, attackCooldown - delta));
    setStateTimer(stateTimer + delta);

    // AI Decision making
    const distanceToPlayer = body.position.distanceTo(playerBody.position);
    const shouldSwitchState = stateTimer > getStateDuration(aiState);

    if (shouldSwitchState || shouldChangeState(distanceToPlayer)) {
      updateAIState(distanceToPlayer);
      setStateTimer(0);
    }

    // Execute current AI state
    executeAIBehavior(body, playerBody, distanceToPlayer, delta);

    // Look at player (rotation)
    const direction = new THREE.Vector3()
      .subVectors(playerBody.position, body.position)
      .normalize();
    
    const angle = Math.atan2(direction.y, direction.x);
    meshRef.current.rotation.z = angle;
  });

  const getStateDuration = (state: string): number => {
    switch (state) {
      case 'idle': return 1.0 + Math.random();
      case 'approach': return 2.0 + Math.random();
      case 'attack': return 0.5;
      case 'retreat': return 1.5 + Math.random();
      default: return 1.0;
    }
  };

  const shouldChangeState = (distance: number): boolean => {
    switch (aiState) {
      case 'idle':
        return distance < 10; // Start moving when player is close
      case 'approach':
        return distance < 3; // Switch to attack when in range
      case 'attack':
        return distance > 4; // Retreat after attacking
      case 'retreat':
        return distance > 8; // Stop retreating when far enough
      default:
        return false;
    }
  };

  const updateAIState = (distance: number): void => {
    if (distance < 3 && attackCooldown <= 0) {
      setAiState('attack');
    } else if (distance < 6 && aiState !== 'retreat') {
      setAiState('approach');
    } else if (distance > 10) {
      setAiState('idle');
    } else {
      setAiState('retreat');
    }

    console.log(`Enemy AI state: ${aiState}, Distance: ${distance.toFixed(2)}`);
  };

  const executeAIBehavior = (
    body: any, 
    playerBody: any, 
    distance: number, 
    delta: number
  ): void => {
    const direction = new THREE.Vector3()
      .subVectors(playerBody.position, body.position)
      .normalize();

    switch (aiState) {
      case 'idle':
        // Random small movements
        if (Math.random() < 0.1) {
          const randomThrust = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          );
          physics.applyThrust(bodyIndex, randomThrust, movementStats.acceleration * 0.3);
        }
        break;

      case 'approach':
        // Predictive targeting: aim for where player will be
        const playerVelocity = playerBody.velocity || new THREE.Vector3(0, 0, 0);
        const interceptTime = distance / (movementStats.maxVelocity * 0.7);
        const predictedPosition = playerBody.position.clone().add(
          playerVelocity.clone().multiplyScalar(interceptTime * difficultyMultiplier)
        );
        
        const interceptDirection = new THREE.Vector3()
          .subVectors(predictedPosition, body.position)
          .normalize();
        
        // Use improved movement stats
        physics.applyThrust(bodyIndex, interceptDirection, movementStats.acceleration * 10 * difficultyMultiplier);
        
        // Apply velocity clamping
        const currentSpeed = body.velocity.length();
        if (currentSpeed > movementStats.maxVelocity) {
          body.velocity.normalize().multiplyScalar(movementStats.maxVelocity);
        }
        break;

      case 'attack':
        if (distance < 3.5 && attackCooldown <= 0) {
          performAttack();
          setAttackCooldown(1.5); // Attack every 1.5 seconds
        }
        break;

      case 'retreat':
        // Move away from player
        physics.applyThrust(bodyIndex, direction.negate(), movementStats.acceleration * character.stats.weight * 0.6);
        break;
    }
  };

  const performAttack = (): void => {
    if (bodyIndex < 0 || playerBodyIndex < 0) return;

    const enemyBody = physics.getBody(bodyIndex);
    const playerBody = physics.getBody(playerBodyIndex);
    
    if (!enemyBody || !playerBody) return;

    const distance = enemyBody.position.distanceTo(playerBody.position);
    if (distance > 4) return;

    // Calculate attack force (scaled by difficulty)
    const baseAttackPower = character.stats.power * difficultyMultiplier;
    const chargeMultiplier = 1.2; // AI doesn't charge, but hits slightly harder
    const playerWeight = 5; // Assuming player weight

    const force = calculateForce(baseAttackPower, chargeMultiplier, playerWeight);
    
    // Apply knockback to player
    const knockbackDirection = new THREE.Vector3()
      .subVectors(playerBody.position, enemyBody.position)
      .normalize();
    
    physics.applyForce(playerBodyIndex, knockbackDirection.multiplyScalar(force * 8));

    // Deal damage (scaled by difficulty)
    const damage = Math.min(25 * difficultyMultiplier, force * 1.5);
    setPlayerHealth(playerHealth - damage);

    // Play hit sound
    playHit();
    
    // Trigger camera shake
    const shakeIntensity = 0.4 * difficultyMultiplier;
    triggerCameraShake(shakeIntensity, 0.15);

    // Create impact particles at player position
    const impactColor = new THREE.Color('#ff0000');
    const particleCount = 25 + Math.floor(difficultyMultiplier * 10);
    const particles = createImpactParticles(playerBody.position, impactColor, particleCount);
    addEffect(particles);

    console.log(`Enemy attack: Force: ${force.toFixed(2)}, Damage: ${damage}, Wave: ${currentWave}`);
  };

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshLambertMaterial 
        color="#ff4444"
        transparent
        opacity={0.8}
      />
      
      {/* AI State indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshBasicMaterial 
          color={
            aiState === 'attack' ? '#ff0000' :
            aiState === 'approach' ? '#ffaa00' :
            aiState === 'retreat' ? '#0088ff' : '#888888'
          }
          transparent 
          opacity={0.7}
        />
      </mesh>

      {/* Attack range indicator */}
      {aiState === 'attack' && (
        <mesh>
          <sphereGeometry args={[3.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </mesh>
  );
};

export default Enemy;
