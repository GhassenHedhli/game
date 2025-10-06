import { useGameStore } from '../../lib/stores/useGameStore';
import { CHARACTERS, ARENAS } from '../../lib/gameData';

const GameUI = () => {
  const { 
    selectedCharacter, 
    currentArena, 
    playerHealth, 
    enemyHealth, 
    playerCharge, 
    matchTimer,
    setGameState,
    isMatchActive
  } = useGameStore();

  const character = CHARACTERS[selectedCharacter];
  const arena = ARENAS[currentArena];

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isMatchActive) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-lg text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-white">Match Over</h2>
          <div className="text-white/80">
            Final Time: {formatTime(matchTimer)}
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Player Status */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: character.color }}
            />
            <span className="text-white font-bold">{character.name}</span>
          </div>
          
          {/* Health Bar */}
          <div className="w-48 space-y-1">
            <div className="flex justify-between text-white text-sm">
              <span>Health</span>
              <span>{playerHealth}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${playerHealth}%` }}
              />
            </div>
          </div>

          {/* Charge Bar */}
          <div className="w-48 space-y-1">
            <div className="flex justify-between text-white text-sm">
              <span>Charge</span>
              <span>{Math.floor(playerCharge)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${playerCharge}%` }}
              />
            </div>
          </div>
        </div>

        {/* Match Timer */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-white/60 text-sm">Match Time</div>
          <div className="text-white text-xl font-mono font-bold">
            {formatTime(matchTimer)}
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-3 justify-end">
            <span className="text-white font-bold">Enemy</span>
            <div className="w-4 h-4 rounded bg-red-500" />
          </div>
          
          {/* Enemy Health Bar */}
          <div className="w-48 space-y-1">
            <div className="flex justify-between text-white text-sm">
              <span>Health</span>
              <span>{enemyHealth}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${enemyHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Arena Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-2 text-center">
          <div className="text-white font-bold">{arena.name}</div>
          <div className="text-white/60 text-sm capitalize">{arena.difficulty}</div>
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-1 text-white/60 text-xs">
          <div>Move: W/A/S/D</div>
          <div>Rotate: Q/E</div>
          <div>Attack: SPACE</div>
          <div>Charge: K (hold)</div>
          <div>Pause: ESC</div>
        </div>
      </div>

      {/* Warning for boundary */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-red-900/60 backdrop-blur-sm rounded-lg p-3 text-red-200 text-sm">
          <div className="font-bold">⚠ Warning Zone</div>
          <div className="text-xs">Stay within the arena!</div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
