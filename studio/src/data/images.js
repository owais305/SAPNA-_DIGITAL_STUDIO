// Placeholder photography images (Unsplash). Swap these for the studio's
// own shoot whenever real assets are ready — just replace the URL strings.
const u = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMAGES = {
  heroPhotographer: u('photo-1500648767791-00dcc994a43e', 1200),
  lens: u('photo-1516035069371-29a1b244cc32', 1200),
  servicePortrait: u('photo-1544005313-94ddf0286df2', 700),
  serviceWedding: u('photo-1519741497674-611481863552', 700),
  serviceProduct: u('photo-1524592094714-0f0654e20314', 700),
  serviceLandscape: u('photo-1506905925346-21bda4d32df4', 700),
  galleryPortrait: u('photo-1544005313-94ddf0286df2', 500),
  galleryLake: u('photo-1439066615861-d1af74d74000', 500),
  galleryPhotographer: u('photo-1502920917128-1aa500764cbd', 500),
  galleryBride: u('photo-1519225421980-715cb0215aed', 500),
  galleryCity: u('photo-1519501025264-65ba15a82390', 500),
  galleryMountain: u('photo-1470071459604-3b5ec3a7fe05', 500),
}
