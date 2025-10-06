import { useFrame } from '@react-three/fiber';
import { useRef, ReactNode } from 'react';
import { ZeroGravityPhysics } from '../../lib/physics';

interface PhysicsProviderProps {
  children: ReactNode;
}

// Physics provider component that manages the physics world
const PhysicsProvider = ({ children }: PhysicsProviderProps) => {
  const physicsRef = useRef(new ZeroGravityPhysics());

  useFrame((state, delta) => {
    // Update physics world
    physicsRef.current.update(delta);
  });

  return <>{children}</>;
};

export default PhysicsProvider;
