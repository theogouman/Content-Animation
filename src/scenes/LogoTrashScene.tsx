import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const NOTION_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873844/Notion_Meet_ue29im.png';
const FATHOM_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874001/Fathom-Logomark-RGB_Cyan_rjwsew.png';
const TLDV_URL   = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873998/Tl_dv_Logo_yviufv.png';
const NOOTA_URL  = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874068/Noota_logo_w5a7jv.png';
const TRASH_URL  = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874125/Poubelle_Emoji_iOS_bt25cp.png';

// ─── Timeline — 5 seconds (150 frames @ 30fps) ────────────────────────────────
const T = {
  notionPop:   5,
  fathomPop:  22,
  tldvPop:    29,
  nootaPop:   36,
  trashPop:   52,
  flyStart:   75,
  mergeStart: 102,
  fadeOut:    122,
  end:        150,
} as const;

// ─── Layout — YouTube horizontal 1920×1080 ────────────────────────────────────
const CX = 960;   // canvas center X (1920/2)
const CY = 540;   // canvas center Y (1080/2)

// All logos identical square size — maximum visual impact
const S   = 300;   // uniform size for every logo/icon
const G1  = 80;    // gap between Notion and Trash (row 1)
const G2  = 70;    // gap between small logos (row 2)

// Row 1 vertical center: slightly above canvas center
// Row 2 vertical center: below
const ROW1_Y = CY - 120;   // 420
const ROW2_Y = CY + 200;   // 740

// Row 1: [Notion S×S] [G1] [Trash S×S] — centered at CX
const GROUP1_W      = S + G1 + S;                   // 680px
const NOTION_SOLO_X = CX;                             // 960 alone
const NOTION_PAIR_X = CX - GROUP1_W / 2 + S / 2;    // 960-340+150 = 770
const TRASH_CX      = CX + GROUP1_W / 2 - S / 2;    // 960+340-150 = 1150

// Row 2: [Logo0 S×S] [G2] [Logo1 S×S] [G2] [Logo2 S×S] — centered at CX
const GROUP2_W = S * 3 + G2 * 2;                     // 1040px
const LOGO_CX  = [
  CX - GROUP2_W / 2 + S / 2,   // 960-520+150 = 590
  CX,                            // 960
  CX + GROUP2_W / 2 - S / 2,   // 960+520-150 = 1330
];

// ─── Smooth premium pop ───────────────────────────────────────────────────────
const smoothPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 20, stiffness: 320 } });

// ─── Scene ───────────────────────────────────────────────────────────────────
export const LogoTrashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Notion Meet ──────────────────────────────────────────────────────────────
  const notionScale   = smoothPop(frame, fps, T.notionPop);
  const notionOpacity = interpolate(frame, [T.notionPop, T.notionPop + 7], [0, 1], { extrapolateRight: 'clamp' });

  let notionX: number;
  if (frame >= T.mergeStart) {
    // Re-centers — spring from pair position back to CX
    notionX = spring({ frame: frame - T.mergeStart, fps, from: NOTION_PAIR_X, to: CX, config: { damping: 16 } });
  } else if (frame >= T.trashPop) {
    // Slides left to make room for trash
    notionX = spring({ frame: frame - T.trashPop, fps, from: NOTION_SOLO_X, to: NOTION_PAIR_X, config: { damping: 16 } });
  } else {
    notionX = NOTION_SOLO_X;
  }

  const notionFade = interpolate(frame, [T.fadeOut, T.fadeOut + 25], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Trash emoji ──────────────────────────────────────────────────────────────
  const trashScale   = smoothPop(frame, fps, T.trashPop);
  const trashOpacity = interpolate(frame, [T.trashPop, T.trashPop + 7], [0, 1], { extrapolateRight: 'clamp' });

  // Brief "eat" pulse
  const eatF     = Math.max(0, frame - (T.flyStart + 18));
  const trashEat = interpolate(eatF, [0, 5, 12], [1, 1.18, 1], { extrapolateRight: 'clamp' });

  // Merge: trash slides to CX (same target as Notion) and fully fades
  const mergeF         = Math.max(0, frame - T.mergeStart);
  const trashMergeX    = spring({ frame: mergeF, fps, from: TRASH_CX, to: CX, config: { damping: 16 } });
  const trashMergeFade = interpolate(mergeF, [0, 20], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  const trashFinalX       = frame >= T.mergeStart ? trashMergeX : TRASH_CX;
  const trashFinalOpacity = frame >= T.mergeStart ? trashMergeFade : trashOpacity;
  const trashFinalScale   = frame >= T.mergeStart
    ? trashScale * interpolate(mergeF, [0, 20], [1, 0.4], { extrapolateRight: 'clamp' })
    : trashScale * trashEat;

  // Hard stop — no ghost element after merge completes
  const showTrash = frame >= T.trashPop && frame < T.mergeStart + 22;

  // ── Small logos (row 2) ──────────────────────────────────────────────────────
  const LOGOS = [
    { url: FATHOM_URL, popAt: T.fathomPop, soloX: LOGO_CX[0], flyStagger: 0 },
    { url: TLDV_URL,   popAt: T.tldvPop,   soloX: LOGO_CX[1], flyStagger: 3 },
    { url: NOOTA_URL,  popAt: T.nootaPop,  soloX: LOGO_CX[2], flyStagger: 6 },
  ];

  const animatedLogos = LOGOS.map((logo) => {
    const popScale    = smoothPop(frame, fps, logo.popAt);
    const logoOpacity = interpolate(frame, [logo.popAt, logo.popAt + 7], [0, 1], { extrapolateRight: 'clamp' });

    const flyStart = T.flyStart + logo.flyStagger;
    const flyF     = Math.max(0, frame - flyStart);
    const flyProg  = interpolate(flyF, [0, 22], [0, 1], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateRight: 'clamp',
    });
    const flyX       = logo.soloX + (TRASH_CX - logo.soloX) * flyProg;
    const flyY       = ROW2_Y    + (ROW1_Y   - ROW2_Y)      * flyProg;
    const flyOpacity = interpolate(flyF, [0, 16, 22], [1, 0.2, 0], { extrapolateRight: 'clamp' });

    const isFly = frame >= flyStart;
    return {
      url:     logo.url,
      x:       isFly ? flyX             : logo.soloX,
      y:       isFly ? flyY             : ROW2_Y,
      scale:   isFly ? popScale * (1 - flyProg) : popScale,
      opacity: isFly ? logoOpacity * flyOpacity  : logoOpacity,
      show:    frame >= logo.popAt,
    };
  });

  return (
    <AbsoluteFill>
      {/* Row 2 — lowest z-order */}
      {animatedLogos.map((logo, i) =>
        logo.show ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: logo.x - S / 2,
              top: logo.y - S / 2,
              width: S,
              height: S,
              opacity: logo.opacity,
              transform: `scale(${logo.scale})`,
              transformOrigin: 'center',
            }}
          >
            <Img src={logo.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ) : null
      )}

      {/* Trash — above small logos, behind Notion */}
      {showTrash && (
        <div
          style={{
            position: 'absolute',
            left: trashFinalX - S / 2,
            top: ROW1_Y - S / 2,
            width: S,
            height: S,
            opacity: trashFinalOpacity,
            transform: `scale(${trashFinalScale})`,
            transformOrigin: 'center',
          }}
        >
          <Img src={TRASH_URL} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* Notion Meet — topmost */}
      {frame >= T.notionPop && (
        <div
          style={{
            position: 'absolute',
            left: notionX - S / 2,
            top: ROW1_Y - S / 2,
            width: S,
            height: S,
            opacity: notionOpacity * notionFade,
            transform: `scale(${notionScale})`,
            transformOrigin: 'center',
          }}
        >
          <Img src={NOTION_URL} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
