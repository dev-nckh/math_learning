import { useEffect, useMemo, useRef, useState } from "react";
import { generateComparisonPair, normalizeRangeMode, RangeMode } from "../range";

type ModeConfig = {
  rangeMode?: unknown;
  totalQuestions?: number;
  hasTimer?: boolean;
  initialTimeSec?: number;
  hasLives?: boolean;
  initialLives?: number;

  // ✅ thêm để nhìn rõ feedback
  feedbackDurationMs?: number; // default 600
};

type EndReason = "done" | "time" | "lives";

function expectedOp(a: number, b: number): "<" | "=" | ">" {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

function pickRangeByProgress(base: RangeMode, progress01: number): RangeMode {
  if (base !== "mix") return base;
  if (progress01 < 0.34) return "small";
  if (progress01 < 0.67) return "mix";
  return "large";
}

export function useComparisonEngine(config: ModeConfig) {
  const baseRange = normalizeRangeMode(config.rangeMode);

  const totalQuestions = config.totalQuestions ?? null;
  const hasTimer = !!config.hasTimer;
  const initialTime = config.initialTimeSec ?? 0;
  const hasLives = !!config.hasLives;
  const initialLives = config.initialLives ?? 0;

  const feedbackDurationMs = config.feedbackDurationMs ?? 600;

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [question, setQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [lives, setLives] = useState(initialLives);

  const [locked, setLocked] = useState(false);

  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);

  // ✅ lưu nút đã bấm để UI tô đúng nút đó
  const [selectedOp, setSelectedOp] = useState<null | "<" | "=" | ">">(null);

  const [ended, setEnded] = useState(false);
  const [endReason, setEndReason] = useState<EndReason>("done");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress01 = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.min(1, Math.max(0, (question - 1) / totalQuestions));
  }, [question, totalQuestions]);

  const spawn = () => {
    const rMode = pickRangeByProgress(baseRange, progress01);
    const pair = generateComparisonPair(rMode);
    setA(pair.a);
    setB(pair.b);
  };

  const start = () => {
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setQuestion(1);

    setEnded(false);
    setEndReason("done");

    setLocked(false);
    setFeedback(null);
    setSelectedOp(null);

    setTimeLeft(hasTimer ? initialTime : 0);
    setLives(hasLives ? initialLives : 0);

    spawn();
  };

  const endNow = (reason: EndReason) => {
    setEnded(true);
    setEndReason(reason);
    setLocked(true);
    // giữ feedback để user nhìn, nhưng không cho bấm nữa
  };

  const submit = (op: "<" | "=" | ">") => {
    if (locked || ended) return;

    setLocked(true);
    setSelectedOp(op); // ✅ lưu nút vừa bấm

    const ok = expectedOp(a, b) === op;
    setFeedback(ok ? "correct" : "wrong");

    if (ok) {
      setScore((s) => s + 1);
      setCorrect((c) => c + 1);
    } else {
      setWrong((w) => w + 1);
      if (hasLives) {
        setLives((lv) => {
          const next = lv - 1;
          if (next <= 0) {
            setTimeout(() => endNow("lives"), feedbackDurationMs);
          }
          return next;
        });
      }
    }

    setTimeout(() => {
      if (ended) return;

      if (totalQuestions && question >= totalQuestions) {
        endNow("done");
        return;
      }

      setQuestion((q) => q + 1);
      setLocked(false);
      setFeedback(null);
      setSelectedOp(null);
      spawn();
    }, feedbackDurationMs);
  };

  useEffect(() => {
    if (!hasTimer) return;
    if (ended) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeout(() => endNow("time"), 10);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasTimer, ended]);

  const ui = {
    a,
    b,
    score,
    correct,
    wrong,
    question,
    totalQuestions,
    timeLeft,
    lives,
    locked,
    feedback,
    selectedOp, // ✅ export ra UI dùng
    ended,
    endReason,
  };

  return { ui, start, submit };
}
