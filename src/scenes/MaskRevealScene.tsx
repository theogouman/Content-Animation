import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

// ─── Text split ───────────────────────────────────────────────────────────────
// "3 Agents IA Notion à vendre +3 000€" balanced across 2 lines
const LINES = [
  '3 Agents IA Notion',
  'à vendre +3 000€',
];

// ─── Timing — spec values × site_reference.runtime multipliers ───────────────
// speed_multiplier: 0.72 | y_travel_multiplier: 0.58
const FPS  = 30;
const ms2f = (ms: number) => (ms / 1000) * FPS;

const ENTER_DUR     = ms2f(760 * 0.72);   // ≈ 16.4 f
const ENTER_STAGGER = ms2f(90  * 0.72);   // ≈  1.9 f
const Y_ENTER       = 30  * 0.58;         // ≈ 17.4 px (from below)
const BLUR_ENTER    = 6;                  // px

const EXIT_DUR      = ms2f(520 * 0.72);   // ≈ 11.2 f
const EXIT_STAGGER  = ms2f(70  * 0.72);   // ≈  1.5 f
const Y_EXIT        = 22  * 0.58;         // ≈ 12.8 px (exit upward)
const BLUR_EXIT     = 6;                  // px

const HOLD_FRAMES   = ms2f(2200);         // 2.2 s hold (video, not a loop)

const ENTER_START   = 12;
const ENTER_SPAN    = ENTER_DUR + (LINES.length - 1) * ENTER_STAGGER;
const EXIT_START    = ENTER_START + ENTER_SPAN + HOLD_FRAMES;

export const MASK_REVEAL_TOTAL_FRAMES = Math.ceil(
  EXIT_START + EXIT_DUR + (LINES.length - 1) * EXIT_STAGGER + 14,
);

// cubic-bezier easing straight from spec
const enterEase = Easing.bezier(0.22, 1,    0.36, 1);
const exitEase  = Easing.bezier(0.64, 0,    0.78, 0);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const MaskRevealScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 0,
    }}>
      {LINES.map((line, i) => {
        const eStart = ENTER_START + i * ENTER_STAGGER;
        const xStart = EXIT_START  + i * EXIT_STAGGER;

        // 0→1 enter progress, 0→1 exit progress
        const ep = interpolate(frame, [eStart, eStart + ENTER_DUR], [0, 1], {
          easing: enterEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const xp = interpolate(frame, [xStart, xStart + EXIT_DUR], [0, 1], {
          easing: exitEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });

        const opacity = ep * (1 - xp);
        // enter: slides up from +Y_ENTER  |  exit: continues upward to −Y_EXIT
        const y    = (1 - ep) * Y_ENTER - xp * Y_EXIT;
        const blur = (1 - ep) * BLUR_ENTER + xp * BLUR_EXIT;

        return (
          // overflow:hidden creates the hard mask that clips the sliding text
          <div key={i} style={{ overflow: 'hidden', lineHeight: 1.08 }}>
            <div style={{
              transform:  `translateY(${y.toFixed(2)}px)`,
              opacity,
              filter:     blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none',
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
              fontSize:   90,
              fontWeight: 600,
              letterSpacing: '-0.022em',
              lineHeight: 1.08,
              color:      '#000000',
              textAlign:  'center',
              whiteSpace: 'nowrap',
            }}>
              {line}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
