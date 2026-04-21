import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1800], [0, 360], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(
          ellipse at ${50 + Math.sin(drift * 0.01) * 15}% ${50 + Math.cos(drift * 0.01) * 15}%,
          ${COLORS.bgGradient2} 0%,
          ${COLORS.bg} 70%
        )`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {[...Array(8)].map((_, i) => {
        const x = 100 + (i * 137) % 880;
        const baseY = 200 + (i * 223) % 1520;
        const y = baseY + Math.sin(frame * 0.02 + i) * 30;
        const opacity = interpolate(Math.sin(frame * 0.015 + i * 1.5), [-1, 1], [0.05, 0.15]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? COLORS.accent : COLORS.primary,
              opacity,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
