import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

function asString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function ComparisonIndex() {
  const params = useLocalSearchParams<{
    chapterId?: string | string[];
    lessonId?: string | string[];
  }>();

  const chapterId = asString(params.chapterId);
  const lessonId = asString(params.lessonId);

  const goToMode = (modeId: string) => {
    if (!chapterId || !lessonId) return;

    router.push({
      pathname:
        "/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/comparison/range-select",
      params: { target: modeId, chapterId, lessonId },
    });
  };

  const modes = [
    { id: "fixed", title: "🎯 10 câu cố định" },
    { id: "timed", title: "⏱ Tính giờ" },
    { id: "lives", title: "❤️ 3 mạng" },
    { id: "hybrid", title: "⚡ Kết hợp" },
    { id: "choose-sign", title: "🔢 Chọn dấu đúng" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn chế độ chơi</Text>

      {!chapterId || !lessonId ? (
        <Text style={{ marginTop: 10, color: "red" }}>
          Thiếu chapterId/lessonId trong route!
        </Text>
      ) : (
        modes.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={styles.button}
            onPress={() => goToMode(m.id)}
          >
            <Text style={styles.text}>{m.title}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
