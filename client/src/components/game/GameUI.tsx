import { useGameStore } from '../../lib/stores/useGameStore';
import { CHARACTERS, ARENAS } from '../../lib/gameData';
import { useGamePix } from '../../lib/hooks/useGamePix';
import { useState, useEffect } from 'react';

const GameUI = () => {
  const { 
    selectedCharacter, 
    currentArena, 
    playerHealth, 
    enemyHealth, 
    playerCharge, 
    matchTimer,
    setGameState,
    isMatchActive,
    gameMode,
    currentWave,
    lastMatchResult,
    addStardust,
    playerData,
    isPausedOutOfBounds,
    outOfBoundsCharacter
  } = useGameStore();
  
  const { 
    trackEvent, 
    showInterstitialAd, 
    showRewardAd, 
    triggerHappyMoment 
  } = useGamePix();
  
  const [showRewardOption, setShowRewardOption] = useState(false);
  const [adShown, setAdShown] = useState(false);

  const character = CHARACTERS[selectedCharacter];
  const arena = ARENAS[currentArena];

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isMatchActive && lastMatchResult && !adShown) {
      const result = lastMatchResult;
      
      if (result.victory) {
        triggerHappyMoment();
        trackEvent('level_complete', {
          score: result.wave || currentArena,
          level: currentArena,
          achievements: {}
        });
      } else {
        trackEvent('game_over', {
          score: result.wave || 0,
          level: currentArena,
          achievements: {}
        });
      }
      
      showInterstitialAd(() => {
        setShowRewardOption(true);
      });
      
      setAdShown(true);
    }
    
    if (isMatchActive && adShown) {
      setAdShown(false);
      setShowRewardOption(false);
    }
  }, [isMatchActive, lastMatchResult, adShown, trackEvent, triggerHappyMoment, showInterstitialAd, currentArena, gameMode]);

  const handleWatchRewardAd = () => {
    showRewardAd(
      () => {
        const bonusStardust = 50;
        addStardust(bonusStardust);
        setShowRewardOption(false);
      },
      () => {
        console.log('Reward ad completed');
      }
    );
  };

  // Out of Bounds Pause Screen
  if (isPausedOutOfBounds && isMatchActive) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-orange-900 to-red-900 p-12 rounded-2xl text-center space-y-6 max-w-lg border-4 border-orange-500/50 shadow-2xl animate-pulse">
          {/* Warning Icon */}
          <div className="text-8xl animate-bounce">⚠️</div>
          
          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-5xl font-bold text-orange-300">Out of Bounds!</h2>
            <p className="text-orange-100 text-xl">
              {outOfBoundsCharacter === 'player' ? 'You' : 'Your opponent'} drifted too far from the arena!
            </p>
          </div>

          {/* Status Message */}
          <div className="bg-black/40 rounded-lg p-6 space-y-3">
            <div className="text-white text-lg font-semibold">
              🔄 Returning to Arena...
            </div>
            <div className="text-orange-200 text-sm">
              Repositioning {outOfBoundsCharacter === 'player' ? 'your gladiator' : 'the enemy'} to safe zone
            </div>
            
            {/* Loading Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full animate-[loading_2s_ease-in-out]"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/40">
            <div className="text-yellow-300 text-sm">
              💡 <strong>Tip:</strong> Stay within the glowing arena boundary to avoid being reset!
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isMatchActive) {
    const result = lastMatchResult;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-2xl text-center space-y-6 max-w-md border-2 border-gray-700 shadow-2xl">
          {/* Victory/Defeat Header */}
          {result?.victory ? (
            <div className="space-y-2">
              <div className="text-6xl">🏆</div>
              <h2 className="text-4xl font-bold text-yellow-400">Victory!</h2>
              <p className="text-cyan-400 text-lg">Gladiator Triumphant</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-6xl">💀</div>
              <h2 className="text-4xl font-bold text-red-400">Defeated</h2>
              <p className="text-gray-400 text-lg">The Arena Claimed You</p>
            </div>
          )}

          {/* Match Stats */}
          <div className="bg-black/40 rounded-lg p-4 space-y-3">
            {gameMode === 'endless' && result && (
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="text-white/60">Wave Reached:</span>
                <span className="text-cyan-400 font-bold text-xl">Wave {result.wave}</span>
              </div>
            )}
            {gameMode !== 'endless' && (
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="text-white/60">Time:</span>
                <span className="text-white font-mono font-bold">{formatTime(matchTimer)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-white/60">Stardust Earned:</span>
              <span className="text-yellow-400 font-bold text-xl">+{result?.rewards || 0} ✨</span>
            </div>
          </div>

          {/* Reward Ad Option */}
          {showRewardOption && (
            <div className="bg-purple-900/40 rounded-lg p-4 space-y-2 border border-purple-500/50">
              <div className="text-purple-300 font-bold">Bonus Stardust!</div>
              <p className="text-white/70 text-sm">Watch a short video to earn +50 Stardust</p>
              <button
                onClick={handleWatchRewardAd}
                className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
              >
                Watch & Earn ✨
              </button>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={() => setGameState('menu')}
            className="w-full px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg"
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

        {/* Match Timer & Wave Counter */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
          {gameMode === 'endless' && (
            <>
              <div className="text-cyan-400 text-2xl font-bold mb-1">
                Wave {currentWave}
              </div>
              <div className="text-white/40 text-xs">Endless Mode</div>
            </>
          )}
          {gameMode !== 'endless' && (
            <>
              <div className="text-white/60 text-sm">Match Time</div>
              <div className="text-white text-xl font-mono font-bold">
                {formatTime(matchTimer)}
              </div>
            </>
          )}
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
