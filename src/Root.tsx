import { Composition } from 'remotion';
import { LogoVideo, LOGO_TOTAL_FRAMES } from './LogoVideo';
import { MainVideo, totalFrames } from './MainVideo';
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
    </>
  );
};
