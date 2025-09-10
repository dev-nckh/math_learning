// MathQuizModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  question: string;
  onSubmit: (correct: boolean) => void;
};

const MathQuizModal = ({ visible, question, onSubmit }: Props) => {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer(""); // reset mỗi khi mở
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.question}>{question}</Text>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            keyboardType="numeric"
            placeholder="Nhập đáp án"
          />
          <Button
            title="Trả lời"
            onPress={() =>
              onSubmit(
                answer.trim() !== "" &&
                  question.includes("=") &&
                  eval(question.split("=")[0]) === Number(answer)
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default MathQuizModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  question: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
});
