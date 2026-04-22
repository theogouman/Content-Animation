import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoTile } from '../components/VideoTile';
import { COLORS, PARTICIPANTS, TIMELINE, WIN } from '../theme';

// ─── Layout calculator (ported from HTML reference) ───────────────────────────

type TileRect = { x: number; y: number; w: number; h: number };

const getLayout = (n: number): TileRect[] => {
  const aw = WIN.W - WIN.PAD * 2;
  const ah = WIN.VID_H - WIN.PAD * 2;

  if (n <= 0) return [];

  if (n === 1) {
    return [{ x: WIN.PAD, y: WIN.PAD, w: aw, h: ah }];
  }

  if (n === 2) {
    const w = (aw - WIN.GAP) / 2;
    return [
      { x: WIN.PAD, y: WIN.PAD, w, h: ah },
      { x: WIN.PAD + w + WIN.GAP, y: WIN.PAD, w, h: ah },
    ];
  }

  if (n === 3) {
    const w = (aw - WIN.GAP * 2) / 3;
    return [
      { x: WIN.PAD, y: WIN.PAD, w, h: ah },
      { x: WIN.PAD + w + WIN.GAP, y: WIN.PAD, w, h: ah },
      { x: WIN.PAD + (w + WIN.GAP) * 2, y: WIN.PAD, w, h: ah },
    ];
  }

  if (n === 4) {
    const w = (aw - WIN.GAP) / 2;
    const h = (ah - WIN.GAP) / 2;
    return [
      { x: WIN.PAD, y: WIN.PAD, w, h },
      { x: WIN.PAD + w + WIN.GAP, y: WIN.PAD, w, h },
      { x: WIN.PAD, y: WIN.PAD + h + WIN.GAP, w, h },
      { x: WIN.PAD + w + WIN.GAP, y: WIN.PAD + h + WIN.GAP, w, h },
    ];
  }

  // n === 5: 2 top + 3 bottom
  const w2 = (aw - WIN.GAP) / 2;
  const w3 = (aw - WIN.GAP * 2) / 3;
  const h = (ah - WIN.GAP) / 2;
  return [
    { x: WIN.PAD, y: WIN.PAD, w: w2, h },
    { x: WIN.PAD + w2 + WIN.GAP, y: WIN.PAD, w: w2, h },
    { x: WIN.PAD, y: WIN.PAD + h + WIN.GAP, w: w3, h },
    { x: WIN.PAD + w3 + WIN.GAP, y: WIN.PAD + h + WIN.GAP, w: w3, h },
    { x: WIN.PAD + (w3 + WIN.GAP) * 2, y: WIN.PAD + h + WIN.GAP, w: w3, h },
  ];
};

const getPhaseStart = (count: number): number => {
  if (count >= 5) return TIMELINE.phase5;
  if (count === 4) return TIMELINE.phase4;
  if (count === 3) return TIMELINE.phase3;
  if (count === 2) return TIMELINE.phase2;
  return TIMELINE.phase1;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const ChromeBar: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: WIN.CHROME_H,
      background: '#EBEBEB',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: 6,
      borderBottom: '1px solid #D0D0D0',
      flexShrink: 0,
    }}
  >
    {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map((color, i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
    ))}
    <div
      style={{
        flex: 1,
        height: 18,
        background: '#fff',
        borderRadius: 9,
        border: '1px solid #CCC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9.5,
        color: '#555',
        margin: '0 8px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      meet.google.com/abc-defg-hij
    </div>
  </div>
);

const MeetHeader: React.FC<{ timerText: string; count: number }> = ({ timerText, count }) => (
  <div
    style={{
      width: '100%',
      height: WIN.HEADER_H,
      background: COLORS.meetBg,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 8,
      flexShrink: 0,
    }}
  >
    {/* Google Meet wordmark */}
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 700 }}>
        <span style={{ color: '#4285F4' }}>G</span>
        <span style={{ color: '#EA4335' }}>o</span>
        <span style={{ color: '#FBBC04' }}>o</span>
        <span style={{ color: '#4285F4' }}>g</span>
        <span style={{ color: '#34A853' }}>l</span>
        <span style={{ color: '#EA4335' }}>e</span>
      </span>
      <span
        style={{
          color: COLORS.meetText,
          fontSize: 12,
          fontWeight: 600,
          marginLeft: 5,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        Meet
      </span>
    </div>

    <div style={{ flex: 1 }} />

    {/* Timer */}
    <div
      style={{
        color: COLORS.meetTextMuted,
        fontSize: 11,
        marginRight: 8,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {timerText}
    </div>

    {/* Participants count badge */}
    <div
      style={{
        background: '#3c4043',
        color: COLORS.meetText,
        borderRadius: 10,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Simplified people icon: two overlapping circles */}
      <div style={{ position: 'relative', width: 12, height: 9 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: COLORS.meetTextMuted,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 4,
            top: 0,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: COLORS.meetTextMuted,
            opacity: 0.7,
          }}
        />
      </div>
      <span>{count}</span>
    </div>
  </div>
);

const ControlsBar: React.FC = () => {
  const buttons = [
    { bg: COLORS.meetCtrl, size: 36 },
    { bg: COLORS.meetCtrl, size: 36 },
    { bg: COLORS.meetEndCall, size: 42, isEndCall: true },
    { bg: COLORS.meetCtrl, size: 36 },
    { bg: COLORS.meetCtrl, size: 36 },
  ] as const;

  return (
    <div
      style={{
        width: '100%',
        height: WIN.CTRL_H,
        background: COLORS.meetBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexShrink: 0,
      }}
    >
      {buttons.map((btn, i) => (
        <div
          key={i}
          style={{
            width: btn.size,
            height: btn.size,
            borderRadius: '50%',
            background: btn.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {'isEndCall' in btn && btn.isEndCall && (
            <div
              style={{
                width: 18,
                height: 3,
                background: 'white',
                borderRadius: 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main scene ──────────────────────────────────────────────────────────────

const TOAST_LABELS: Record<number, string> = {
  2: "Sophie B. a rejoint l'appel",
  3: "Marc L. a rejoint l'appel",
  4: "Claire D. a rejoint l'appel",
  5: "Lucas R. a rejoint l'appel",
};

export const MeetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Window appearance ──────────────────────────────────────────────
  const windowFrame = Math.max(0, frame - TIMELINE.windowStart);
  const windowScale = spring({
    frame: windowFrame,
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 10 },
  });
  const windowOpacity = interpolate(windowFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // ── Current phase ──────────────────────────────────────────────────
  const currentCount =
    frame >= TIMELINE.phase5 ? 5
    : frame >= TIMELINE.phase4 ? 4
    : frame >= TIMELINE.phase3 ? 3
    : frame >= TIMELINE.phase2 ? 2
    : frame >= TIMELINE.phase1 ? 1
    : 0;

  const prevCount = Math.max(0, currentCount - 1);
  const phaseStart = getPhaseStart(currentCount);
  const springFrame = Math.max(0, frame - phaseStart);

  const currLayouts = getLayout(currentCount);
  // When in phase1, prevLayouts = currLayouts so tiles start at their final position
  const prevLayouts = prevCount > 0 ? getLayout(prevCount) : currLayouts;

  // ── Animated tile positions ────────────────────────────────────────
  const animatedTiles = PARTICIPANTS.slice(0, currentCount).map((p, i) => {
    const curr = currLayouts[i];
    const prev = i < prevLayouts.length ? prevLayouts[i] : curr;
    const isNew = i >= prevCount;

    // Smooth repositioning — no bounce
    const posConfig = { damping: 200 };
    const x = spring({ frame: springFrame, fps, from: prev.x, to: curr.x, config: posConfig });
    const y = spring({ frame: springFrame, fps, from: prev.y, to: curr.y, config: posConfig });
    const w = spring({ frame: springFrame, fps, from: prev.w, to: curr.w, config: posConfig });
    const h = spring({ frame: springFrame, fps, from: prev.h, to: curr.h, config: posConfig });

    // New tile pops in with a spring
    const scale = isNew
      ? spring({ frame: springFrame, fps, from: 0.5, to: 1, config: { damping: 10 } })
      : 1;
    const opacity = isNew
      ? interpolate(springFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
      : 1;

    return { participant: p, x, y, w, h, scale, opacity };
  });

  // ── Timer (starts when Théo joins) ────────────────────────────────
  const elapsedFrames = Math.max(0, frame - TIMELINE.phase1);
  const elapsedSec = Math.floor(elapsedFrames / fps);
  const timerText = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')}`;

  // ── Toast notification ────────────────────────────────────────────
  const toastLabel = TOAST_LABELS[currentCount];
  const toastOpacity =
    currentCount > 1
      ? interpolate(springFrame, [0, 8, 50, 65], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
      : 0;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: WIN.X,
          top: WIN.Y,
          width: WIN.W,
          height: WIN.H,
          opacity: windowOpacity,
          transform: `scale(${windowScale})`,
          transformOrigin: 'center',
          display: 'flex',
          flexDirection: 'column',
          border: `2px solid ${COLORS.signature}`,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.20), 0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <ChromeBar />
        <MeetHeader timerText={timerText} count={currentCount} />

        {/* Video grid */}
        <div
          style={{
            position: 'relative',
            width: WIN.W,
            height: WIN.VID_H,
            background: '#111',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {animatedTiles.map((tile) => (
            <VideoTile key={tile.participant.id} {...tile} />
          ))}

          {/* Toast */}
          {toastLabel && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(32,33,36,0.92)',
                color: COLORS.meetText,
                fontSize: 11,
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: 10,
                whiteSpace: 'nowrap',
                opacity: toastOpacity,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {toastLabel}
            </div>
          )}
        </div>

        <ControlsBar />
      </div>
    </AbsoluteFill>
  );
};
