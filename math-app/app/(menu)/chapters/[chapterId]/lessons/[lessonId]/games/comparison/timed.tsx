import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import ScreenShell from "./components/ScreenShell";
import TutorialModal from "./components/TutorialModal";
import GameOverModal from "./components/GameOverModal";
import { useComparisonEngine } from "./hooks/useComparisonEngine";

export default function TimedMode() {
  const { chapterId, lessonId, rangeMode } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
    rangeMode?: string;
  }>();

  const [showTut, setShowTut] = useState(false);
  const [timeSec, setTimeSec] = useState<number | null>(null);

  const engine = useComparisonEngine({
    rangeMode,
    hasTimer: true,
    initialTimeSec: timeSec ?? 0,
    hasLives: false,
  });

  const backToIndex = () => {
    router.replace({
      pathname:
        "/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison",
      params: { chapterId, lessonId },
    });
  };

  const startWith = (sec: number) => {
    setTimeSec(sec);
    setTimeout(() => engine.start(), 0);
  };

  const titleText = useMemo(() => {
    if (!timeSec) return "Tính giờ";
    return `Tính giờ (${engine.ui.timeLeft}s)`;
  }, [timeSec, engine.ui.timeLeft]);

  const gameOverTitle =
    engine.ui.endReason === "time" ? "Hết giờ!" : "Kết thúc!";

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

      {!timeSec ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.hint}>Chọn thời gian</Text>

          {[30, 45, 60].map((sec) => (
            <TouchableOpacity
              key={sec}
              style={styles.primary}
              onPress={() => startWith(sec)}
            >
              <Text style={styles.primaryText}>{sec} giây</Text>
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
            <Text style={styles.badge}>⏱ {engine.ui.timeLeft}s</Text>
          </View>

          <Text style={styles.numbers}>
            {engine.ui.a} ? {engine.ui.b}
          </Text>

          <View style={styles.row}>
            {(["<", "=", ">"] as const).map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  styles.choiceBtn,
                  engine.ui.feedback === "correct" && {
                    backgroundColor: "#2ecc71",
                  },
                  engine.ui.feedback === "wrong" && {
                    backgroundColor: "#e74c3c",
                  },
                ]}
                disabled={engine.ui.locked}
                onPress={() => engine.submit(op)}
              >
                <Text style={styles.choiceText}>{op}</Text>
              </TouchableOpacity>
            ))}
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
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  badge: {
    backgroundColor: "#f4f6f8",
    paddingHorizontal: 12,
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
