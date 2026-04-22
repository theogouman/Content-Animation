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
const NOTION_URL  = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873844/Notion_Meet_ue29im.png';
const CAPTURE_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776879488/Capture_d_e%CC%81cran_2026-04-22_a%CC%80_19.37.44_qwwppb.png';

const ACCENT = '#e0625a';

// ─── Timeline (228 frames ≈ 7.6 s @ 30 fps) ──────────────────────────────────
const T = {
  notionPop:   12,
  arr1Start:   46,
  cam1Start:   50,
  arr1End:     80,
  cam1End:     94,
  // hold on Box 1: 94 → 128
  arr2Start:   128,
  cam2Start:   132,
  arr2End:     162,
  cam2End:     175,
  textStart:   162,
  fadeStart:   205,
  end:         228,
} as const;

// ─── World layout ─────────────────────────────────────────────────────────────
const CX = 960;

// Node 0 — Notion Meet
const NOTION_W  = 260;
const NOTION_H  = 90;
const NOTION_P  = 24;
const NBOX_W    = NOTION_W + 2 * NOTION_P; // 308
const NBOX_H    = NOTION_H + 2 * NOTION_P; // 138
const NBOX_Y    = 280;

// Node 1 — Screenshot
const IMG_W   = 320;
const IMG_H   = 200;
const IMG_P   = 16;
const BOX1_W  = IMG_W + 2 * IMG_P; // 352
const BOX1_H  = IMG_H + 2 * IMG_P; // 232
const BOX1_Y  = 870;

// Node 2 — Text bars
const BOX2_W   = 600;
const BOX2_H   = 188;
const BOX2_Y   = 1450;
const TEXT_PAD = 28;
const TEXT_W   = BOX2_W - 2 * TEXT_PAD; // 544

// Camera stops: translateY so world-Y aligns with screen center (540)
const CAM_0 = 540 - NBOX_Y;  // +260
const CAM_1 = 540 - BOX1_Y;  // -330
const CAM_2 = 540 - BOX2_Y;  // -910

// Arrow 1 (straight down: Notion → Box 1)
const A1_OY  = NBOX_Y  + NBOX_H  / 2;         // 349
const A1_TY  = BOX1_Y  - BOX1_H  / 2 - 14;    // 475 ... recalculated below
// Arrow 2 (straight down: Box 1 → Box 2)
const A2_OY  = BOX1_Y  + BOX1_H  / 2;         // 1068
const A2_TY  = BOX2_Y  - BOX2_H  / 2 - 14;    // 1342

const DOWN = Math.PI / 2; // downward direction angle

// Text bar definitions
const BARS = [
  { w: 180, h: 14, y: 0,   delay: 0,  col: '#c4c4c4' }, // heading
  { w: 530, h: 11, y: 38,  delay: 9,  col: '#d8d8d8' },
  { w: 450, h: 11, y: 61,  delay: 18, col: '#d8d8d8' },
  { w: 510, h: 11, y: 84,  delay: 27, col: '#d8d8d8' },
  { w: 360, h: 11, y: 107, delay: 36, col: '#d8d8d8' }, // last line (shorter)
];
const TEXT_TOTAL_H = 107 + 11; // 118

// ─── Visual constants ─────────────────────────────────────────────────────────
const BORDER_W = 2.5;
const RADIUS   = 16;
const SHADOW   = '0 6px 32px rgba(0,0,0,0.08)';
const ARR_W    = 3;
const ARR_HEAD = 14;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const smoothPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1,
    config: { damping: 22, stiffness: 300 } });

const fadeIn = (f: number, start: number) =>
  interpolate(f, [start, start + 8], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** SVG polygon points for an arrowhead tip at (tx,ty) pointing in direction `angle` */
const mkArrow = (tx: number, ty: number, angle: number, sz: number): string => {
  const bx  = tx - sz * Math.cos(angle);
  const by  = ty - sz * Math.sin(angle);
  const hw  = sz * 0.45;
  const p1x = bx + hw * Math.cos(angle + Math.PI / 2);
  const p1y = by + hw * Math.sin(angle + Math.PI / 2);
  const p2x = bx + hw * Math.cos(angle - Math.PI / 2);
  const p2y = by + hw * Math.sin(angle - Math.PI / 2);
  return `${tx},${ty} ${p1x},${p1y} ${p2x},${p2y}`;
};

const card = (
  cx: number, cy: number, w: number, h: number, scale: number, opacity: number,
): React.CSSProperties => ({
  position: 'absolute',
  left: cx - w / 2, top: cy - h / 2,
  width: w, height: h,
  border:          `${BORDER_W}px solid ${ACCENT}`,
  borderRadius:    RADIUS,
  background:      '#ffffff',
  boxShadow:       SHADOW,
  opacity,
  transform:       `scale(${scale})`,
  transformOrigin: 'center',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
});

// ─── Arrow SVG ────────────────────────────────────────────────────────────────
const ArrowLine: React.FC<{ oy: number; curY: number; showHead: boolean }> = ({ oy, curY, showHead }) => (
  <svg
    style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
    width={1920} height={1}
  >
    <line x1={CX} y1={oy} x2={CX} y2={curY}
      stroke={ACCENT} strokeWidth={ARR_W} strokeLinecap="round" />
    {showHead && <polygon points={mkArrow(CX, curY, DOWN, ARR_HEAD)} fill={ACCENT} />}
  </svg>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const NotionFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Node 0 — Notion Meet
  const notionScale   = smoothPop(frame, fps, T.notionPop);
  const notionOpacity = fadeIn(frame, T.notionPop);

  // Camera: smooth pan through 3 positions
  const cameraY = interpolate(
    frame,
    [T.cam1Start, T.cam1End, T.cam2Start, T.cam2End],
    [CAM_0,       CAM_1,     CAM_1,       CAM_2],
    { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Arrow 1
  const arr1Prog = interpolate(frame, [T.arr1Start, T.arr1End], [0, 1], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const cur1Y = A1_OY + (A1_TY - A1_OY) * arr1Prog;

  // Node 1 — Screenshot
  const box1Scale   = smoothPop(frame, fps, T.arr1End);
  const box1Opacity = fadeIn(frame, T.arr1End);

  // Arrow 2
  const arr2Prog = interpolate(frame, [T.arr2Start, T.arr2End], [0, 1], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const cur2Y = A2_OY + (A2_TY - A2_OY) * arr2Prog;

  // Node 2 — Text box
  const box2Scale   = smoothPop(frame, fps, T.arr2End);
  const box2Opacity = fadeIn(frame, T.arr2End);

  // Text bars — scaleX from 0 to 1 per bar
  const barProg = (delay: number) =>
    interpolate(frame, [T.textStart + delay, T.textStart + delay + 20], [0, 1], {
      easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

  // Cursor blink after last bar finishes
  const lastBar      = BARS[BARS.length - 1];
  const lastBarProg  = barProg(lastBar.delay);
  const cursorX      = lastBar.w * lastBarProg;
  const blinkStart   = T.textStart + lastBar.delay + 20;
  const cursorOpacity = frame >= blinkStart
    ? (Math.floor((frame - blinkStart) / 10) % 2 === 0 ? 1 : 0)
    : lastBarProg > 0 ? 1 : 0;

  // Global fade-out
  const globalOpacity = interpolate(frame, [T.fadeStart, T.end], [1, 0], {
    easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      {/* World container — entire scene pans via translateY */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 1920, height: 0,
        transform: `translateY(${cameraY}px)`,
      }}>

        {/* ── Node 0: Notion Meet ── */}
        <div style={card(CX, NBOX_Y, NBOX_W, NBOX_H, notionScale, notionOpacity)}>
          <Img src={NOTION_URL} style={{ width: NOTION_W, height: NOTION_H, objectFit: 'contain' }} />
        </div>

        {/* ── Arrow 1 ── */}
        {frame >= T.arr1Start && arr1Prog > 0.01 && (
          <ArrowLine oy={A1_OY} curY={cur1Y} showHead={arr1Prog > 0.14} />
        )}

        {/* ── Node 1: Screenshot ── */}
        {frame >= T.arr1End && (
          <div style={card(CX, BOX1_Y, BOX1_W, BOX1_H, box1Scale, box1Opacity)}>
            <Img
              src={CAPTURE_URL}
              style={{ width: IMG_W, height: IMG_H, objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
        )}

        {/* ── Arrow 2 ── */}
        {frame >= T.arr2Start && arr2Prog > 0.01 && (
          <ArrowLine oy={A2_OY} curY={cur2Y} showHead={arr2Prog > 0.14} />
        )}

        {/* ── Node 2: Text animation ── */}
        {frame >= T.arr2End && (
          <div style={card(CX, BOX2_Y, BOX2_W, BOX2_H, box2Scale, box2Opacity)}>
            <div style={{ position: 'relative', width: TEXT_W, height: TEXT_TOTAL_H }}>
              {BARS.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0, top: bar.y,
                    width: bar.w, height: bar.h,
                    background: bar.col,
                    borderRadius: bar.h / 2,
                    transformOrigin: 'left center',
                    transform: `scaleX(${barProg(bar.delay)})`,
                  }}
                />
              ))}
              {/* Cursor — follows end of last bar, then blinks */}
              {lastBarProg > 0 && (
                <div style={{
                  position: 'absolute',
                  left: cursorX + 3,
                  top: lastBar.y - 2,
                  width: 2,
                  height: lastBar.h + 4,
                  background: ACCENT,
                  borderRadius: 1,
                  opacity: cursorOpacity,
                }} />
              )}
            </div>
          </div>
        )}

      </div>
    </AbsoluteFill>
  );
};
