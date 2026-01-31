export type RangeMode = "small" | "large" | "mix";

export function normalizeRangeMode(value: unknown): RangeMode {
  if (value === "small" || value === "large" || value === "mix") return value;
  return "mix";
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a pair of numbers for the comparison game.
 * - small: 0..10
 * - large: 10..100
 * - mix:
 *    50% small-small, 30% large-large, 20% cross (small-large or large-small)
 * - "=" appears ~15% for same-range pairs (small-small / large-large).
 */
export function generateComparisonPair(range: RangeMode): { a: number; b: number } {
  const wantEqual = Math.random() < 0.15;

  if (range === "small") {
    const a = randInt(0, 10);
    const b = wantEqual ? a : randInt(0, 10);
    return { a, b };
  }

  if (range === "large") {
    const a = randInt(10, 100);
    const b = wantEqual ? a : randInt(10, 100);
    return { a, b };
  }

  // mix
  const r = Math.random();

  // 50%: small-small
  if (r < 0.5) {
    const a = randInt(0, 10);
    const b = wantEqual ? a : randInt(0, 10);
    return { a, b };
  }

  // 30%: large-large
  if (r < 0.8) {
    const a = randInt(10, 100);
    const b = wantEqual ? a : randInt(10, 100);
    return { a, b };
  }

  // 20%: cross (no "=")
  const a = randInt(0, 10);
  const b = randInt(10, 100);
  return Math.random() < 0.5 ? { a, b } : { a: b, b: a };
}
