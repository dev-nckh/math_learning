import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import ScreenShell from "./components/ScreenShell";
import TutorialModal from "./components/TutorialModal";
import GameOverModal from "./components/GameOverModal";
import { useComparisonEngine } from "./hooks/useComparisonEngine";

export default function LivesMode() {
  const { chapterId, lessonId, rangeMode } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
    rangeMode?: string;
  }>();

  const [showTut, setShowTut] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const engine = useComparisonEngine({
    rangeMode,
    totalQuestions: total ?? undefined,
    hasLives: true,
    initialLives: 3,
    hasTimer: false,
  });

  const backToIndex = () => {
    router.replace({
      pathname:
        "/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison",
      params: { chapterId, lessonId },
    });
  };

  const startWith = (n: number) => {
    setTotal(n);
    setTimeout(() => engine.start(), 0);
  };

  const titleText = useMemo(() => {
    if (!total) return "3 mạng";
    return `3 mạng (❤️ ${engine.ui.lives})`;
  }, [total, engine.ui.lives]);

  const gameOverTitle =
    engine.ui.endReason === "lives" ? "Hết mạng!" : "Hoàn thành!";

  return (
    <ScreenShell
      title={titleText}
      onBack={backToIndex}
      rightActionText="?"
      onRightActionPress={() => setShowTut(true)}
    >
      <TutorialModal visible={showTut} onClose={() => setShowTut(false)} />

      <GameOverModal
        visible={engine.ui.ended}
        title={gameOverTitle}
        score={engine.ui.score}
        correct={engine.ui.correct}
        wrong={engine.ui.wrong}
        onRetry={() => engine.start()}
        onExit={backToIndex}
      />

      {!total ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.hint}>Chọn số câu</Text>

          {[10, 15, 20].map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.primary}
              onPress={() => startWith(n)}
            >
              <Text style={styles.primaryText}>{n} câu</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.secondary} onPress={backToIndex}>
            <Text style={styles.secondaryText}>⬅ Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", gap: 14 }}>
          <View style={styles.infoRow}>
            <Text style={styles.badge}>Điểm: {engine.ui.score}</Text>
            <Text style={styles.badge}>❤️ {engine.ui.lives}</Text>
            <Text style={styles.badge}>
              Câu: {engine.ui.question}/{total}
            </Text>
          </View>

          <Text style={styles.numbers}>
            {engine.ui.a} ? {engine.ui.b}
          </Text>

          <View style={styles.row}>
            {(["<", "=", ">"] as const).map((op) => {
              const isThisSelected = engine.ui.selectedOp === op;

              const shouldPaint = isThisSelected && engine.ui.feedback !== null;

              const bg =
                shouldPaint && engine.ui.feedback === "correct"
                  ? "#2ecc71"
                  : shouldPaint && engine.ui.feedback === "wrong"
                    ? "#e74c3c"
                    : "#34495e";

              return (
                <TouchableOpacity
                  key={op}
                  style={[styles.choiceBtn, { backgroundColor: bg }]}
                  disabled={engine.ui.locked}
                  onPress={() => engine.submit(op)}
                >
                  <Text style={styles.choiceText}>{op}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 16, fontWeight: "900", marginBottom: 4 },
  primary: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondary: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: { color: "#2c3e50", fontWeight: "900", fontSize: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  badge: {
    flex: 1,
    textAlign: "center",
    backgroundColor: "#f4f6f8",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    fontWeight: "900",
  },
  numbers: { fontSize: 44, fontWeight: "900", textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  choiceBtn: {
    flex: 1,
    backgroundColor: "#34495e",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  choiceText: { color: "#fff", fontSize: 28, fontWeight: "900" },
});
