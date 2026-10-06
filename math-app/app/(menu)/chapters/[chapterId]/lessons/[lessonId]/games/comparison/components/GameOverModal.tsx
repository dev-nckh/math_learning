import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  title: string; // "Hoàn thành" / "Hết giờ" / "Hết mạng"
  score: number;
  correct: number;
  wrong: number;
  onRetry: () => void;
  onExit: () => void;
};

export default function GameOverModal({
  visible,
  title,
  score,
  correct,
  wrong,
  onRetry,
  onExit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.stats}>
            <Text style={styles.stat}>Điểm: {score}</Text>
            <Text style={styles.sub}>Đúng: {correct}</Text>
            <Text style={styles.sub}>Sai: {wrong}</Text>
          </View>

          <TouchableOpacity style={styles.primary} onPress={onRetry}>
            <Text style={styles.primaryText}>Chơi lại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondary} onPress={onExit}>
            <Text style={styles.secondaryText}>Thoát</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
  },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  stats: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  stat: { fontSize: 18, fontWeight: "900", marginBottom: 6 },
  sub: { fontSize: 15, fontWeight: "700", color: "#333", marginBottom: 4 },
  primary: {
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondary: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryText: { color: "#2c3e50", fontWeight: "900", fontSize: 16 },
});
