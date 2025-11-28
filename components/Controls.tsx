import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  progress: number;
  onSeek: (value: number) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  progress,
  onSeek,
  speed,
  onSpeedChange,
  onReset
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
      <div className="flex flex-col gap-4">
        
        {/* Progress Slider */}
        <div className="w-full flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-right">Explode</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:bg-slate-300"
          />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-12">Assemble</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onPlayPause}
              className={`
                flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-all transform hover:scale-105 active:scale-95
                ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}
              `}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            
            <button
              onClick={onReset}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Reset View"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-xs font-semibold text-slate-500">Speed</span>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
            <span className="text-xs font-mono text-slate-600 w-8 text-right">{speed.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
