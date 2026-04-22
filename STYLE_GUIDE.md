# Style Guide — Google Meet Animation

## Format
- **Dimensions**: 1080 × 1920 px (9:16 vertical)
- **FPS**: 30
- **Durée totale**: 480 frames (16 secondes)

## Meet Window
| Propriété | Valeur |
|-----------|--------|
| Largeur | 840 px |
| Hauteur | 560 px |
| Position X | 120 px (centré) |
| Position Y | 680 px (centré) |
| Border | 2px solid #e0625a |
| Border radius | 14 px |
| Box shadow | 0 24px 64px rgba(0,0,0,.20) |

### Zones internes
| Zone | Hauteur |
|------|---------|
| Chrome bar (browser) | 28 px |
| Meet header | 38 px |
| Video area | 442 px |
| Controls bar | 52 px |

## Couleurs
| Rôle | Valeur |
|------|--------|
| Fond page | `#f6f3f3` |
| Couleur signature | `#e0625a` |
| Meet background | `#202124` |
| Meet tile | `#1c1c1e` |
| Meet text | `#e8eaed` |
| Meet text muted | `#9AA0A6` |
| Meet control btn | `#3c4043` |
| Meet end call | `#ea4335` |
| Meet active/green | `#34A853` |

## Participants
| Nom | Initiales | Couleur |
|-----|-----------|---------|
| Théo Gouman | TG | #e0625a (avatar photo) |
| Sophie B. | SB | #4285F4 |
| Marc L. | ML | #34A853 |
| Claire D. | CD | #9C27B0 |
| Lucas R. | LR | #F4A400 |

## Timeline (frames @ 30fps)
| Event | Frame | Temps |
|-------|-------|-------|
| Fenêtre apparaît | 15 | 0.5s |
| Phase 1 — Théo seul | 20 | 0.7s |
| Phase 2 — Sophie rejoint | 90 | 3.0s |
| Phase 3 — Marc rejoint | 180 | 6.0s |
| Phase 4 — Claire rejoint | 270 | 9.0s |
| Phase 5 — Lucas rejoint | 360 | 12.0s |
| Fin | 480 | 16.0s |

## Grille vidéo (PAD=4, GAP=4, AW=832, AH=434)
| Participants | Layout |
|-------------|--------|
| 1 | Plein écran |
| 2 | Côte à côte (2 colonnes) |
| 3 | 3 colonnes égales |
| 4 | Grille 2×2 |
| 5 | 2 rangées : 2 en haut + 3 en bas |

## Animations
| Type | Config |
|------|--------|
| Fenêtre pop-in | `spring({ from: 0.4, to: 1, damping: 10 })` |
| Nouveau tile | `spring({ from: 0.5, to: 1, damping: 10 })` |
| Repositionnement tiles | `spring({ damping: 200 })` — fluide, sans bounce |
| Fade in tile | `interpolate([0, 12], [0, 1])` |
| Toast notification | `interpolate([0, 8, 50, 65], [0, 1, 1, 0])` |

## Règles
- Toutes les animations via `useCurrentFrame()` — zéro CSS transitions
- `spring()` pour les mouvements, `interpolate()` pour les fades
- `extrapolateRight: 'clamp'` sur chaque `interpolate()`
- `<Img>` de Remotion pour les images (pas `<img>`)
- Tout en inline styles, zéro fichier CSS externe
