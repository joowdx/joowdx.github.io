export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** smoothstep on [0,1] */
export const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

/** eased 0→1 as t travels from a to b */
export const seg = (t, a, b) => smooth((t - a) / (b - a));

/** deterministic LCG; the scene looks the same on every load */
export function createRng(seed = 7) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  rnd.pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  return rnd;
}
