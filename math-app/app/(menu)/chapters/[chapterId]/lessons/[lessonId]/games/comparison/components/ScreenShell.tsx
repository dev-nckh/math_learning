import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  title: string;
  onBack?: () => void;
  rightActionText?: string; // ví dụ "?"
  onRightActionPress?: () => void;
  children: React.ReactNode;
};

export default function ScreenShell({
  title,
  onBack,
  rightActionText,
  onRightActionPress,
  children,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          disabled={!onBack}
          style={[styles.headerBtn, !onBack && { opacity: 0 }]}
        >
          <Text style={styles.headerBtnText}>⬅</Text>
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={onRightActionPress}
          disabled={!onRightActionPress}
          style={[styles.headerBtn, !onRightActionPress && { opacity: 0 }]}
        >
          <Text style={styles.headerBtnText}>{rightActionText ?? ""}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { fontSize: 20, fontWeight: "800" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800" },
  body: { flex: 1, padding: 16 },
});
