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
  if (lessonId === "1") return { min: 1, max: 10 };
  if (lessonId === "2") return { min: 10, max: 20 };
  return { min: 1, max: 10 };
}
function generateSet(min: number, max: number) {
  const set = new Set<number>();
  while (set.size < 3) set.add(randInt(min, max));
  const arr = Array.from(set);
  return {
    numbers: arr.sort(() => Math.random() - 0.5),
    sorted: [...arr].sort((a, b) => a - b),
  };
}

export default function SortingGame({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: Props) {
  const range = useMemo(() => getRange(lessonId), [lessonId]);

  const [qIndex, setQIndex] = useState(1);
  const [score, setScore] = useState(0);
  const [{ numbers, sorted }, setSet] = useState(() =>
    generateSet(range.min, range.max)
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");

  const reset = () => {
    setSet(generateSet(range.min, range.max));
    setPicked([]);
    setFeedback("");
  };

  const pick = (n: number) => {
    if (picked.includes(n)) return;
    const next = [...picked, n];
    setPicked(next);

    if (next.length === 3) {
      const ok = next.every((v, i) => v === sorted[i]);
      if (ok) {
        setScore((s) => s + 10);
        setFeedback("✅ Đúng thứ tự!");
      } else {
        setFeedback("❌ Sai rồi!");
      }

      setTimeout(() => {
        const finalScore = ok ? score + 10 : score;
        if (qIndex >= TOTAL_QUESTIONS) {
          router.replace({
            pathname: `/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/result`,
            params: {
              chapterId,
              lessonId,
              gameId,
              score: String(finalScore),
              totalQuestions: String(TOTAL_QUESTIONS),
            },
          });
        } else {
          setQIndex((i) => i + 1);
          reset();
        }
      }, 800);
    }
  };

  const clear = () => {
    setPicked([]);
    setFeedback("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{gameData.title || "Sắp xếp số"}</Text>

      <View style={styles.topRow}>
        <Text style={styles.score}>Điểm: {score}</Text>
        <Text style={styles.q}>
          Câu {qIndex}/{TOTAL_QUESTIONS}
        </Text>
      </View>

      <Text style={styles.hint}>Chọn các số theo thứ tự tăng dần</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Các số:</Text>
        <View style={styles.row}>
          {numbers.map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.numBtn}
              onPress={() => pick(n)}
            >
              <Text style={styles.numText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Bạn chọn:</Text>
        <View style={styles.pickedRow}>
          {picked.map((n, i) => (
            <View key={`${n}-${i}`} style={styles.picked}>
              <Text style={styles.pickedText}>{n}</Text>
            </View>
          ))}
          {picked.length === 0 && (
            <Text style={{ color: "#90A4AE" }}>Chưa chọn</Text>
          )}
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={clear}>
          <Text style={styles.clearText}>Làm lại lượt chọn</Text>
        </TouchableOpacity>
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
  hint: {
    textAlign: "center",
    marginTop: 10,
    color: "#607D8B",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    elevation: 2,
  },
  label: { fontWeight: "800", marginTop: 6, marginBottom: 8 },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  numBtn: {
    backgroundColor: "#FF9800",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  numText: { color: "white", fontSize: 22, fontWeight: "900" },

  pickedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 52,
  },
  picked: {
    backgroundColor: "#2D9CDB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pickedText: { color: "white", fontWeight: "900", fontSize: 18 },

  clearBtn: { marginTop: 10, alignSelf: "center", padding: 10 },
  clearText: { color: "#2D9CDB", fontWeight: "800" },

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
