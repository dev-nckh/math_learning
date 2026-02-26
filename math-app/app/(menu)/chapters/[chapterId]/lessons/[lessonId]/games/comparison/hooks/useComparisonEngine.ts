import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateComparisonPair, normalizeRangeMode } from "../range";

type Op = "<" | ">" | "=";
type Feedback = "idle" | "correct" | "wrong";
type EndReason = "time" | "lives" | "manual" | null;

export interface UseComparisonEngineOptions {
  rangeMode?: string;
  hasTimer?: boolean;
  initialTimeSec?: number;

  hasLives?: boolean;
  initialLives?: number;

  // thời gian khóa sau khi trả lời để hiện feedback (ms)
  lockMs?: number;
}

function getCorrectOp(a: number, b: number): Op {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

export function useComparisonEngine(options: UseComparisonEngineOptions) {
  const {
    rangeMode,
    hasTimer = false,
    initialTimeSec = 0,
    hasLives = false,
    initialLives = 3,
    lockMs = 450,
  } = options;

  const mode = useMemo(() => normalizeRangeMode(rangeMode), [rangeMode]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<number>(initialTimeSec);
  const [livesLeft, setLivesLeft] = useState<number>(initialLives);

  const [locked, setLocked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback>("idle");

  const [ended, setEnded] = useState<boolean>(false);
  const [endReason, setEndReason] = useState<EndReason>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearLock = () => {
    if (lockRef.current) {
      clearTimeout(lockRef.current);
      lockRef.current = null;
    }
  };

  const makeQuestion = useCallback(() => {
    const pair = generateComparisonPair(mode);
    setA(pair.a);
    setB(pair.b);
  }, [mode]);

  const endGame = useCallback(
    (reason: EndReason) => {
      setEnded(true);
      setEndReason(reason);
      setLocked(true);
      clearTimer();
      clearLock();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const start = useCallback(
    (timeSec?: number) => {
      // reset
      clearTimer();
      clearLock();

      setEnded(false);
      setEndReason(null);
      setLocked(false);
      setFeedback("idle");

      setScore(0);
      setCorrect(0);
      setWrong(0);

      setLivesLeft(initialLives);

      // timer
      const t = hasTimer ? (timeSec ?? initialTimeSec) : 0;
      setTimeLeft(t);

      // first question
      makeQuestion();

      // start timer loop
      if (hasTimer) {
        const startValue = timeSec ?? initialTimeSec;
        setTimeLeft(startValue);

        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              // stop at 0 and end
              clearTimer();
              setEnded(true);
              setEndReason("time");
              setLocked(true);
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    },
    [hasTimer, initialLives, initialTimeSec, makeQuestion]
  );

  const submit = useCallback(
    (op: Op) => {
      if (ended || locked) return;

      const correctOp = getCorrectOp(a, b);
      const isCorrect = op === correctOp;

      setLocked(true);
      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        setCorrect((c) => c + 1);
        setScore((s) => s + 10);
      } else {
        setWrong((w) => w + 1);

        if (hasLives) {
          setLivesLeft((l) => {
            const next = l - 1;
            if (next <= 0) {
              // chết ngay khi hết mạng
              // (vẫn cho feedback hiển thị 1 chút)
              lockRef.current = setTimeout(() => endGame("lives"), lockMs);
              return 0;
            }
            return next;
          });
        }
      }

      // nếu chưa kết thúc -> sang câu mới sau lockMs
      lockRef.current = setTimeout(() => {
        // có thể game đã end vì lives/time
        setFeedback("idle");
        setLocked(false);
        if (!ended) makeQuestion();
      }, lockMs);
    },
    [a, b, ended, locked, hasLives, lockMs, makeQuestion, endGame]
  );

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      clearTimer();
      clearLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ui = {
    a,
    b,
    score,
    correct,
    wrong,

    timeLeft,
    livesLeft,

    locked,
    feedback,

    ended,
    endReason,
  };

  return { ui, start, submit, endGame };
}