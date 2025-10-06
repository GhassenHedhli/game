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
                position: [0, 5, 20],
                fov: 75,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: false
              }}
            >
              <color attach="background" args={["#000000"]} />
              <fog attach="fog" args={["#000428", 30, 80]} />
              
              {/* Enhanced lighting for dramatic space arena */}
              <ambientLight intensity={0.2} />
              
              {/* Main dramatic key light */}
              <directionalLight 
                position={[15, 20, 10]} 
                intensity={1.2} 
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
              />
              
              {/* Colored accent lights for atmosphere */}
              <pointLight position={[-10, 8, 0]} intensity={0.8} color="#00d4ff" distance={30} />
              <pointLight position={[10, -8, 0]} intensity={0.8} color="#ff00ff" distance={30} />
              <pointLight position={[0, 0, 15]} intensity={0.6} color="#00ff88" distance={25} />
              
              {/* Center arena glow */}
              <pointLight position={[0, 0, 0]} intensity={0.4} color="#00ffff" distance={20} />

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
