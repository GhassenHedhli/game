import { create } from 'zustand';
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

interface ParticleStore {
  effects: ParticleEffect[];
  addEffect: (particles: Particle[]) => void;
  removeEffect: (index: number) => void;
  clearEffects: () => void;
}

export const useParticleStore = create<ParticleStore>((set) => ({
  effects: [],
  
  addEffect: (particles) => set((state) => ({
    effects: [...state.effects, { particles, createdAt: Date.now() }]
  })),
  
  removeEffect: (index) => set((state) => ({
    effects: state.effects.filter((_, i) => i !== index)
  })),
  
  clearEffects: () => set({ effects: [] })
}));

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
