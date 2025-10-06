import * as THREE from 'three';

export interface PhysicsBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  radius: number;
  isStatic?: boolean;
}

export class ZeroGravityPhysics {
  private bodies: PhysicsBody[] = [];
  private static readonly FRICTION = 0.98; // Space friction for gameplay
  private static readonly BOUNDARY_SIZE = 20;

  addBody(body: PhysicsBody): number {
    this.bodies.push(body);
    return this.bodies.length - 1;
  }

  removeBody(index: number): void {
    this.bodies.splice(index, 1);
  }

  update(deltaTime: number): void {
    // Update physics for all bodies
    for (const body of this.bodies) {
      if (body.isStatic) continue;

      // Apply acceleration to velocity
      body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime));
      
      // Apply position change
      body.position.add(body.velocity.clone().multiplyScalar(deltaTime));
      
      // Apply friction (space resistance for gameplay)
      body.velocity.multiplyScalar(ZeroGravityPhysics.FRICTION);
      
      // Reset acceleration (needs to be reapplied each frame)
      body.acceleration.set(0, 0, 0);
      
      // Boundary checking - eliminate if too far out
      if (body.position.length() > ZeroGravityPhysics.BOUNDARY_SIZE) {
        // Mark for elimination (handled by game logic)
      }
    }

    // Check collisions
    this.checkCollisions();
  }

  private checkCollisions(): void {
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];

        if (bodyA.isStatic && bodyB.isStatic) continue;

        const distance = bodyA.position.distanceTo(bodyB.position);
        const minDistance = bodyA.radius + bodyB.radius;

        if (distance < minDistance) {
          this.resolveCollision(bodyA, bodyB, distance, minDistance);
        }
      }
    }
  }

  private resolveCollision(bodyA: PhysicsBody, bodyB: PhysicsBody, distance: number, minDistance: number): void {
    // Separate the bodies
    const overlap = minDistance - distance;
    const separationVector = new THREE.Vector3()
      .subVectors(bodyB.position, bodyA.position)
      .normalize()
      .multiplyScalar(overlap * 0.5);

    if (!bodyA.isStatic) {
      bodyA.position.sub(separationVector);
    }
    if (!bodyB.isStatic) {
      bodyB.position.add(separationVector);
    }

    // Calculate momentum transfer
    const normal = new THREE.Vector3()
      .subVectors(bodyB.position, bodyA.position)
      .normalize();

    const relativeVelocity = new THREE.Vector3()
      .subVectors(bodyA.velocity, bodyB.velocity);

    const velocityAlongNormal = relativeVelocity.dot(normal);

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Restitution (bounciness)
    const restitution = 0.6;
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = bodyA.mass + bodyB.mass;

    if (!bodyA.isStatic) {
      const impulseA = normal.clone().multiplyScalar(impulseScalar * bodyB.mass / totalMass);
      bodyA.velocity.add(impulseA);
    }

    if (!bodyB.isStatic) {
      const impulseB = normal.clone().multiplyScalar(-impulseScalar * bodyA.mass / totalMass);
      bodyB.velocity.add(impulseB);
    }
  }

  applyForce(bodyIndex: number, force: THREE.Vector3): void {
    if (bodyIndex >= 0 && bodyIndex < this.bodies.length) {
      const body = this.bodies[bodyIndex];
      const acceleration = force.divideScalar(body.mass);
      body.acceleration.add(acceleration);
    }
  }

  applyThrust(bodyIndex: number, direction: THREE.Vector3, thrustPower: number): void {
    if (bodyIndex >= 0 && bodyIndex < this.bodies.length) {
      const body = this.bodies[bodyIndex];
      const thrust = direction.normalize().multiplyScalar(thrustPower);
      this.applyForce(bodyIndex, thrust);
    }
  }

  getBody(index: number): PhysicsBody | undefined {
    return this.bodies[index];
  }

  getBodies(): PhysicsBody[] {
    return this.bodies;
  }

  // Check if position is out of bounds
  isOutOfBounds(position: THREE.Vector3): boolean {
    return position.length() > ZeroGravityPhysics.BOUNDARY_SIZE;
  }

  // Get distance from center
  getDistanceFromCenter(position: THREE.Vector3): number {
    return position.length();
  }
}
