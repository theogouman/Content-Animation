import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { LogoTrashScene } from './scenes/LogoTrashScene';

export const LOGO_TOTAL_FRAMES = 345;

export const LogoVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <LogoTrashScene />
  </AbsoluteFill>
);
