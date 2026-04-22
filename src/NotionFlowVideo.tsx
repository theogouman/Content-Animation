import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { NotionFlowScene } from './scenes/NotionFlowScene';

export const NOTION_FLOW_TOTAL_FRAMES = 228;

export const NotionFlowVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <NotionFlowScene />
  </AbsoluteFill>
);
