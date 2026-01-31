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

function buildPairs(min: number, max: number) {
  // tạo 3 cặp (hình-count) + số
  const counts = new Set<number>();
  while (counts.size < 3) counts.add(randInt(min, max));
  const left = Array.from(counts).map((c, idx) => ({
    id: `L${idx}`,
    count: c,
  }));
  const right = Array.from(counts)
    .sort(() => Math.random() - 0.5)
    .map((c, idx) => ({ id: `R${idx}`, value: c }));
  return { left, right };
}

export default function MatchingGame({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: Props) {
  const range = useMemo(() => getRange(lessonId), [lessonId]);

  const [qIndex, setQIndex] = useState(1);
  const [score, setScore] = useState(0);

  const [{ left, right }, setPairs] = useState(() =>
    buildPairs(range.min, range.max)
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState("");

  const resetRound = () => {
    setPairs(buildPairs(range.min, range.max));
    setSelectedLeft(null);
    setMatched({});
    setFeedback("");
  };

  const onPickLeft = (id: string) => {
    if (matched[id]) return;
    setSelectedLeft(id);
    setFeedback("");
  };

  const onPickRight = (rid: string) => {
    if (!selectedLeft) return;

    const L = left.find((x) => x.id === selectedLeft);
    const R = right.find((x) => x.id === rid);
    if (!L || !R) return;

    const ok = L.count === R.value;
    if (ok) {
      setScore((s) => s + 10);
      setFeedback("✅ Ghép đúng!");
      setMatched((m) => ({ ...m, [selectedLeft]: true, [rid]: true }));
      setSelectedLeft(null);

      const allMatched =
        Object.keys({ ...matched, [selectedLeft]: true, [rid]: true }).length >=
        6;
      if (allMatched) {
        setTimeout(() => {
          if (qIndex >= TOTAL_QUESTIONS) {
            router.replace({
              pathname: `/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/result`,
              params: {
                chapterId,
                lessonId,
                gameId,
                score: String(score + 10),
                totalQuestions: String(TOTAL_QUESTIONS),
              },
            });
          } else {
            setQIndex((i) => i + 1);
            resetRound();
          }
        }, 700);
      }
    } else {
      setFeedback("❌ Sai rồi, thử lại!");
    }
  };

  const renderIcons = (n: number) => {
    const icon = "🍎";
    const show = Math.min(n, 20);
    return (
      <View style={styles.iconsWrap}>
        {Array.from({ length: show }).map((_, i) => (
          <Text key={i} style={styles.icon}>
            {icon}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{gameData.title || "Ghép số với hình"}</Text>

      <View style={styles.topRow}>
        <Text style={styles.score}>Điểm: {score}</Text>
        <Text style={styles.q}>
          Câu {qIndex}/{TOTAL_QUESTIONS}
        </Text>
      </View>

      <Text style={styles.hint}>
        Chọn 1 hình bên trái rồi chọn số đúng bên phải
      </Text>

      <View style={styles.grid}>
        <View style={styles.col}>
          {left.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[
                styles.card,
                selectedLeft === l.id && {
                  borderColor: "#2D9CDB",
                  borderWidth: 3,
                },
                matched[l.id] && { opacity: 0.4 },
              ]}
              onPress={() => onPickLeft(l.id)}
            >
              {renderIcons(l.count)}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.col}>
          {right.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.numberCard, matched[r.id] && { opacity: 0.4 }]}
              onPress={() => onPickRight(r.id)}
            >
              <Text style={styles.numberText}>{r.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
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

  grid: { flexDirection: "row", gap: 12, marginTop: 14, flex: 1 },
  col: { flex: 1, gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 10,
    elevation: 2,
  },
  numberCard: {
    backgroundColor: "#2D9CDB",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: "white", fontSize: 28, fontWeight: "900" },

  iconsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  icon: { fontSize: 18, margin: 2 },

  feedback: {
    textAlign: "center",
    marginTop: 10,
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
