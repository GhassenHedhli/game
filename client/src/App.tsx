import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";

import { useGameStore } from "./lib/stores/useGameStore";
import MainMenu from "./components/game/MainMenu";
import CharacterSelection from "./components/game/CharacterSelection";
import GameScene from "./components/game/GameScene";
import GameUI from "./components/game/GameUI";
import SoundManager from "./components/game/SoundManager";

// Define control keys for zero-gravity movement and combat
const controls = [
  { name: "thrustUp", keys: ["KeyW", "ArrowUp"] },
  { name: "thrustDown", keys: ["KeyS", "ArrowDown"] },
  { name: "thrustLeft", keys: ["KeyA", "ArrowLeft"] },
  { name: "thrustRight", keys: ["KeyD", "ArrowRight"] },
  { name: "rotateLeft", keys: ["KeyQ"] },
  { name: "rotateRight", keys: ["KeyE"] },
  { name: "punch", keys: ["KeyJ", "Space"] },
  { name: "chargedSlam", keys: ["KeyK"] },
  { name: "pause", keys: ["Escape"] },
];

function App() {
  const { gameState } = useGameStore();

  useEffect(() => {
    console.log("Game state changed to:", gameState);
  }, [gameState]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        {gameState === 'menu' && <MainMenu />}
        
        {gameState === 'characterSelection' && <CharacterSelection />}
        
        {gameState === 'playing' && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 5, 10],
                fov: 60,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
            >
              <color attach="background" args={["#000814"]} />
              
              {/* Ambient lighting for zero-g space environment */}
              <ambientLight intensity={0.3} />
              <directionalLight 
                position={[10, 10, 10]} 
                intensity={0.8} 
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <pointLight position={[0, 0, 0]} intensity={0.5} color="#00ffff" />

              <Suspense fallback={null}>
                <GameScene />
              </Suspense>
            </Canvas>
            <GameUI />
          </>
        )}
        
        <SoundManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
