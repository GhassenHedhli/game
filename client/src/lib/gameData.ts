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
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    rarity: 'rare',
    stats: { weight: 1, power: 2, agility: 9, health: 90 },
    unlockCost: { currency: 'stardust', amount: 450 },
    description: 'Ghostly speed makes this the lightest gladiator',
    color: '#00ffff'
  },
  juggernaut: {
    id: 'juggernaut',
    name: 'Juggernaut',
    rarity: 'epic',
    stats: { weight: 9, power: 8, agility: 2, health: 180 },
    unlockCost: { currency: 'stardust', amount: 750 },
    description: 'Unstoppable momentum with crushing attacks',
    color: '#ff6600'
  },
  viper: {
    id: 'viper',
    name: 'Viper',
    rarity: 'rare',
    stats: { weight: 4, power: 6, agility: 7, health: 110 },
    unlockCost: { currency: 'stardust', amount: 550 },
    description: 'Quick strikes with venomous precision',
    color: '#00ff00'
  },
  colossus: {
    id: 'colossus',
    name: 'Colossus',
    rarity: 'epic',
    stats: { weight: 9, power: 7, agility: 1, health: 190 },
    unlockCost: { currency: 'stardust', amount: 850 },
    description: 'Massive size provides incredible defense',
    color: '#888888'
  },
  wraith: {
    id: 'wraith',
    name: 'Wraith',
    rarity: 'rare',
    stats: { weight: 3, power: 5, agility: 8, health: 105 },
    unlockCost: { currency: 'stardust', amount: 600 },
    description: 'Ethereal fighter with balanced offense',
    color: '#cc00ff'
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    rarity: 'epic',
    stats: { weight: 6, power: 6, agility: 6, health: 160 },
    unlockCost: { currency: 'stardust', amount: 700 },
    description: 'Guardian-class with perfect equilibrium',
    color: '#0099ff'
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
  },
  5: {
    id: 5,
    name: 'Crusher Colosseum',
    difficulty: 'medium',
    hazards: ['crushers'],
    unlockCost: 500,
    description: 'Rhythmic crushers slam from multiple directions',
    backgroundColor: '#220022',
    hazardColors: { crushers: '#aa00aa' }
  },
  6: {
    id: 6,
    name: 'Vortex Void',
    difficulty: 'hard',
    hazards: ['vortex'],
    unlockCost: 600,
    description: 'Gravity vortex pulls fighters toward the center',
    backgroundColor: '#000033',
    hazardColors: { vortex: '#0066ff' }
  },
  7: {
    id: 7,
    name: 'Electro Arena',
    difficulty: 'hard',
    hazards: ['lightning'],
    unlockCost: 700,
    description: 'Random lightning strikes across the battlefield',
    backgroundColor: '#002200',
    hazardColors: { lightning: '#ffff00' }
  },
  8: {
    id: 8,
    name: 'Chaos Chamber',
    difficulty: 'expert',
    hazards: ['lasers', 'pistons', 'spikes', 'lightning'],
    unlockCost: 800,
    description: 'All hazards combined in ultimate chaos',
    backgroundColor: '#330000',
    hazardColors: { 
      lasers: '#ff0066', 
      pistons: '#666666', 
      spikes: '#ffaa00',
      lightning: '#ffff00'
    }
  }
};

// Force calculation as specified in the GDD
export function calculateForce(attackPower: number, chargeMultiplier: number, targetWeight: number): number {
  return (attackPower * chargeMultiplier) / (targetWeight * 0.1);
}

// Convert gladiator stats to movement parameters
export function getMovementStats(character: Character) {
  const { weight, agility } = character.stats;
  
  // Weight-compensated acceleration for balanced gameplay
  // Base acceleration + agility bonus, compensated by weight
  const baseAcceleration = 4.5;
  const agilityBonus = agility * 0.6;
  const weightPenalty = weight * 0.15;
  const acceleration = Math.max(2.0, baseAcceleration + agilityBonus - weightPenalty);
  
  // Max velocity inversely proportional to weight, higher base for faster gameplay
  const maxVelocity = Math.max(8, 15 - (weight * 0.4));
  
  // Rotation speed scales with agility, with higher base multiplier
  const rotationSpeed = agility * 0.15;
  
  return {
    maxVelocity,
    acceleration,
    rotationSpeed,
    mass: weight,
    // New: braking power for better control
    brakingPower: agility * 0.5,
    // New: dampening factor for smoother movement
    dampening: 0.015
  };
}
