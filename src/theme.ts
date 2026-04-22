export const COLORS = {
  bg: '#f6f3f3',
  signature: '#e0625a',
  meetBg: '#202124',
  meetTile: '#1c1c1e',
  meetText: '#e8eaed',
  meetTextMuted: '#9AA0A6',
  meetCtrl: '#3c4043',
  meetEndCall: '#ea4335',
  meetActive: '#34A853',
};

export const FONT = {
  main: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
};

// Meet window geometry
const WIN_H = 560;
const WIN_CHROME = 28;
const WIN_HEADER = 38;
const WIN_CTRL = 52;

export const WIN = {
  W: 840,
  H: WIN_H,
  X: 120,  // (1080 - 840) / 2
  Y: 680,  // (1920 - 560) / 2
  CHROME_H: WIN_CHROME,
  HEADER_H: WIN_HEADER,
  CTRL_H: WIN_CTRL,
  VID_H: WIN_H - WIN_CHROME - WIN_HEADER - WIN_CTRL, // 442
  GAP: 4,
  PAD: 4,
} as const;

export type Participant = {
  id: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  initials: string;
};

export const PARTICIPANTS: Participant[] = [
  {
    id: 'theo',
    name: 'Théo Gouman',
    avatarUrl: 'https://res.cloudinary.com/dceobxyts/image/upload/v1776794023/Avatar_nboukr.jpg',
    color: '#e0625a',
    initials: 'TG',
  },
  { id: 'sophie', name: 'Sophie B.', avatarUrl: null, color: '#4285F4', initials: 'SB' },
  { id: 'marc',   name: 'Marc L.',   avatarUrl: null, color: '#34A853', initials: 'ML' },
  { id: 'claire', name: 'Claire D.', avatarUrl: null, color: '#9C27B0', initials: 'CD' },
  { id: 'lucas',  name: 'Lucas R.',  avatarUrl: null, color: '#F4A400', initials: 'LR' },
];

// Phase start frames (30 fps)
export const TIMELINE = {
  windowStart: 15,
  phase1: 20,   // Théo seul
  phase2: 90,   // Sophie rejoint
  phase3: 180,  // Marc rejoint
  phase4: 270,  // Claire rejoint
  phase5: 360,  // Lucas rejoint
  end: 480,
} as const;
