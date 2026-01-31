// Local, type-safe helpers for Time lessons (Chapter 4)
export type TmMinute = 0 | 30;

export interface TmTime {
  hour: number; // 1..12
  minute: TmMinute;
}

export function randomFullOrHalf(): TmTime {
  const hour = Math.floor(Math.random() * 12) + 1; // 1..12
  const minute: TmMinute = Math.random() < 0.5 ? 0 : 30;
  return { hour, minute };
}

export function toTimeLabel(h: number, m: TmMinute): string {
  return m === 0 ? `${h} giờ` : `${h} giờ rưỡi`;
}

export function generateOptions(correct: TmTime, count: number): TmTime[] {
  const out: TmTime[] = [];
  const seen = new Set<string>();

  const key = (t: TmTime) => `${t.hour}-${t.minute}`;

  const pushUnique = (t: TmTime) => {
    const k = key(t);
    if (!seen.has(k) && out.length < count) {
      out.push(t);
      seen.add(k);
    }
  };

  // Always include correct option first
  pushUnique(correct);

  // Candidate distractors: flip minutes, +/-1 hour, combinations
  const candidates: TmTime[] = [];
  candidates.push({ hour: correct.hour, minute: (correct.minute === 0 ? 30 : 0) });
  candidates.push({ hour: ((correct.hour + 10) % 12) + 1, minute: correct.minute }); // -1 hour in 1..12
  candidates.push({ hour: (correct.hour % 12) + 1, minute: correct.minute }); // +1 hour
  candidates.push({ hour: ((correct.hour + 10) % 12) + 1, minute: (correct.minute === 0 ? 30 : 0) });
  candidates.push({ hour: (correct.hour % 12) + 1, minute: (correct.minute === 0 ? 30 : 0) });

  // Shuffle candidates lightly and push until reaching desired count
  for (const c of candidates.sort(() => Math.random() - 0.5)) {
    if (out.length >= count) break;
    pushUnique(c);
  }

  // If still not enough (edge rare), fill with random unique
  while (out.length < count) {
    const r = randomFullOrHalf();
    pushUnique(r);
  }

  return out.sort(() => Math.random() - 0.5);
}

