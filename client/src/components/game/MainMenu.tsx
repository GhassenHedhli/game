import { useGameStore } from "../../lib/stores/useGameStore";
import { useEffect, useState } from "react";
import Store from "../Store";

const MainMenu = () => {
  const { setGameState, setGameMode, playerData, loadData } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<'arcade' | 'endless' | 'dailyChallenge'>('arcade');
  const [showStore, setShowStore] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startGame = () => {
    setGameMode(selectedMode);
    setGameState('characterSelection');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-black flex items-center justify-center">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => {
          const randomLeft = Math.random() * 100;
          const randomTop = Math.random() * 100;
          const randomDelay = Math.random() * 3;
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
                animationDelay: `${randomDelay}s`
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-4">
        {/* Game Title */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            GRAVITY
          </h1>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GLADIATOR
          </h2>
          <p className="text-white/60 text-sm">Physics-based zero-gravity combat</p>
        </div>

        {/* Player Stats */}
        <div className="bg-black/30 rounded-lg p-4 border border-cyan-400/20">
          <div className="flex justify-between items-center text-white">
            <div className="text-center">
              <div className="text-cyan-400 font-bold">{playerData.stardust}</div>
              <div className="text-xs text-white/60">Stardust</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold">{playerData.gems}</div>
              <div className="text-xs text-white/60">Gems</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">{playerData.statistics.matchesWon}</div>
              <div className="text-xs text-white/60">Victories</div>
            </div>
          </div>
        </div>
        
        {/* Store Button */}
        <button
          onClick={() => setShowStore(true)}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
        >
          <span>💎</span>
          <span>GEM STORE</span>
        </button>

        {/* Game Mode Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            {[
              { id: 'arcade', name: 'Arcade Mode', desc: 'Fight through 8 opponents' },
              { id: 'endless', name: 'Endless Mode', desc: 'Survive as long as you can' },
              { id: 'dailyChallenge', name: 'Daily Challenge', desc: 'Special rules today' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as any)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                  selectedMode === mode.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                    : 'border-white/20 bg-black/20 text-white hover:border-white/40'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">{mode.name}</div>
                  <div className="text-sm text-white/60">{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:scale-105 transition-transform duration-200 shadow-lg shadow-cyan-500/25"
          >
            START BATTLE
          </button>
        </div>

        {/* Controls Info */}
        <div className="text-white/40 text-xs space-y-1">
          <div>Movement: W/A/S/D • Rotation: Q/E</div>
          <div>Attack: SPACE/J • Charged Slam: K</div>
        </div>
      </div>
      
      {/* Store Modal */}
      {showStore && <Store onClose={() => setShowStore(false)} />}
    </div>
  );
};

export default MainMenu;
