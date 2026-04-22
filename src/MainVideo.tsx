import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { MeetScene } from './scenes/MeetScene';
import { TIMELINE } from './theme';

export const totalFrames = TIMELINE.end;

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <MeetScene />
  </AbsoluteFill>
);
