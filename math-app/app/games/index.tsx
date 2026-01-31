import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GamesIndex() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Games</Text>
      <Text style={styles.text}>
        Route placeholder. Bạn đang không dùng route này.
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
  text: { fontSize: 14, textAlign: "center" },
});
