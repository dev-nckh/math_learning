import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn mức số (So sánh)</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4CAF50" }]}
        onPress={() => go("small")}
      >
        <Text style={styles.buttonText}>🔢 0 đến 10</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#2196F3" }]}
        onPress={() => go("large")}
      >
        <Text style={styles.buttonText}>🔟 10 đến 100</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF9800" }]}
        onPress={() => go("mix")}
      >
        <Text style={styles.buttonText}>🎲 Hỗn hợp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFDE7",
  },
  title: {
    fontSize: 26,
    marginBottom: 22,
    fontWeight: "bold",
    color: "#6A1B9A",
    textAlign: "center",
  },
  button: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    width: "100%",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
  backBtn: {
    marginTop: 10,
    padding: 12,
  },
  backText: {
    fontSize: 16,
    color: "#6A1B9A",
    fontWeight: "600",
  },
});
