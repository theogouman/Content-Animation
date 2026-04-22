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

// ─── Sizes — large enough to be visually impactful on 1080×1920 ──────────────
const CX     = 540;
const ROW1_Y = 840;   // Notion + Trash row
const ROW2_Y = 1060;  // 3 logos row

const NW  = 500; const NH = 140;  // Notion Meet (wide wordmark)
const SS  = 200;                   // small logos (square)
const TS  = 200;                   // trash (square)
const GAP = 40;

// Row 1 geometry: [Notion][gap][Trash] centered at CX
const G1            = NW + GAP + TS;          // 740px
const NOTION_SOLO_X = CX;                      // 540 — alone
const NOTION_PAIR_X = CX - G1 / 2 + NW / 2;  // 540 - 370 + 250 = 420
const TRASH_CX      = CX + G1 / 2 - TS / 2;  // 540 + 370 - 100 = 810

// Row 2 geometry: [Logo0][gap][Logo1][gap][Logo2] centered at CX
const G2      = SS * 3 + GAP * 2;             // 680px
const LOGO_CX = [
  CX - G2 / 2 + SS / 2,   // 540 - 340 + 100 = 300
  CX,                       // 540
  CX + G2 / 2 - SS / 2,   // 540 + 340 - 100 = 780
];

// ─── Smooth premium pop (damping 20 = snap without wild bounce) ───────────────
const smoothPop = (f: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, f - delay), fps, from: 0, to: 1, config: { damping: 20, stiffness: 320 } });

// ─── Scene ───────────────────────────────────────────────────────────────────
export const LogoTrashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Notion Meet ──────────────────────────────────────────────────────────────
  const notionScale   = smoothPop(frame, fps, T.notionPop);
  const notionOpacity = interpolate(frame, [T.notionPop, T.notionPop + 7], [0, 1], { extrapolateRight: 'clamp' });

  // X: solo(540) → paired(420) → centered again(540) during merge
  let notionX: number;
  if (frame >= T.mergeStart) {
    notionX = spring({ frame: frame - T.mergeStart, fps, from: NOTION_PAIR_X, to: CX, config: { damping: 16 } });
  } else if (frame >= T.trashPop) {
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

  // "Eat" pulse when logos arrive
  const eatF     = Math.max(0, frame - (T.flyStart + 18));
  const trashEat = interpolate(eatF, [0, 5, 12], [1, 1.2, 1], { extrapolateRight: 'clamp' });

  // Merge: trash slides toward CX (same target as Notion) and fades out completely.
  // Both converge at CX — since trash is behind Notion in z-order, it disappears behind it.
  const mergeF         = Math.max(0, frame - T.mergeStart);
  const trashMergeX    = spring({ frame: mergeF, fps, from: TRASH_CX, to: CX, config: { damping: 16 } });
  const trashMergeFade = interpolate(mergeF, [0, 20], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  const trashFinalX       = frame >= T.mergeStart ? trashMergeX : TRASH_CX;
  const trashFinalOpacity = frame >= T.mergeStart ? trashMergeFade : trashOpacity;
  const trashFinalScale   = frame >= T.mergeStart
    ? trashScale * interpolate(mergeF, [0, 20], [1, 0.5], { extrapolateRight: 'clamp' })
    : trashScale * trashEat;

  // Hard cutoff — no ghost after merge
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
    const flyScale   = 1 - flyProg;
    const flyOpacity = interpolate(flyF, [0, 16, 22], [1, 0.2, 0], { extrapolateRight: 'clamp' });

    const isFly = frame >= flyStart;
    return {
      url:     logo.url,
      x:       isFly ? flyX       : logo.soloX,
      y:       isFly ? flyY       : ROW2_Y,
      scale:   isFly ? popScale * flyScale   : popScale,
      opacity: isFly ? logoOpacity * flyOpacity : logoOpacity,
      show:    frame >= logo.popAt,
    };
  });

  return (
    <AbsoluteFill>
      {/* Row 2 — behind everything */}
      {animatedLogos.map((logo, i) =>
        logo.show ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: logo.x - SS / 2,
              top: logo.y - SS / 2,
              width: SS,
              height: SS,
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
            left: trashFinalX - TS / 2,
            top: ROW1_Y - TS / 2,
            width: TS,
            height: TS,
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
            left: notionX - NW / 2,
            top: ROW1_Y - NH / 2,
            width: NW,
            height: NH,
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
