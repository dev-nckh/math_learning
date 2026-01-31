import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

interface Props {
  chapterId: string;
  lessonId: string;
  gameId: string;
  gameData: {
    id: number;
    title: string;
    type: string;
    difficulty: string;
    description: string;
  };
}

const TOTAL_QUESTIONS = 5;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRange(lessonId: string) {
  // bài 2: 10..20
  if (lessonId === "2") return { min: 10, max: 20 };
  // fallback
  return { min: 1, max: 20 };
}

function buildQuestion(min: number, max: number) {
  // sequence 4 số tăng dần, thiếu 1 số ở giữa
  const start = randInt(min, Math.min(max - 3, max));
  const seq = [start, start + 1, start + 2, start + 3];

  const missingIndex = randInt(1, 2); // thiếu ở giữa (không thiếu đầu/cuối)
  const answer = seq[missingIndex];

  const display = seq.map((x, i) => (i === missingIndex ? null : x));

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 4) options.add(randInt(min, max));

  return {
    display, // (number|null)[]
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

export default function MissingNumberGame({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: Props) {
  const range = useMemo(() => getRange(lessonId), [lessonId]);

  const [qIndex, setQIndex] = useState(1);
  const [score, setScore] = useState(0);

  const [q, setQ] = useState(() => buildQuestion(range.min, range.max));
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const next = (newScore: number) => {
    if (qIndex >= TOTAL_QUESTIONS) {
      router.replace({
        pathname: `/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/result`,
        params: {
          chapterId,
          lessonId,
          gameId,
          score: String(newScore),
          totalQuestions: String(TOTAL_QUESTIONS),
        },
      });
      return;
    }
    setQIndex((i) => i + 1);
    setQ(buildQuestion(range.min, range.max));
    setSelected(null);
    setFeedback("");
  };

  const submit = (v: number) => {
    if (selected !== null) return;
    setSelected(v);

    const ok = v === q.answer;
    const newScore = ok ? score + 10 : score;

    if (ok) {
      setScore(newScore);
      setFeedback("✅ Đúng rồi!");
    } else {
      setFeedback("❌ Sai rồi!");
    }

    setTimeout(() => next(newScore), 700);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{gameData.title || "Tìm số thiếu"}</Text>

      <View style={styles.topRow}>
        <Text style={styles.score}>Điểm: {score}</Text>
        <Text style={styles.q}>
          Câu {qIndex}/{TOTAL_QUESTIONS}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.hint}>Chọn số còn thiếu trong dãy:</Text>

        <View style={styles.seqRow}>
          {q.display.map((x, i) => (
            <View key={i} style={[styles.box, x === null && styles.missingBox]}>
              <Text style={styles.boxText}>{x === null ? "?" : x}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.optionsRow}>
        {q.options.map((op) => (
          <TouchableOpacity
            key={op}
            style={styles.option}
            onPress={() => submit(op)}
          >
            <Text style={styles.optionText}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.feedback}>{feedback}</Text>

      <TouchableOpacity style={styles.exitBtn} onPress={() => router.back()}>
        <Text style={styles.exitText}>🚪 Thoát</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F6FBFF" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 6 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  score: { fontSize: 16, fontWeight: "700", color: "#1B5E20" },
  q: { fontSize: 16, fontWeight: "700", color: "#455A64" },

  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    elevation: 2,
  },
  hint: { textAlign: "center", fontWeight: "800" },

  seqRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
  },
  box: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#2D9CDB",
    alignItems: "center",
    justifyContent: "center",
  },
  missingBox: { backgroundColor: "#FF9800" },
  boxText: { color: "white", fontSize: 22, fontWeight: "900" },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  option: {
    backgroundColor: "#2D9CDB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionText: { color: "white", fontSize: 20, fontWeight: "900" },

  feedback: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#00897B",
  },
  exitBtn: {
    marginTop: "auto",
    backgroundColor: "#B0BEC5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  exitText: { fontWeight: "800", color: "#263238" },
});
