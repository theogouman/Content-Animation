import { Composition } from 'remotion';
import { CompetitorVideo, COMPETITOR_TOTAL_FRAMES } from './CompetitorVideo';
import { LogoVideo, LOGO_TOTAL_FRAMES } from './LogoVideo';
import { MainVideo, totalFrames } from './MainVideo';
import { MaskRevealVideo, MASK_REVEAL_TOTAL_FRAMES } from './MaskRevealVideo';
import { NotionArrowVideo, NOTION_ARROW_TOTAL_FRAMES } from './NotionArrowVideo';
import { NotionFlowVideo, NOTION_FLOW_TOTAL_FRAMES } from './NotionFlowVideo';
import { PainPointVideo, PAIN_POINT_TOTAL_FRAMES } from './PainPointVideo';
import { VIDEO, VIDEO_YOUTUBE } from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MeetAnimation"
        component={MainVideo}
        durationInFrames={totalFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="LogoAnimation"
        component={LogoVideo}
        durationInFrames={LOGO_TOTAL_FRAMES}
        fps={VIDEO_YOUTUBE.fps}
        width={VIDEO_YOUTUBE.width}
        height={VIDEO_YOUTUBE.height}
      />
      <Composition
        id="CompetitorAnimation"
        component={CompetitorVideo}
        durationInFrames={COMPETITOR_TOTAL_FRAMES}
        fps={VIDEO_YOUTUBE.fps}
        width={VIDEO_YOUTUBE.width}
        height={VIDEO_YOUTUBE.height}
      />
      <Composition
        id="NotionFlowAnimation"
        component={NotionFlowVideo}
        durationInFrames={NOTION_FLOW_TOTAL_FRAMES}
        fps={VIDEO_YOUTUBE.fps}
        width={VIDEO_YOUTUBE.width}
        height={VIDEO_YOUTUBE.height}
      />
      <Composition
        id="PainPointAnimation"
        component={PainPointVideo}
        durationInFrames={PAIN_POINT_TOTAL_FRAMES}
        fps={VIDEO_YOUTUBE.fps}
        width={VIDEO_YOUTUBE.width}
        height={VIDEO_YOUTUBE.height}
      />
      <Composition
        id="MaskRevealAnimation"
        component={MaskRevealVideo}
        durationInFrames={MASK_REVEAL_TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="NotionArrowAnimation"
        component={NotionArrowVideo}
        durationInFrames={NOTION_ARROW_TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
