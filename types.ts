import { MutableRefObject } from 'react';
import { Vector3, Euler, Color } from 'three';

export interface PartConfig {
  id: string;
  name: string;
  type: 'box' | 'plane' | 'custom';
  color: string | number;
  args: [number, number, number]; // width, height, depth
  assembledPos: [number, number, number];
  explodedPos: [number, number, number];
  rotation?: [number, number, number];
  delay: number; // 0 to 1, when this part starts moving
  duration: number; // 0 to 1, how long it takes
  opacity?: number;
  metalness?: number;
  roughness?: number;
}

export interface AnimationState {
  progress: number; // 0 to 1
  isPlaying: boolean;
  speed: number;
}
