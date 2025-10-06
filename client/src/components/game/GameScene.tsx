import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { useGameStore } from '../../lib/stores/useGameStore';
import { ZeroGravityPhysics } from '../../lib/physics';
import { CHARACTERS, ARENAS } from '../../lib/gameData';
import Arena from './Arena';
import Player from './Player';
import Enemy from './Enemy';
import Hazards from './Hazards';
import CameraController from './CameraController';

const GameScene = () => {
  const { 
    selectedCharacter, 
    currentArena, 
    isMatchActive, 
    startMatch, 
    endMatch,
    updateMatchTimer,
    playerHealth,
    enemyHealth,
    currentWave
  } = useGameStore();

  const physicsRef = useRef(new ZeroGravityPhysics());
  const [playerBodyIndex, setPlayerBodyIndex] = useState<number>(-1);
  const [enemyBodyIndex, setEnemyBodyIndex] = useState<number>(-1);
  const [hazardBodies, setHazardBodies] = useState<number[]>([]);
  const [enemyKey, setEnemyKey] = useState(0); // Key to force enemy respawn

  const selectedCharacterData = CHARACTERS[selectedCharacter];
  const arenaData = ARENAS[currentArena];

  useEffect(() => {
    // Initialize match when scene loads
    if (!isMatchActive) {
      startMatch();
    }
  }, [isMatchActive, startMatch]);

  useEffect(() => {
    // Check victory/defeat conditions
    if (isMatchActive) {
      if (enemyHealth <= 0) {
        // In endless mode, respawn enemy for next wave
        if (useGameStore.getState().gameMode === 'endless') {
          console.log('Enemy defeated! Advancing to next wave...');
          useGameStore.getState().nextWave();
          // Force enemy component to remount
          setEnemyKey(prev => prev + 1);
        } else {
          endMatch(true);
        }
      } else if (playerHealth <= 0) {
        endMatch(false);
      }
    }
  }, [playerHealth, enemyHealth, isMatchActive, endMatch]);

  useFrame((state, delta) => {
    if (!isMatchActive) return;

    // Update physics
    physicsRef.current.update(delta);

    // Update match timer
    updateMatchTimer(delta);

    // Check boundary elimination
    const playerBody = physicsRef.current.getBody(playerBodyIndex);
    const enemyBody = physicsRef.current.getBody(enemyBodyIndex);

    if (playerBody && physicsRef.current.isOutOfBounds(playerBody.position)) {
      endMatch(false);
    }

    if (enemyBody && physicsRef.current.isOutOfBounds(enemyBody.position)) {
      // In endless mode, respawn enemy for next wave
      if (useGameStore.getState().gameMode === 'endless') {
        console.log('Enemy eliminated by boundary! Advancing to next wave...');
        useGameStore.getState().nextWave();
        setEnemyKey(prev => prev + 1); // Force enemy respawn
      } else {
        endMatch(true);
      }
    }
  });

  return (
    <group>
      {/* Dynamic Camera Controller */}
      <CameraController 
        physics={physicsRef.current}
        playerBodyIndex={playerBodyIndex}
        enemyBodyIndex={enemyBodyIndex}
      />

      {/* Arena */}
      <Arena 
        arenaData={arenaData}
        physics={physicsRef.current}
        onHazardBodies={setHazardBodies}
      />

      {/* Hazards */}
      <Hazards 
        arenaData={arenaData}
        physics={physicsRef.current}
        hazardBodies={hazardBodies}
      />

      {/* Player */}
      <Player
        character={selectedCharacterData}
        physics={physicsRef.current}
        onBodyCreated={setPlayerBodyIndex}
        enemyBodyIndex={enemyBodyIndex}
      />

      {/* Enemy */}
      <Enemy
        key={enemyKey} // Force remount on wave change
        character={selectedCharacterData} // For now, use same character
        physics={physicsRef.current}
        onBodyCreated={setEnemyBodyIndex}
        playerBodyIndex={playerBodyIndex}
      />

      {/* Arena boundaries visualization */}
      <mesh>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide}
          wireframe
        />
      </mesh>

      {/* Center reference point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
};

export default GameScene;
