import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

interface ParticleEffect {
  particles: Particle[];
  createdAt: number;
}

interface ParticleEffectsProps {
  effects: ParticleEffect[];
  onEffectComplete: (index: number) => void;
}

const ParticleEffect = ({ effect, onComplete }: { effect: ParticleEffect; onComplete: () => void }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const materialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame((state, delta) => {
    let allDead = true;

    effect.particles.forEach((particle, index) => {
      particle.life -= delta;
      
      if (particle.life > 0) {
        allDead = false;
        
        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        particle.velocity.multiplyScalar(0.95); // Damping
        
        // Update mesh position
        const mesh = meshRefs.current[index];
        if (mesh) {
          mesh.position.copy(particle.position);
        }
        
        // Update material opacity
        const material = materialRefs.current[index];
        if (material) {
          material.opacity = particle.life / particle.maxLife;
        }
      }
    });

    if (allDead) {
      onComplete();
    }
  });

  return (
    <group>
      {effect.particles.map((particle, index) => (
        <mesh
          key={index}
          ref={(el) => (meshRefs.current[index] = el)}
          position={particle.position}
        >
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            ref={(el) => (materialRefs.current[index] = el)}
            color={particle.color}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
};

const ParticleEffects = ({ effects, onEffectComplete }: ParticleEffectsProps) => {
  return (
    <group>
      {effects.map((effect, index) => (
        <ParticleEffect
          key={index}
          effect={effect}
          onComplete={() => onEffectComplete(index)}
        />
      ))}
    </group>
  );
};

export default ParticleEffects;

// Helper function to create impact particles
export const createImpactParticles = (
  position: THREE.Vector3,
  color: THREE.Color,
  count: number = 20
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 3 + Math.random() * 3;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      (Math.random() - 0.5) * speed
    );
    
    particles.push({
      position: position.clone(),
      velocity,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.5 + Math.random() * 0.3,
      size: 0.1 + Math.random() * 0.1,
      color: color.clone()
    });
  }
  
  return particles;
};

// Helper function to create attack trail particles
export const createAttackTrailParticles = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  color: THREE.Color,
  count: number = 10
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const position = new THREE.Vector3().lerpVectors(start, end, t);
    
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    
    particles.push({
      position,
      velocity,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.3 + Math.random() * 0.2,
      size: 0.15 + Math.random() * 0.1,
      color: color.clone()
    });
  }
  
  return particles;
};
