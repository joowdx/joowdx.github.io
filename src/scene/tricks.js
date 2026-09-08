import { seg } from './math.js';

/** flipX spins the board around its long axis (kickflip/heelflip); spinY is a shove-it in turns; manual is a different ride. */
export const TRICKS = {
  'kickflip': { flipX: -1 },
  'heelflip': { flipX: 1 },
  'pop shove-it': { spinY: 0.5 },
  '360 shove-it': { spinY: 1 },
  'varial kickflip': { flipX: -1, spinY: 0.5 },
  'manual': { manual: true },
};
export const TRICK_NAMES = Object.keys(TRICKS);

/**
 * The ollie (or a manual) as a function of loop phase t ∈ [0,1).
 * Returns board pitch/height plus the cat's crouch/absorb/tuck amounts.
 */
export function pose(t, def, { popAngle, jumpHeight }) {
  if (def?.manual) {
    const m = seg(t, 0.24, 0.42) - seg(t, 0.74, 0.92);
    const pitch = 0.26 * m;
    return { pitch, height: 0.62 * Math.sin(pitch), crouch: 0.3 * m, absorb: 0, tuck: 0, inAir: 0, manual: m };
  }
  const crouch = seg(t, 0.28, 0.42) - seg(t, 0.44, 0.5);
  let pitch = popAngle * seg(t, 0.42, 0.49) * (1 - seg(t, 0.5, 0.66));
  pitch += -0.12 * (seg(t, 0.62, 0.72) - seg(t, 0.72, 0.84));
  const air = t > 0.47 && t < 0.86 ? Math.sin((Math.PI * (t - 0.47)) / 0.39) : 0;
  const lift = Math.max(0, 0.95 * Math.sin(Math.max(0, pitch))) * (1 - seg(t, 0.49, 0.58)); // tail-pivot lift while popping
  const absorb = seg(t, 0.85, 0.9) - seg(t, 0.9, 0.99);
  const tuck = seg(t, 0.52, 0.62) - seg(t, 0.74, 0.85);
  const inAir = seg(t, 0.46, 0.49) - seg(t, 0.85, 0.88);
  return { pitch, height: jumpHeight * air + lift, crouch, absorb, tuck, inAir, manual: 0 };
}
