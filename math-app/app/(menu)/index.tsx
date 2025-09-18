import { StyleSheet, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React from "react";
import { router } from "expo-router";

export default function MenuScreen() {
  const navigateToChapter = (chapterNumber: number) => {
    console.log(`🚀 Navigating to Chapter ${chapterNumber}`);
    router.push(`/chapters/${chapterNumber}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Math Learning App</Text>
      <TouchableOpacity
        style={styles.chapterButton}
        onPress={() => navigateToChapter(1)}
      >
        <Text style={styles.buttonText}>Chapter 1: Học đếm số</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.chapterButton}
        onPress={() => navigateToChapter(2)}
      >
        <Text style={styles.buttonText}>Chapter 2: Phép cộng</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.chapterButton}
        onPress={() => navigateToChapter(3)}
      >
        <Text style={styles.buttonText}>
          Chapter 3: Các số trong phạm vi 100. Đo độ dài, giải bài toán{" "}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.chapterButton}
        onPress={() => navigateToChapter(4)}
      >
        <Text style={styles.buttonText}>
          Chapter 4: Phép cộng trừ trong phạm vi 100. Đo thời gian{" "}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f8ff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  chapterButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 18, textAlign: "center" },
});
