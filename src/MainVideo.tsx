import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { Background } from './components/Background';
import { Scene1_Hook } from './scenes/Scene1_Hook';

const SCENES = [
  { component: Scene1_Hook, duration: 180 },
];

const Transition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {children}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  let currentFrame = 0;
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map(({ component: SceneComponent, duration }, i) => {
        const from = currentFrame;
        currentFrame += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <Transition durationInFrames={duration}>
              <SceneComponent />
            </Transition>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const totalFrames = SCENES.reduce((sum, s) => sum + s.duration, 0);
