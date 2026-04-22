import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { PainPointScene } from './scenes/PainPointScene';

export const PAIN_POINT_TOTAL_FRAMES = 185;

export const PainPointVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <PainPointScene />
  </AbsoluteFill>
);
