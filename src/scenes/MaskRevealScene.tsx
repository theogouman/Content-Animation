import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

// ─── Text split ────────────────────────────────────────────────────────────────
const LINES = ['3 Agents IA Notion', 'à vendre', '+3 000€'];

// ─── Timing — spec values × site_reference.runtime multipliers ────────────────
// speed_multiplier: 0.72 | y_travel_multiplier: 0.58
const FPS  = 30;
const ms2f = (ms: number) => (ms / 1000) * FPS;

const ENTER_DUR     = ms2f(760 * 0.72);   // ≈ 16.4 f
const ENTER_STAGGER = ms2f(90  * 0.72);   // ≈  1.9 f
const Y_ENTER       = 30  * 0.58;         // ≈ 17.4 px
const BLUR_ENTER    = 6;                  // px

const EXIT_DUR      = ms2f(520 * 0.72);   // ≈ 11.2 f
const EXIT_STAGGER  = ms2f(70  * 0.72);   // ≈  1.5 f
const Y_EXIT        = 22  * 0.58;         // ≈ 12.8 px
const BLUR_EXIT     = 6;                  // px

const HOLD_FRAMES   = ms2f(2200);         // 66 f hold
const ENTER_START   = 12;
const ENTER_SPAN    = ENTER_DUR + (LINES.length - 1) * ENTER_STAGGER;
const EXIT_START    = ENTER_START + ENTER_SPAN + HOLD_FRAMES;

export const MASK_REVEAL_TOTAL_FRAMES = Math.ceil(
  EXIT_START + EXIT_DUR + (LINES.length - 1) * EXIT_STAGGER + 14,
);

const enterEase = Easing.bezier(0.22, 1,    0.36, 1);
const exitEase  = Easing.bezier(0.64, 0,    0.78, 0);

// ─── Handdrawn underline ───────────────────────────────────────────────────────
// Wavy cubic-bezier path, ~370 px wide, 4 humps
const UPATH = 'M 0,12 C 30,-6 62,28 92,12 C 122,-4 154,28 184,12 C 214,-4 246,28 276,12 C 306,-4 338,28 370,12';
const UPATH_LEN = 378; // approximate arc length
// Start drawing after line 2 ("+3 000€") finishes entering
const ULINE_START = Math.round(ENTER_START + 2 * ENTER_STAGGER + ENTER_DUR) + 6;
const ULINE_DUR   = 22;

// ─── Shimmer constants ─────────────────────────────────────────────────────────
const SHIMMER_PERIOD = 55; // frames per sweep

// ─── Scene ────────────────────────────────────────────────────────────────────
export const MaskRevealScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Per-line enter / exit progress
  const lines = LINES.map((_, i) => {
    const eStart = ENTER_START + i * ENTER_STAGGER;
    const xStart = EXIT_START  + i * EXIT_STAGGER;
    const ep = interpolate(frame, [eStart, eStart + ENTER_DUR], [0, 1], {
      easing: enterEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const xp = interpolate(frame, [xStart, xStart + EXIT_DUR], [0, 1], {
      easing: exitEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return {
      opacity: ep * (1 - xp),
      y:       (1 - ep) * Y_ENTER - xp * Y_EXIT,
      blur:    (1 - ep) * BLUR_ENTER + xp * BLUR_EXIT,
    };
  });

  // Noir brillant shimmer for line 2 ("+3 000€")
  // sp sweeps -50 → 150 over SHIMMER_PERIOD frames — highlight crosses text left→right
  const sp = ((frame % SHIMMER_PERIOD) / SHIMMER_PERIOD) * 200 - 50;
  const shimmerGrad = `linear-gradient(100deg, #111 0%, #111 ${Math.max(0, sp - 15).toFixed(1)}%, #888 ${sp.toFixed(1)}%, #fff ${(sp + 5).toFixed(1)}%, #888 ${(sp + 10).toFixed(1)}%, #111 ${Math.min(100, sp + 25).toFixed(1)}%, #111 100%)`;

  // Underline draw: strokeDashoffset from UPATH_LEN → 0
  const udraw = interpolate(frame, [ULINE_START, ULINE_START + ULINE_DUR], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const dashOffset = UPATH_LEN * (1 - udraw);

  const fontStyle = {
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    fontSize:      90,
    fontWeight:    600,
    letterSpacing: '-0.022em',
    lineHeight:    1.08,
    textAlign:     'center' as const,
    whiteSpace:    'nowrap'  as const,
  };

  return (
    <AbsoluteFill style={{ background: '#c8c8c8' }}>
      <AbsoluteFill style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexDirection:  'column',
        gap:            0,
      }}>
        {lines.map(({ opacity, y, blur }, i) => (
          // overflow:hidden creates the hard mask that clips the sliding text
          <div key={i} style={{ overflow: 'hidden', lineHeight: 1.08 }}>
            <div style={{
              ...fontStyle,
              transform: `translateY(${y.toFixed(2)}px)`,
              opacity,
              filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none',
              ...(i === 2
                ? {
                    backgroundImage:       shimmerGrad,
                    WebkitBackgroundClip:  'text',
                    backgroundClip:        'text',
                    WebkitTextFillColor:   'transparent',
                    color:                 'transparent',
                  }
                : { color: '#111111' }),
            }}>
              {LINES[i]}
            </div>
          </div>
        ))}

        {/* 0-height flex item sits at line 2's bottom; SVG positioned relative to it */}
        {/* With alignItems:center, this div's left edge sits at x=540 (canvas center) */}
        <div style={{ position: 'relative', height: 0 }}>
          <svg
            style={{
              position: 'absolute',
              left:     -185, // 540 - 185 = 355 → centers 370 px path at x=540
              top:       10,
              opacity:   lines[2].opacity,
              overflow: 'visible',
            }}
            width={370}
            height={24}
            viewBox="0 0 370 24"
          >
            <path
              d={UPATH}
              fill="none"
              stroke="#e0625a"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={UPATH_LEN}
              strokeDashoffset={dashOffset}
            />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
