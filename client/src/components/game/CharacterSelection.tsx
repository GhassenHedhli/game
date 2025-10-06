import { useState } from 'react';
import { useGameStore } from '../../lib/stores/useGameStore';
import { CHARACTERS, ARENAS } from '../../lib/gameData';

const CharacterSelection = () => {
  const { 
    playerData, 
    selectedCharacter, 
    selectCharacter, 
    setGameState, 
    setCurrentArena,
    spendStardust,
    unlockCharacter
  } = useGameStore();
  
  const [selectedArena, setSelectedArena] = useState(1);

  const availableCharacters = Object.values(CHARACTERS);
  const availableArenas = Object.values(ARENAS).filter(arena => 
    playerData.unlockedArenas.includes(arena.id)
  );

  const startBattle = () => {
    setCurrentArena(selectedArena);
    setGameState('playing');
  };

  const handleUnlockCharacter = (characterId: string) => {
    const character = CHARACTERS[characterId];
    if (character.unlockCost.currency === 'stardust') {
      if (spendStardust(character.unlockCost.amount)) {
        unlockCharacter(characterId);
      }
    }
  };

  const selectedCharacterData = CHARACTERS[selectedCharacter];
  const selectedArenaData = ARENAS[selectedArena];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Gladiator</h1>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="text-cyan-400">
            Stardust: {playerData.stardust}
          </div>
          <div className="text-purple-400">
            Gems: {playerData.gems}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Character Selection */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Characters</h2>
          <div className="grid grid-cols-2 gap-3">
            {availableCharacters.map((character) => {
              const isUnlocked = playerData.unlockedCharacters.includes(character.id);
              const isSelected = selectedCharacter === character.id;
              const canAfford = character.unlockCost.currency === 'stardust' ? 
                playerData.stardust >= character.unlockCost.amount : 
                playerData.gems >= character.unlockCost.amount;

              return (
                <div
                  key={character.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : isUnlocked
                      ? 'border-white/20 bg-black/20 hover:border-white/40'
                      : 'border-red-400/20 bg-red-900/10'
                  }`}
                  onClick={() => isUnlocked && selectCharacter(character.id)}
                >
                  {/* Character preview box */}
                  <div 
                    className="w-full h-16 rounded mb-2 border-2"
                    style={{ 
                      backgroundColor: isUnlocked ? character.color + '40' : '#333',
                      borderColor: character.color 
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded mx-auto mt-4"
                      style={{ backgroundColor: isUnlocked ? character.color : '#666' }}
                    />
                  </div>

                  <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {character.name}
                  </h3>
                  <p className="text-xs text-white/60 mb-2">{character.description}</p>

                  {/* Stats */}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/60">Weight:</span>
                      <span className="text-white">{character.stats.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Power:</span>
                      <span className="text-white">{character.stats.power}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Agility:</span>
                      <span className="text-white">{character.stats.agility}</span>
                    </div>
                  </div>

                  {/* Unlock button */}
                  {!isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockCharacter(character.id);
                      }}
                      disabled={!canAfford}
                      className={`w-full mt-2 py-1 px-2 text-xs rounded ${
                        canAfford
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {character.unlockCost.amount} {character.unlockCost.currency}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arena Selection */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Arena</h2>
          <div className="space-y-3">
            {availableArenas.map((arena) => {
              const isSelected = selectedArena === arena.id;

              return (
                <div
                  key={arena.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/20 bg-black/20 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedArena(arena.id)}
                >
                  {/* Arena preview */}
                  <div 
                    className="w-full h-20 rounded mb-2 border"
                    style={{ backgroundColor: arena.backgroundColor }}
                  >
                    {arena.hazards.map((hazard, idx) => (
                      <div
                        key={hazard}
                        className="inline-block w-3 h-3 rounded-full m-2"
                        style={{ backgroundColor: arena.hazardColors[hazard] || '#fff' }}
                      />
                    ))}
                  </div>

                  <h3 className="text-white font-bold">{arena.name}</h3>
                  <p className="text-white/60 text-sm">{arena.description}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      arena.difficulty === 'tutorial' ? 'bg-green-600' :
                      arena.difficulty === 'easy' ? 'bg-blue-600' :
                      arena.difficulty === 'medium' ? 'bg-yellow-600' :
                      arena.difficulty === 'hard' ? 'bg-orange-600' : 'bg-red-600'
                    }`}>
                      {arena.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-6 bg-black/30 flex justify-between items-center">
        <button
          onClick={() => setGameState('menu')}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Back
        </button>

        {selectedCharacterData && selectedArenaData && (
          <div className="text-center">
            <div className="text-white/60 text-sm">
              {selectedCharacterData.name} vs Arena {selectedArena}
            </div>
            <div className="text-xs text-white/40">
              {selectedArenaData.name} • {selectedArenaData.difficulty}
            </div>
          </div>
        )}

        <button
          onClick={startBattle}
          disabled={!playerData.unlockedCharacters.includes(selectedCharacter)}
          className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ENTER ARENA
        </button>
      </div>
    </div>
  );
};

export default CharacterSelection;
