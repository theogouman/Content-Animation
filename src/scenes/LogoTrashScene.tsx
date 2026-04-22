import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const NOTION_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873844/Notion_Meet_ue29im.png';
const FATHOM_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874001/Fathom-Logomark-RGB_Cyan_rjwsew.png';
const TLDV_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776873998/Tl_dv_Logo_yviufv.png';
const NOOTA_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874068/Noota_logo_w5a7jv.png';
const TRASH_URL = 'https://res.cloudinary.com/dceobxyts/image/upload/v1776874125/Poubelle_Emoji_iOS_bt25cp.png';

// ─── Timeline (frames @ 30fps) ────────────────────────────────────────────────
const T = {
  notionPop:   15,  // Notion Meet pops in
  fathomPop:   60,  // Fathom pops in
  tldvPop:     70,  // Tl:DV pops in
  nootaPop:    80,  // Noota pops in
  trashPop:   110,  // 30f hold → trash appears + Notion slides left
  flyStart:   165,  // 55f settle+hold → 3 logos fly to trash
  mergeStart: 210,  // 45f fly+hold → trash merges behind Notion
  fadeOut:    265,  // 55f merge+hold → Notion fade out
  end:        345,
} as const;

// ─── Layout (1080 × 1920 canvas) ─────────────────────────────────────────────
const CX = 540;        // canvas center X
const ROW1_Y = 900;    // Notion + Trash row center Y
const ROW2_Y = 1020;   // 3 logos row center Y

const NW = 200;  const NH = 70;   // Notion Meet container
const SS = 70;                     // small logo size (square)
const TS = 72;                     // trash emoji size
const GAP = 32;                    // gap between items

// Row 1: Notion + Trash grouped and centered at CX
const G1 = NW + GAP + TS;                     // 304px
const NOTION_SOLO_X   = CX;                    // 540 – centered alone
const NOTION_PAIRED_X = CX - G1/2 + NW/2;     // 388
const TRASH_CX        = CX + G1/2 - TS/2;     // 656

// Row 2: 3 logos centered at CX
const G2 = SS * 3 + GAP * 2;                  // 274px
const LOGO_CX = [
  CX - G2/2 + SS/2,   // 439 – Fathom
  CX,                  // 540 – Tl:DV
  CX + G2/2 - SS/2,   // 641 – Noota
];

// ─── Helper: pop spring ───────────────────────────────────────────────────────
const popSpring = (frame: number, fps: number, delay: number) =>
  spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: { damping: 7, stiffness: 300 } });

// ─── Main scene ──────────────────────────────────────────────────────────────
export const LogoTrashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Notion Meet ──────────────────────────────────────────────────────────────
  // Pop-in scale
  const notionPopScale = popSpring(frame, fps, T.notionPop);
  const notionOpacity = interpolate(frame, [T.notionPop, T.notionPop + 8], [0, 1], { extrapolateRight: 'clamp' });

  // X position: solo → paired with trash → re-centered at merge
  let notionX: number;
  if (frame >= T.mergeStart) {
    notionX = spring({ frame: frame - T.mergeStart, fps, from: NOTION_PAIRED_X, to: CX, config: { damping: 14 } });
  } else if (frame >= T.trashPop) {
    notionX = spring({ frame: frame - T.trashPop, fps, from: NOTION_SOLO_X, to: NOTION_PAIRED_X, config: { damping: 14 } });
  } else {
    notionX = NOTION_SOLO_X;
  }

  // Final fade out
  const notionFade = interpolate(frame, [T.fadeOut, T.fadeOut + 35], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Trash emoji ──────────────────────────────────────────────────────────────
  const trashPopScale = popSpring(frame, fps, T.trashPop);
  const trashOpacity = interpolate(frame, [T.trashPop, T.trashPop + 8], [0, 1], { extrapolateRight: 'clamp' });

  // Trash "eats" logos – brief scale pulse when fly completes
  const eatFrame = Math.max(0, frame - (T.flyStart + 28));
  const trashEat = interpolate(eatFrame, [0, 6, 14], [1, 1.25, 1], { extrapolateRight: 'clamp' });

  // Merge: trash slides toward Notion and fades
  const trashMergeFrame = Math.max(0, frame - T.mergeStart);
  const trashMergeX = spring({ frame: trashMergeFrame, fps, from: TRASH_CX, to: NOTION_PAIRED_X, config: { damping: 14 } });
  const trashMergeFade = interpolate(trashMergeFrame, [0, 15, 35], [1, 0.4, 0], { extrapolateRight: 'clamp' });

  const trashFinalX = frame >= T.mergeStart ? trashMergeX : TRASH_CX;
  const trashFinalScale = frame >= T.mergeStart
    ? trashPopScale * interpolate(trashMergeFrame, [0, 35], [1, 0.3], { extrapolateRight: 'clamp' })
    : trashPopScale * trashEat;
  const trashFinalOpacity = frame >= T.mergeStart ? trashOpacity * trashMergeFade : trashOpacity;

  // ── Small logos (row 2) ──────────────────────────────────────────────────────
  const smallLogos = [
    { url: FATHOM_URL, popAt: T.fathomPop, soloX: LOGO_CX[0], stagger: 0  },
    { url: TLDV_URL,   popAt: T.tldvPop,   soloX: LOGO_CX[1], stagger: 4  },
    { url: NOOTA_URL,  popAt: T.nootaPop,  soloX: LOGO_CX[2], stagger: 8  },
  ];

  const animatedLogos = smallLogos.map((logo) => {
    const popScale = popSpring(frame, fps, logo.popAt);
    const logoOpacity = interpolate(frame, [logo.popAt, logo.popAt + 8], [0, 1], { extrapolateRight: 'clamp' });

    // Fly to trash
    const flyFrame = Math.max(0, frame - T.flyStart - logo.stagger);
    const flyX = spring({ frame: flyFrame, fps, from: logo.soloX, to: TRASH_CX, config: { damping: 10, stiffness: 250 } });
    const flyY = spring({ frame: flyFrame, fps, from: ROW2_Y, to: ROW1_Y, config: { damping: 10, stiffness: 250 } });
    const flyScale = interpolate(flyFrame, [0, 28], [1, 0], { easing: Easing.in(Easing.cubic), extrapolateRight: 'clamp' });
    const flyOpacity = interpolate(flyFrame, [0, 22, 30], [1, 0.3, 0], { extrapolateRight: 'clamp' });

    const isFlyPhase = frame >= T.flyStart + logo.stagger;
    return {
      url: logo.url,
      x: isFlyPhase ? flyX : logo.soloX,
      y: isFlyPhase ? flyY : ROW2_Y,
      scale: isFlyPhase ? popScale * flyScale : popScale,
      opacity: isFlyPhase ? logoOpacity * flyOpacity : logoOpacity,
    };
  });

  return (
    <AbsoluteFill>
      {/* Row 2 logos — rendered first (behind trash and Notion) */}
      {animatedLogos.map((logo, i) => (
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
      ))}

      {/* Trash emoji — above small logos, behind Notion */}
      {frame >= T.trashPop && (
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

      {/* Notion Meet — topmost layer */}
      {frame >= T.notionPop && (
        <div
          style={{
            position: 'absolute',
            left: notionX - NW / 2,
            top: ROW1_Y - NH / 2,
            width: NW,
            height: NH,
            opacity: notionOpacity * notionFade,
            transform: `scale(${notionPopScale})`,
            transformOrigin: 'center',
          }}
        >
          <Img src={NOTION_URL} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
