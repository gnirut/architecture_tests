import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { WindowScene } from './components/WindowScene';
import { Controls } from './components/Controls';
import { Loader } from '@react-three/drei';

const App: React.FC = () => {
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [uiProgress, setUiProgress] = useState(0); // 0-100 for UI Slider
  const [speed, setSpeed] = useState(0.8);
  
  // Animation State (Refs for performance)
  const progressRef = useRef(0); // 0.0 - 1.0 internal precision
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Sync UI progress when manually seeking
  const handleSeek = (val: number) => {
    setIsPlaying(false);
    setUiProgress(val);
    progressRef.current = val / 100;
  };

  const handleReset = () => {
    setIsPlaying(false);
    setUiProgress(0);
    progressRef.current = 0;
  };

  // Animation Loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      // Update progress
      // Full animation takes roughly 2-3 seconds at 1x speed
      const increment = (deltaTime * speed) / 3; 
      
      if (progressRef.current < 1) {
        progressRef.current = Math.min(progressRef.current + increment, 1);
        // Only update UI state occasionally to prevent React thrashing, 
        // or just let it snap when paused. 
        // For smoother UI slider during playback, we can update it, 
        // but let's sync it every frame for now, React 18 handle it reasonably well.
        setUiProgress(progressRef.current * 100);
      } else {
        // Animation complete
        setIsPlaying(false);
        progressRef.current = 1;
        setUiProgress(100);
        return; // Stop loop
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (isPlaying) {
      // Reset last time to avoid large delta jumps
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  // Handle case where user drags slider to end then hits play -> should restart or nothing?
  // Let's auto-rewind if at end and play is clicked
  const handlePlayPause = () => {
    if (!isPlaying && progressRef.current >= 1) {
      progressRef.current = 0;
      setUiProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900">
      
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-10 text-white">
        <h1 className="text-2xl font-bold tracking-tight">Window Detail</h1>
        <p className="text-slate-400 text-sm mt-1">Assembly Animation • Isometric View</p>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <WindowScene progressRef={progressRef} />
      </Canvas>
      <Loader />

      <Controls 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        progress={uiProgress}
        onSeek={handleSeek}
        speed={speed}
        onSpeedChange={setSpeed}
        onReset={handleReset}
      />
    </div>
  );
};

export default App;
