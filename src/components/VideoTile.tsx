import { Img } from 'remotion';
import { COLORS, Participant } from '../theme';

interface VideoTileProps {
  participant: Participant;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  opacity: number;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  x,
  y,
  w,
  h,
  scale,
  opacity,
}) => {
  const avatarSize = Math.min(w, h) * 0.38;
  const fontSize = avatarSize * 0.36;
  const nameFontSize = Math.max(10, Math.min(w * 0.05, 13));

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        overflow: 'hidden',
        borderRadius: 6,
        background: COLORS.meetTile,
      }}
    >
      {/* Avatar centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {participant.avatarUrl ? (
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid rgba(255,255,255,0.2)',
              flexShrink: 0,
            }}
          >
            <Img
              src={participant.avatarUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              backgroundColor: participant.color,
              border: '2.5px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize,
              fontWeight: 700,
              color: 'white',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.5px',
              flexShrink: 0,
            }}
          >
            {participant.initials}
          </div>
        )}
      </div>

      {/* Name label */}
      <div
        style={{
          position: 'absolute',
          bottom: 7,
          left: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: nameFontSize,
          fontWeight: 500,
          padding: '2px 7px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100% - 32px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {participant.name}
      </div>

      {/* Mic active indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: COLORS.meetActive,
        }}
      />
    </div>
  );
};
