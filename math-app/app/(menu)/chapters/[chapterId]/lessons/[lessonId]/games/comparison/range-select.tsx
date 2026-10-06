import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import ScreenShell from "./components/ScreenShell";
import type { RangeMode } from "./range";

export default function RangeSelect() {
  const { chapterId, lessonId, target } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
    target: string; // fixed | timed | lives | hybrid | choose-sign
  }>();

  const go = (rangeMode: RangeMode) => {
    router.push({
      pathname:
        `/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison/${target}` as any,
      params: { chapterId, lessonId, rangeMode },
    });
  };

  const backToIndex = () => {
    router.replace({
      pathname:
        "/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison",
      params: { chapterId, lessonId },
    });
  };

  return (
    <ScreenShell title="Chọn phạm vi số" onBack={backToIndex}>
      <Text style={styles.tip}>
        Chọn mức số để game tăng dần phù hợp (mix sẽ tăng độ khó theo tiến
        trình).
      </Text>

      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2ecc71" }]}
          onPress={() => go("small")}
        >
          <Text style={styles.btnText}>0 → 10 (Dễ)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3498db" }]}
          onPress={() => go("mix")}
        >
          <Text style={styles.btnText}>Trộn (Tăng dần)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#9b59b6" }]}
          onPress={() => go("large")}
        >
          <Text style={styles.btnText}>10 → 100 (Khó)</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tip: { marginBottom: 14, color: "#333", fontWeight: "700" },
  button: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
