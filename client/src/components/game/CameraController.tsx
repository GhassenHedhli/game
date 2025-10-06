import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZeroGravityPhysics } from '../../lib/physics';

interface CameraControllerProps {
  physics: ZeroGravityPhysics;
  playerBodyIndex: number;
  enemyBodyIndex: number;
}

// Camera shake state
let shakeIntensity = 0;
let shakeDuration = 0;

export const triggerCameraShake = (intensity: number = 0.3, duration: number = 0.2) => {
  shakeIntensity = intensity;
  shakeDuration = duration;
};

const CameraController = ({ physics, playerBodyIndex, enemyBodyIndex }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 5, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const shakeOffset = useRef(new THREE.Vector3(0, 0, 0));

  const ARENA_RADIUS = 20;
  const MIN_CAMERA_DISTANCE = 15;
  const MAX_CAMERA_DISTANCE = 25;

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    currentLookAt.current.set(0, 0, 0);
  }, [camera]);

  useFrame((state, delta) => {
    const playerBody = physics.getBody(playerBodyIndex);
    const enemyBody = physics.getBody(enemyBodyIndex);

    // Handle case where one or both bodies don't exist yet
    let focusPoint = new THREE.Vector3(0, 0, 0);
    let distance = 10;

    if (playerBody && enemyBody) {
      // Both exist: focus on midpoint
      focusPoint.addVectors(playerBody.position, enemyBody.position).multiplyScalar(0.5);
      distance = playerBody.position.distanceTo(enemyBody.position);
    } else if (playerBody) {
      // Only player exists: focus on player
      focusPoint.copy(playerBody.position);
      distance = 10;
    } else if (enemyBody) {
      // Only enemy exists: focus on enemy
      focusPoint.copy(enemyBody.position);
      distance = 10;
    } else {
      // Neither exists: stay at origin
      focusPoint.set(0, 0, 0);
      distance = 10;
    }

    // Adjust camera distance based on fighter separation
    const cameraDistance = Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, distance * 1.5 + 10));

    // Calculate desired camera position (above and behind the focus point)
    const desiredCameraHeight = 8; // Fixed height above focus point
    targetPosition.current.set(
      focusPoint.x,
      focusPoint.y + desiredCameraHeight,
      focusPoint.z + cameraDistance
    );

    // Clamp camera position to stay within arena bounds
    const cameraDistanceFromCenter = targetPosition.current.length();
    if (cameraDistanceFromCenter > ARENA_RADIUS - 2) {
      targetPosition.current.normalize().multiplyScalar(ARENA_RADIUS - 2);
    }

    // Set target look-at point
    targetLookAt.current.copy(focusPoint);
    
    // Update camera shake
    if (shakeDuration > 0) {
      shakeDuration -= delta;
      const currentIntensity = shakeIntensity * (shakeDuration / 0.2); // Decay over time
      shakeOffset.current.set(
        (Math.random() - 0.5) * currentIntensity,
        (Math.random() - 0.5) * currentIntensity,
        (Math.random() - 0.5) * currentIntensity
      );
    } else {
      shakeOffset.current.set(0, 0, 0);
    }

    // Smoothly interpolate camera position with shake
    const finalPosition = targetPosition.current.clone().add(shakeOffset.current);
    camera.position.lerp(finalPosition, 0.05);

    // Smoothly interpolate look-at target, then apply it
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

export default CameraController;
