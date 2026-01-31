import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChapterProgressScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tiến độ chương</Text>
      <Text style={styles.text}>ChapterId: {chapterId ?? "N/A"}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 16 },
});
