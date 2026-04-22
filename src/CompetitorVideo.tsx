import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { CompetitorMapScene } from './scenes/CompetitorMapScene';

export const COMPETITOR_TOTAL_FRAMES = 180;

export const CompetitorVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <CompetitorMapScene />
  </AbsoluteFill>
);
