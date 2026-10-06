import React from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Tutorial from "./Tutorial";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TutorialModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Hướng dẫn</Text>

          <View style={styles.content}>
            <Tutorial />
          </View>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 10 },
  content: { maxHeight: 320 },
  btn: {
    marginTop: 12,
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
