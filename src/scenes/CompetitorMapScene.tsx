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
const FATHOM_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874001/Fathom-Logomark-RGB_Cyan_rjwsew.png';
const TLDV_URL   = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873998/Tl_dv_Logo_yviufv.png';
const NOOTA_URL  = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874068/Noota_logo_w5a7jv.png';
const ZOOM_URL   = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776877665/zoom-logo-in-blue-colors-meetings-app-logotype-illustration-free-png_te09pw.webp';
const MEET_URL   = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776877667/Google_Meet_Logo_zxiyaw.svg';

const ACCENT = '#e0625a';

// ─── Timeline (180 frames = 6 s @ 30 fps) ────────────────────────────────────
const T = {
  boxPop:      12,
  fathomPop:   18,
  tldvPop:     28,
  nootaPop:    38,
  arrowStart:  58,
  cameraStart: 64,
  arrowEnd:    102,
  cameraEnd:   120,
  fadeStart:   155,
  end:         180,
} as const;

// ─── World layout ─────────────────────────────────────────────────────────────
const CX = 960; // world horizontal center

// Competitor box
const TOP_LOGO_W = 130;
const TOP_LOGO_H = 68;
const TOP_PAD_X  = 20;
const TOP_PAD_Y  = 16;
const TOP_GAP    = 20;
const TOP_BOX_W  = 3 * TOP_LOGO_W + 2 * TOP_GAP + 2 * TOP_PAD_X; // 470
const TOP_BOX_H  = TOP_LOGO_H + 2 * TOP_PAD_Y;                    // 100
const TOP_BOX_Y  = 380; // world center Y

// Bottom boxes
const BTM_LOGO_W  = 210;
const BTM_LOGO_H  = 128;
const BTM_PAD_X   = 26;
const BTM_PAD_Y   = 22;
const BTM_BOX_W   = BTM_LOGO_W + 2 * BTM_PAD_X; // 262
const BTM_BOX_H   = BTM_LOGO_H + 2 * BTM_PAD_Y; // 172
const BOTTOM_Y    = 980; // world center Y
const BTM_SPREAD  = 290; // horizontal offset from CX
const LEFT_CX     = CX - BTM_SPREAD;  // 670
const RIGHT_CX    = CX + BTM_SPREAD;  // 1250

// Camera: translateY shifts the world container so a world-Y aligns with screen-CY (540)
const CAM_INIT  = 540 - TOP_BOX_Y;  // +160 → top box centered on screen
const CAM_FINAL = 540 - BOTTOM_Y;   // -440 → bottom boxes centered on screen

// Arrow geometry
const ARR_OX = CX;
const ARR_OY = TOP_BOX_Y + TOP_BOX_H / 2;      // 430 — bottom-center of top box
const ARR_TY = BOTTOM_Y - BTM_BOX_H / 2 - 14;  // ~879 — just above bottom boxes

// Precomputed arrow direction angles
const LEFT_ANG  = Math.atan2(ARR_TY - ARR_OY, LEFT_CX  - ARR_OX);
const RIGHT_ANG = Math.atan2(ARR_TY - ARR_OY, RIGHT_CX - ARR_OX);

// ─── Visual constants ─────────────────────────────────────────────────────────
const BORDER_W = 2.5;
const RADIUS   = 16;
const SHADOW   = '0 6px 32px rgba(0,0,0,0.08)';
const ARR_W    = 3;    // stroke width
const ARR_HEAD = 14;   // arrowhead size

// ─── Helpers ──────────────────────────────────────────────────────────────────
const smoothPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1,
    config: { damping: 22, stiffness: 300 } });

const fadeIn = (f: number, start: number) =>
  interpolate(f, [start, start + 8], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** SVG polygon points for an arrowhead tip at (tx,ty) pointing in direction `angle` */
const arrowPoints = (tx: number, ty: number, angle: number, sz: number): string => {
  const bx = tx - sz * Math.cos(angle);
  const by = ty - sz * Math.sin(angle);
  const hw = sz * 0.45;
  const p1x = bx + hw * Math.cos(angle + Math.PI / 2);
  const p1y = by + hw * Math.sin(angle + Math.PI / 2);
  const p2x = bx + hw * Math.cos(angle - Math.PI / 2);
  const p2y = by + hw * Math.sin(angle - Math.PI / 2);
  return `${tx},${ty} ${p1x},${p1y} ${p2x},${p2y}`;
};

const cardBase = (cx: number, cy: number, w: number, h: number, scale: number, opacity: number): React.CSSProperties => ({
  position: 'absolute',
  left: cx - w / 2,
  top:  cy - h / 2,
  width:  w,
  height: h,
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

// ─── Scene ────────────────────────────────────────────────────────────────────
export const CompetitorMapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Top box
  const boxScale   = smoothPop(frame, fps, T.boxPop);
  const boxOpacity = fadeIn(frame, T.boxPop);

  // Competitor logos with stagger
  const compLogos = [
    { url: FATHOM_URL, delay: T.fathomPop },
    { url: TLDV_URL,   delay: T.tldvPop   },
    { url: NOOTA_URL,  delay: T.nootaPop  },
  ].map(l => ({
    url:     l.url,
    scale:   smoothPop(frame, fps, l.delay),
    opacity: fadeIn(frame, l.delay),
  }));

  // Camera pan
  const cameraY = interpolate(
    frame,
    [T.cameraStart, T.cameraEnd],
    [CAM_INIT, CAM_FINAL],
    { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Arrow growth (0 → 1)
  const arrowProg = interpolate(frame, [T.arrowStart, T.arrowEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Current arrow tip positions
  const curLX = ARR_OX + (LEFT_CX  - ARR_OX) * arrowProg;
  const curLY = ARR_OY + (ARR_TY   - ARR_OY) * arrowProg;
  const curRX = ARR_OX + (RIGHT_CX - ARR_OX) * arrowProg;
  const curRY = curLY; // symmetric — same Y

  // Bottom boxes
  const btmScale   = smoothPop(frame, fps, T.arrowEnd);
  const btmOpacity = fadeIn(frame, T.arrowEnd);

  // Global fade-out
  const globalOpacity = interpolate(frame, [T.fadeStart, T.end], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const showArrows = frame >= T.arrowStart && arrowProg > 0.01;
  const showHead   = arrowProg > 0.14;
  const showBtm    = frame >= T.arrowEnd;

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      {/* World container — entire scene pans via translateY */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 1920, height: 0,
        transform: `translateY(${cameraY}px)`,
      }}>

        {/* ── Competitor box ── */}
        <div style={cardBase(CX, TOP_BOX_Y, TOP_BOX_W, TOP_BOX_H, boxScale, boxOpacity)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: TOP_GAP }}>
            {compLogos.map((l, i) => (
              <div key={i} style={{
                width: TOP_LOGO_W, height: TOP_LOGO_H, flexShrink: 0,
                opacity: l.opacity,
                transform: `scale(${l.scale})`,
                transformOrigin: 'center',
              }}>
                <Img src={l.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Arrows SVG ── */}
        {showArrows && (
          <svg
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
            width={1920} height={1}
          >
            {/* Left arrow */}
            <line x1={ARR_OX} y1={ARR_OY} x2={curLX} y2={curLY}
              stroke={ACCENT} strokeWidth={ARR_W} strokeLinecap="round" />
            {showHead && <polygon points={arrowPoints(curLX, curLY, LEFT_ANG, ARR_HEAD)} fill={ACCENT} />}

            {/* Right arrow */}
            <line x1={ARR_OX} y1={ARR_OY} x2={curRX} y2={curRY}
              stroke={ACCENT} strokeWidth={ARR_W} strokeLinecap="round" />
            {showHead && <polygon points={arrowPoints(curRX, curRY, RIGHT_ANG, ARR_HEAD)} fill={ACCENT} />}
          </svg>
        )}

        {/* ── Bottom boxes ── */}
        {showBtm && (
          <>
            {/* Zoom — left */}
            <div style={cardBase(LEFT_CX, BOTTOM_Y, BTM_BOX_W, BTM_BOX_H, btmScale, btmOpacity)}>
              <Img src={ZOOM_URL}
                style={{ width: BTM_LOGO_W, height: BTM_LOGO_H, objectFit: 'contain' }} />
            </div>

            {/* Google Meet — right */}
            <div style={cardBase(RIGHT_CX, BOTTOM_Y, BTM_BOX_W, BTM_BOX_H, btmScale, btmOpacity)}>
              <Img src={MEET_URL}
                style={{ width: BTM_LOGO_W, height: BTM_LOGO_H, objectFit: 'contain' }} />
            </div>
          </>
        )}

      </div>
    </AbsoluteFill>
  );
};
