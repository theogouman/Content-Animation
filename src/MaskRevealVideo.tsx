import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { MaskRevealScene } from './scenes/MaskRevealScene';

export { MASK_REVEAL_TOTAL_FRAMES } from './scenes/MaskRevealScene';

export const MaskRevealVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <MaskRevealScene />
  </AbsoluteFill>
);
