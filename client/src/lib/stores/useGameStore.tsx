import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type GameState = "menu" | "characterSelection" | "playing" | "paused" | "gameOver";
export type GameMode = "arcade" | "endless" | "dailyChallenge";

export interface PlayerData {
  stardust: number;
  gems: number;
  unlockedCharacters: string[];
  unlockedArenas: number[];
  statistics: {
    matchesPlayed: number;
    matchesWon: number;
    totalKnockouts: number;
    highestWave: number;
  };
}

export interface GameStore {
  // Game state
  gameState: GameState;
  gameMode: GameMode;
  currentArena: number;
  currentWave: number;
  matchTimer: number;
  isMatchActive: boolean;
  lastMatchResult: {
    victory: boolean;
    rewards: number;
    wave: number;
  } | null;

  // Player data
  playerData: PlayerData;
  selectedCharacter: string;
  playerStats: any;

  // Combat state
  playerHealth: number;
  enemyHealth: number;
  playerCharge: number;
  
  // Actions
  setGameState: (state: GameState) => void;
  setGameMode: (mode: GameMode) => void;
  setCurrentArena: (arena: number) => void;
  selectCharacter: (characterId: string) => void;
  
  // Player data actions
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  unlockCharacter: (characterId: string) => void;
  unlockArena: (arenaId: number) => void;
  
  // Combat actions
  setPlayerHealth: (health: number) => void;
  setEnemyHealth: (health: number) => void;
  setPlayerCharge: (charge: number) => void;
  
  // Match actions
  startMatch: () => void;
  endMatch: (victory: boolean) => void;
  updateMatchTimer: (delta: number) => void;
  nextWave: () => void;
  respawnEnemy: () => void;
  
  // Save/Load
  saveData: () => void;
  loadData: () => void;
}

const defaultPlayerData: PlayerData = {
  stardust: 100,
  gems: 0,
  unlockedCharacters: ["swift", "brute", "balanced"],
  unlockedArenas: [1, 2],
  statistics: {
    matchesPlayed: 0,
    matchesWon: 0,
    totalKnockouts: 0,
    highestWave: 0,
  }
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: "menu",
    gameMode: "arcade",
    currentArena: 1,
    currentWave: 1,
    matchTimer: 0,
    isMatchActive: false,
    lastMatchResult: null,
    
    playerData: defaultPlayerData,
    selectedCharacter: "balanced",
    playerStats: null,
    
    playerHealth: 100,
    enemyHealth: 100,
    playerCharge: 0,
    
    // State setters
    setGameState: (state) => set({ gameState: state }),
    setGameMode: (mode) => set({ gameMode: mode }),
    setCurrentArena: (arena) => set({ currentArena: arena }),
    selectCharacter: (characterId) => set({ selectedCharacter: characterId }),
    
    // Player data actions
    addStardust: (amount) => set((state) => ({
      playerData: {
        ...state.playerData,
        stardust: state.playerData.stardust + amount
      }
    })),
    
    spendStardust: (amount) => {
      const { playerData } = get();
      if (playerData.stardust >= amount) {
        set((state) => ({
          playerData: {
            ...state.playerData,
            stardust: state.playerData.stardust - amount
          }
        }));
        return true;
      }
      return false;
    },
    
    unlockCharacter: (characterId) => set((state) => ({
      playerData: {
        ...state.playerData,
        unlockedCharacters: [...state.playerData.unlockedCharacters, characterId]
      }
    })),
    
    unlockArena: (arenaId) => set((state) => ({
      playerData: {
        ...state.playerData,
        unlockedArenas: [...state.playerData.unlockedArenas, arenaId]
      }
    })),
    
    // Combat actions
    setPlayerHealth: (health) => set({ playerHealth: Math.max(0, Math.min(100, health)) }),
    setEnemyHealth: (health) => set({ enemyHealth: Math.max(0, Math.min(100, health)) }),
    setPlayerCharge: (charge) => set({ playerCharge: Math.max(0, Math.min(100, charge)) }),
    
    // Match actions
    startMatch: () => set({ 
      isMatchActive: true, 
      matchTimer: 0, 
      currentWave: 1,
      playerHealth: 100, 
      enemyHealth: 100, 
      playerCharge: 0 
    }),
    
    endMatch: (victory) => {
      const state = get();
      const rewards = victory ? 25 + (state.currentWave * 5) : 10;
      
      set((prevState) => ({
        isMatchActive: false,
        lastMatchResult: {
          victory,
          rewards,
          wave: prevState.currentWave
        },
        playerData: {
          ...prevState.playerData,
          stardust: prevState.playerData.stardust + rewards,
          statistics: {
            ...prevState.playerData.statistics,
            matchesPlayed: prevState.playerData.statistics.matchesPlayed + 1,
            matchesWon: victory ? prevState.playerData.statistics.matchesWon + 1 : prevState.playerData.statistics.matchesWon,
            totalKnockouts: victory ? prevState.playerData.statistics.totalKnockouts + 1 : prevState.playerData.statistics.totalKnockouts,
            highestWave: Math.max(prevState.playerData.statistics.highestWave, prevState.currentWave)
          }
        }
      }));
      
      get().saveData();
    },
    
    updateMatchTimer: (delta) => set((state) => ({
      matchTimer: state.matchTimer + delta
    })),
    
    nextWave: () => {
      const state = get();
      console.log(`Advancing to wave ${state.currentWave + 1}`);
      set({ 
        currentWave: state.currentWave + 1,
        enemyHealth: 100,
        playerCharge: 0
      });
    },
    
    respawnEnemy: () => {
      console.log('Respawning enemy for next wave');
      set({ 
        enemyHealth: 100 
      });
    },
    
    // Save/Load
    saveData: () => {
      const { playerData } = get();
      setLocalStorage("gravityGladiatorSave", playerData);
    },
    
    loadData: () => {
      const savedData = getLocalStorage("gravityGladiatorSave");
      if (savedData) {
        set({ playerData: { ...defaultPlayerData, ...savedData } });
      }
    }
  }))
);
