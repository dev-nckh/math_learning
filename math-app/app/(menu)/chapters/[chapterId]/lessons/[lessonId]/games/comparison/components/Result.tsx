import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Result() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Result component (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  text: { fontSize: 14 },
});
