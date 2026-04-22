import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ─── Assets ───────────────────────────────────────────────────────────────────
const IMAGE_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776887625/Capture_d_e%CC%81cran_2026-04-22_a%CC%80_21.36.18_znjbf4.png';

const ACCENT = '#e0625a';

// ─── Timeline (185 frames ≈ 6.2 s @ 30 fps) ──────────────────────────────────
const T = {
  floatStart:  20,
  box1Start:   30,
  cam1Start:   30,
  cam1End:     54,
  x1Start:     46,
  box2Start:   90,
  cam2Start:   90,
  cam2End:     112,
  x2Start:     106,
  fadeStart:   160,
  end:         185,
} as const;

// ─── World layout ─────────────────────────────────────────────────────────────
const CX = 960;

const IMG_W      = 700;
const IMG_H      = 420;
const IMG_RADIUS = 20;
const IMAGE_Y    = 300; // world center Y

const BOX1_Y = 660;
const BOX2_Y = 748;

const CAM_0 = 540 - IMAGE_Y;                        // +240
const CAM_1 = 540 - BOX1_Y;                         // -120
const CAM_2 = 540 - Math.round((BOX1_Y + BOX2_Y) / 2); // -162

// ─── Text box constants ───────────────────────────────────────────────────────
const BOX_PAD_V  = 18;
const BOX_PAD_H  = 30;
const BOX_RADIUS = 14;
const BOX_FONT   = 28;
const BOX_BORDER = 2;
const BOX_FONT_STACK = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const smoothPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1,
    config: { damping: 22, stiffness: 300 } });

const quickPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1,
    config: { damping: 20, stiffness: 380 } });

const fadeIn = (f: number, start: number, dur = 8) =>
  interpolate(f, [start, start + dur], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// ─── ✖ badge ──────────────────────────────────────────────────────────────────
const XBadge: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div style={{
    position: 'absolute',
    top: -14, right: -14,
    width: 28, height: 28,
    borderRadius: '50%',
    background: ACCENT,
    border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ffffff',
    fontSize: 13, fontWeight: 700, lineHeight: 1,
    transform: `scale(${scale})`,
    transformOrigin: 'center',
    opacity,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  }}>
    ✖
  </div>
);

// ─── Text card ────────────────────────────────────────────────────────────────
const TextCard: React.FC<{
  y: number; text: string;
  scale: number; opacity: number;
  showX: boolean; xScale: number; xOpacity: number;
}> = ({ y, text, scale, opacity, showX, xScale, xOpacity }) => (
  <div style={{
    position: 'absolute',
    left: CX, top: y,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: 'center',
    opacity,
    // visual
    border: `${BOX_BORDER}px solid ${ACCENT}`,
    borderRadius: BOX_RADIUS,
    background: '#000000',
    padding: `${BOX_PAD_V}px ${BOX_PAD_H}px`,
    color: '#ffffff',
    fontFamily: BOX_FONT_STACK,
    fontSize: BOX_FONT,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 28px rgba(0,0,0,0.3)',
  }}>
    {text}
    {showX && <XBadge scale={xScale} opacity={xOpacity} />}
  </div>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const PainPointScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Image slide-in ───────────────────────────────────────────────────────────
  const imageWorldY = spring({ frame, fps, from: 900, to: IMAGE_Y,
    config: { damping: 22, stiffness: 115 } });
  const imageOpacity = fadeIn(frame, 0, 14);

  // ── Float oscillation ────────────────────────────────────────────────────────
  const elapsed  = Math.max(0, frame - T.floatStart);
  const rotX     = Math.sin(elapsed * 0.030) * 2.0;          // ±2° avant/arrière
  const rotZ     = Math.sin(elapsed * 0.025 + 0.8) * 1.2;   // ±1.2° rotation
  const bobY     = Math.sin(elapsed * 0.040) * 5;            // ±5px vertical
  const swayX    = Math.sin(elapsed * 0.028 + 1.2) * 4;     // ±4px horizontal
  const floatTransform = `perspective(1200px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) translateY(${bobY}px) translateX(${swayX}px)`;

  // ── Glow (pulsing in sync with float) ────────────────────────────────────────
  const glowBuild = interpolate(frame, [0, 22], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowPulse = 1 + Math.sin(elapsed * 0.040) * 0.18;
  const g = glowBuild * glowPulse;
  const glowShadow = [
    `0 0 0 3px rgba(224,98,90,${+(Math.min(1, 0.9 * g)).toFixed(3)})`,
    `0 0 24px rgba(224,98,90,${+(0.70 * g).toFixed(3)})`,
    `0 0 60px rgba(224,98,90,${+(0.42 * g).toFixed(3)})`,
    `0 0 120px rgba(224,98,90,${+(0.20 * g).toFixed(3)})`,
  ].join(', ');

  // ── Camera (3-stop pan) ──────────────────────────────────────────────────────
  const cameraY = interpolate(
    frame,
    [T.cam1Start, T.cam1End, T.cam2Start, T.cam2End],
    [CAM_0,       CAM_1,     CAM_1,       CAM_2],
    { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // ── Box animations ───────────────────────────────────────────────────────────
  const box1Scale  = smoothPop(frame, fps, T.box1Start);
  const box1Opacity = fadeIn(frame, T.box1Start);
  const x1Scale   = quickPop(frame, fps, T.x1Start);
  const x1Opacity = fadeIn(frame, T.x1Start, 5);

  const box2Scale  = smoothPop(frame, fps, T.box2Start);
  const box2Opacity = fadeIn(frame, T.box2Start);
  const x2Scale   = quickPop(frame, fps, T.x2Start);
  const x2Opacity = fadeIn(frame, T.x2Start, 5);

  // ── Global fade-out ──────────────────────────────────────────────────────────
  const globalOpacity = interpolate(frame, [T.fadeStart, T.end], [1, 0], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* World — camera pan + global fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1920, height: 0,
        transform: `translateY(${cameraY}px)`,
        opacity: globalOpacity,
      }}>

        {/* ── Image ── */}
        <div style={{
          position: 'absolute',
          left: CX - IMG_W / 2,
          top: imageWorldY - IMG_H / 2,
          width: IMG_W, height: IMG_H,
          opacity: imageOpacity,
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: IMG_RADIUS,
            overflow: 'hidden',
            boxShadow: glowShadow,
            transform: floatTransform,
            transformOrigin: 'center',
          }}>
            <Img
              src={IMAGE_URL}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>

        {/* ── Box 1 ── */}
        {frame >= T.box1Start && (
          <TextCard
            y={BOX1_Y}
            text="Tu ne prends pas de notes"
            scale={box1Scale}
            opacity={box1Opacity}
            showX={frame >= T.x1Start}
            xScale={x1Scale}
            xOpacity={x1Opacity}
          />
        )}

        {/* ── Box 2 ── */}
        {frame >= T.box2Start && (
          <TextCard
            y={BOX2_Y}
            text="Tu perds ton temps à écrire tes notes"
            scale={box2Scale}
            opacity={box2Opacity}
            showX={frame >= T.x2Start}
            xScale={x2Scale}
            xOpacity={x2Opacity}
          />
        )}

      </div>
    </AbsoluteFill>
  );
};
