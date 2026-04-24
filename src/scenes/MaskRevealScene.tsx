import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

// ─── Text split ────────────────────────────────────────────────────────────────
const LINES = ['3 Agents IA Notion', 'à vendre +3 000€'];

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

const HOLD_FRAMES   = ms2f(2200);         // 2.2 s hold
const ENTER_START   = 12;
const ENTER_SPAN    = ENTER_DUR + (LINES.length - 1) * ENTER_STAGGER;
const EXIT_START    = ENTER_START + ENTER_SPAN + HOLD_FRAMES;

export const MASK_REVEAL_TOTAL_FRAMES = Math.ceil(
  EXIT_START + EXIT_DUR + (LINES.length - 1) * EXIT_STAGGER + 14,
);

const enterEase = Easing.bezier(0.22, 1,    0.36, 1);
const exitEase  = Easing.bezier(0.64, 0,    0.78, 0);

// ─── Shimmer ───────────────────────────────────────────────────────────────────
const SHIMMER_PERIOD = 55; // frames per sweep

// ─── Scene ────────────────────────────────────────────────────────────────────
export const MaskRevealScene: React.FC = () => {
  const frame = useCurrentFrame();

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

  // Noir brillant shimmer: highlight sweeps left→right across "+3 000€"
  const sp = ((frame % SHIMMER_PERIOD) / SHIMMER_PERIOD) * 200 - 50;
  const shimmerGrad = `linear-gradient(100deg, #111 0%, #111 ${Math.max(0, sp - 15).toFixed(1)}%, #888 ${sp.toFixed(1)}%, #fff ${(sp + 5).toFixed(1)}%, #888 ${(sp + 10).toFixed(1)}%, #111 ${Math.min(100, sp + 25).toFixed(1)}%, #111 100%)`;

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
    <AbsoluteFill style={{
      background:     '#f6f3f3',
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
            color:     '#111111',
            transform: `translateY(${y.toFixed(2)}px)`,
            opacity,
            filter:    blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none',
          }}>
            {i === 1 ? (
              <>
                <span>à vendre </span>
                <span style={{
                  backgroundImage:      shimmerGrad,
                  WebkitBackgroundClip: 'text',
                  backgroundClip:       'text',
                  WebkitTextFillColor:  'transparent',
                  color:                'transparent',
                }}>+3 000€</span>
              </>
            ) : LINES[i]}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
