import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameTypeRoute() {
  const { gameType } = useLocalSearchParams<{ gameType?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Game Type</Text>
      <Text style={styles.text}>gameType: {gameType ?? "N/A"}</Text>
      <Text style={styles.note}>
        Route placeholder (chưa được wiring vào menu).
      </Text>
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
  text: { fontSize: 14 },
  note: { marginTop: 8, fontSize: 12, opacity: 0.7, textAlign: "center" },
});
