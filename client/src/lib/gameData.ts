export interface Character {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    weight: number;
    power: number;
    agility: number;
    health: number;
  };
  unlockCost: {
    currency: 'stardust' | 'gems';
    amount: number;
  };
  description: string;
  color: string;
}

export interface Arena {
  id: number;
  name: string;
  difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';
  hazards: string[];
  unlockCost: number;
  description: string;
  backgroundColor: string;
  hazardColors: Record<string, string>;
}

export const CHARACTERS: Record<string, Character> = {
  swift: {
    id: 'swift',
    name: 'Swift',
    rarity: 'common',
    stats: { weight: 3, power: 4, agility: 8, health: 100 },
    unlockCost: { currency: 'stardust', amount: 0 },
    description: 'Lightweight and agile, perfect for hit-and-run tactics',
    color: '#00ff88'
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    rarity: 'common',
    stats: { weight: 8, power: 7, agility: 2, health: 150 },
    unlockCost: { currency: 'stardust', amount: 0 },
    description: 'Heavy hitter with massive knockback power',
    color: '#ff4444'
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    rarity: 'common',
    stats: { weight: 5, power: 5, agility: 5, health: 125 },
    unlockCost: { currency: 'stardust', amount: 0 },
    description: 'Well-rounded fighter for all situations',
    color: '#4488ff'
  },
  ninja: {
    id: 'ninja',
    name: 'Ninja',
    rarity: 'rare',
    stats: { weight: 2, power: 3, agility: 10, health: 100 },
    unlockCost: { currency: 'stardust', amount: 500 },
    description: 'Ultra-fast with incredible maneuverability',
    color: '#8844ff'
  },
  crusher: {
    id: 'crusher',
    name: 'Crusher',
    rarity: 'epic',
    stats: { weight: 7, power: 8, agility: 3, health: 175 },
    unlockCost: { currency: 'stardust', amount: 800 },
    description: 'Devastating attacks with bone-crushing force',
    color: '#ff8844'
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    rarity: 'legendary',
    stats: { weight: 10, power: 9, agility: 1, health: 200 },
    unlockCost: { currency: 'gems', amount: 100 },
    description: 'Immovable object with unstoppable force',
    color: '#ffaa00'
  }
};

export const ARENAS: Record<number, Arena> = {
  1: {
    id: 1,
    name: 'Basic Box',
    difficulty: 'tutorial',
    hazards: [],
    unlockCost: 0,
    description: 'Simple training arena with no hazards',
    backgroundColor: '#001122',
    hazardColors: {}
  },
  2: {
    id: 2,
    name: 'Laser Grid',
    difficulty: 'easy',
    hazards: ['lasers'],
    unlockCost: 200,
    description: 'Moving laser walls that eliminate on contact',
    backgroundColor: '#220011',
    hazardColors: { lasers: '#ff0066' }
  },
  3: {
    id: 3,
    name: 'Piston Pit',
    difficulty: 'easy',
    hazards: ['pistons'],
    unlockCost: 300,
    description: 'Crushing pistons that slam from the walls',
    backgroundColor: '#112200',
    hazardColors: { pistons: '#666666' }
  },
  4: {
    id: 4,
    name: 'Spike Sphere',
    difficulty: 'medium',
    hazards: ['spikes'],
    unlockCost: 400,
    description: 'Rotating spike balls orbit the arena',
    backgroundColor: '#221100',
    hazardColors: { spikes: '#ffaa00' }
  }
};

// Force calculation as specified in the GDD
export function calculateForce(attackPower: number, chargeMultiplier: number, targetWeight: number): number {
  return (attackPower * chargeMultiplier) / (targetWeight * 0.1);
}

// Convert gladiator stats to movement parameters
export function getMovementStats(character: Character) {
  const { weight, agility } = character.stats;
  return {
    maxVelocity: 10 - (weight * 0.5), // Heavier = slower max speed
    acceleration: agility * 0.3, // Agility affects acceleration
    rotationSpeed: agility * 0.1, // Agility affects turning
    mass: weight // Used for momentum calculations
  };
}
