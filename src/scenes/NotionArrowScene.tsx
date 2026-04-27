import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ─── World layout (world Y grows downward, camera pans via translateY) ─────────
const CX = 540; // canvas center X

// Notion box
const NOTION_BOX_SIZE   = 440;
const NOTION_BOX_CY     = 650;
const NOTION_BOX_TOP    = NOTION_BOX_CY - NOTION_BOX_SIZE / 2;    // 430
const NOTION_BOX_BOTTOM = NOTION_BOX_CY + NOTION_BOX_SIZE / 2;    // 870

// Arrow (attached directly to bottom edge of Notion box)
const ARROW_START  = NOTION_BOX_BOTTOM;          // 870
const ARROW_LENGTH = 220;
const ARROW_END    = ARROW_START + ARROW_LENGTH;  // 1090
const ARROW_STROKE = 5;
const ARROW_HEAD_W = 46;
const ARROW_HEAD_H = 30;

// Text box
const TEXT_FONT    = 62;
const TEXT_LH      = 1.28;
const TEXT_PAD_V   = 32;
const TEXT_PAD_H   = 44;
const TEXT_LINES   = ["Comment gagner", "de l'argent", "avec Notion ?"];
const TEXT_BOX_H   = Math.ceil(TEXT_LINES.length * TEXT_FONT * TEXT_LH + TEXT_PAD_V * 2); // ≈ 302
const TEXT_BOX_TOP = ARROW_END + 18;                   // 1108
const TEXT_BOX_CY  = TEXT_BOX_TOP + TEXT_BOX_H / 2;   // ≈ 1259

// Camera: translateY on world container
const CAM_0 = 960 - NOTION_BOX_CY;  // +310  (Notion box centered on screen)
const CAM_1 = 960 - TEXT_BOX_CY;    // ≈ -299 (text box centered on screen)

// Timeline (30 fps)
const T = {
  notionEnter:  30,   // 1 s empty screen then box pops in
  arrowStart:   90,   // 30 (empty) + ~15 (enter) + 45 (1.5 s hold) = 90
  arrowDur:     18,
  camStart:     90,
  camEnd:       132,
  textEnter:    110,  // appears as arrow finishes
  holdEnd:      215,
  exitStart:    215,
  exitEnd:      232,
} as const;

export const NOTION_ARROW_TOTAL_FRAMES = 236;

// ─── Notion N icon ─────────────────────────────────────────────────────────────
const NotionN: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    {/* Diagonal bar (rendered below verticals so joints are clean) */}
    <polygon points="26,26 70,26 174,174 130,174" fill="#000" />
    {/* Left vertical stroke */}
    <rect x="26"  y="26" width="44" height="148" fill="#000" />
    {/* Right vertical stroke */}
    <rect x="130" y="26" width="44" height="148" fill="#000" />
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const glow = (g: number) => [
  `0 0 0 3px rgba(224,98,90,${Math.min(1, 0.9  * g).toFixed(3)})`,
  `0 0 24px  6px rgba(224,98,90,${(0.40 * g).toFixed(3)})`,
  `0 0 70px 14px rgba(224,98,90,${(0.20 * g).toFixed(3)})`,
  `0 10px 44px rgba(0,0,0,0.12)`,
].join(', ');

const BOX_STYLE = {
  background:   '#ffffff',
  border:       '3px solid #e0625a',
  borderRadius: 20,
} as const;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const NotionArrowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Notion box entrance
  const notionPop = spring({
    frame: Math.max(0, frame - T.notionEnter),
    fps, from: 0, to: 1,
    config: { damping: 20, stiffness: 280 },
  });
  const notionOpacity = interpolate(frame, [T.notionEnter, T.notionEnter + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Pulsing glow on Notion box
  const elapsed    = Math.max(0, frame - T.notionEnter);
  const glowPulse  = 1 + Math.sin(elapsed * 0.04) * 0.28;
  const notionGlow = notionPop * glowPulse;

  // Arrow draw progress
  const arrowP    = interpolate(frame, [T.arrowStart, T.arrowStart + T.arrowDur], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const arrowBodyH = arrowP * (ARROW_LENGTH - ARROW_HEAD_H * 0.6);
  const arrowTipY  = ARROW_START + arrowP * ARROW_LENGTH;

  // Text box entrance
  const textPop = spring({
    frame: Math.max(0, frame - T.textEnter),
    fps, from: 0, to: 1,
    config: { damping: 22, stiffness: 300 },
  });
  const textOpacity = interpolate(frame, [T.textEnter, T.textEnter + 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Camera pan
  const cameraY = interpolate(frame, [T.camStart, T.camEnd], [CAM_0, CAM_1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Global fade-out
  const globalOpacity = interpolate(frame, [T.exitStart, T.exitEnd], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 1080, height: 0,
        transform: `translateY(${cameraY.toFixed(2)}px)`,
        opacity: globalOpacity,
      }}>

        {/* ── Notion box ── */}
        <div style={{
          position: 'absolute',
          left: CX - NOTION_BOX_SIZE / 2,
          top:  NOTION_BOX_TOP,
          width:  NOTION_BOX_SIZE,
          height: NOTION_BOX_SIZE,
          ...BOX_STYLE,
          boxShadow: glow(notionGlow),
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14,
          transform: `scale(${notionPop.toFixed(4)})`,
          transformOrigin: 'center',
          opacity: notionOpacity,
        }}>
          <NotionN size={190} />
          <span style={{
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            fontSize: 46,
            fontWeight: 700,
            color: '#000',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            Notion
          </span>
        </div>

        {/* ── Arrow body ── */}
        {frame >= T.arrowStart && arrowBodyH > 0 && (
          <div style={{
            position: 'absolute',
            left: CX - ARROW_STROKE / 2,
            top:  ARROW_START,
            width:  ARROW_STROKE,
            height: Math.max(0, arrowBodyH),
            background: '#e0625a',
            borderRadius: ARROW_STROKE / 2,
          }} />
        )}

        {/* ── Arrowhead (follows tip) ── */}
        {frame >= T.arrowStart && arrowP > 0.04 && (
          <svg
            style={{
              position: 'absolute',
              left: CX - ARROW_HEAD_W / 2,
              top:  arrowTipY - ARROW_HEAD_H,
              overflow: 'visible',
            }}
            width={ARROW_HEAD_W}
            height={ARROW_HEAD_H}
            viewBox={`0 0 ${ARROW_HEAD_W} ${ARROW_HEAD_H}`}
          >
            <polygon
              points={`${ARROW_HEAD_W / 2},${ARROW_HEAD_H} 0,0 ${ARROW_HEAD_W},0`}
              fill="#e0625a"
            />
          </svg>
        )}

        {/* ── Text box ── */}
        {frame >= T.textEnter && (
          <div style={{
            position: 'absolute',
            left: CX,
            top:  TEXT_BOX_TOP,
            transform: `translateX(-50%) scale(${textPop.toFixed(4)})`,
            transformOrigin: 'top center',
            opacity: textOpacity,
            ...BOX_STYLE,
            boxShadow: glow(textPop),
            padding: `${TEXT_PAD_V}px ${TEXT_PAD_H}px`,
            textAlign: 'center' as const,
            whiteSpace: 'nowrap' as const,
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            fontSize: TEXT_FONT,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: TEXT_LH,
            color: '#111111',
          }}>
            {TEXT_LINES.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

      </div>
    </AbsoluteFill>
  );
};
