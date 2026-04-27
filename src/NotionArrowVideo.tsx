import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { NotionArrowScene } from './scenes/NotionArrowScene';

export { NOTION_ARROW_TOTAL_FRAMES } from './scenes/NotionArrowScene';

export const NotionArrowVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <NotionArrowScene />
  </AbsoluteFill>
);
