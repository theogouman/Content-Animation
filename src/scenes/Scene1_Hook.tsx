import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT } from '../theme';

export const Scene1_Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, from: 80, to: 0, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const subtitleY = spring({ frame: Math.max(0, frame - 20), fps, from: 60, to: 0, config: { damping: 12 } });
  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontFamily: FONT.main,
          fontSize: 96,
          fontWeight: 900,
          color: COLORS.text,
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        Titre de la vidéo
      </div>
      <div
        style={{
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
          fontFamily: FONT.main,
          fontSize: 48,
          fontWeight: 400,
          color: COLORS.textMuted,
          textAlign: 'center',
        }}
      >
        Sous-titre accrocheur
      </div>
    </AbsoluteFill>
  );
};
