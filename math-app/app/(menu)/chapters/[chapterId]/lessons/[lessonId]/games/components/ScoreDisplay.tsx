import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ScoreDisplay() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ScoreDisplay (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  text: { fontSize: 14 },
});
