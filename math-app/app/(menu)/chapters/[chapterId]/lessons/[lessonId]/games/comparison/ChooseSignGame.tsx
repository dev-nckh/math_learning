import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Tutorial from "./components/Tutorial";
import { generateComparisonPair, normalizeRangeMode } from "./range";

export default function ChooseSignGame() {
  const { rangeMode } = useLocalSearchParams<{ rangeMode?: string }>();
  const selectedRange = normalizeRangeMode(rangeMode);

  const [step, setStep] = useState<"tutorial" | "select" | "game" | "result">(
    "tutorial"
  );
  const [numbers, setNumbers] = useState({ a: 0, b: 0 });
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  const generateNumbers = () => generateComparisonPair(selectedRange);

  // Bắt đầu game
  const startGame = (count: number | null) => {
    setTotalQuestions(count);
    setNumbers(generateNumbers());
    setScore(0);
    setQuestion(1);
    setStep("game");
  };

  const checkAnswer = (choice: "<" | ">" | "=") => {
    let correct: "<" | ">" | "=" = "=";
    if (numbers.a < numbers.b) correct = "<";
    else if (numbers.a > numbers.b) correct = ">";

    if (choice === correct) setScore((prev) => prev + 1);

    if (totalQuestions && question < totalQuestions) {
      setQuestion((prev) => prev + 1);
      setNumbers(generateNumbers());
    } else {
      setStep("result");
    }
  };

  const exitGame = () => {
    router.back();
  };

  // Tutorial
  if (step === "tutorial") {
    return (
      <View style={styles.container}>
        <Tutorial />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setStep("select")}
        >
          <Text style={styles.text}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Chọn số câu
  if (step === "select") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chọn số câu</Text>

        {[10, 15, 20].map((n) => (
          <TouchableOpacity
            key={n}
            style={styles.button}
            onPress={() => startGame(n)}
          >
            <Text style={styles.text}>{n} câu</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.button} onPress={() => startGame(10)}>
          <Text style={styles.text}>Chơi ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={exitGame}>
          <Text style={styles.backText}>⬅ Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Game
  if (step === "game") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Câu {question}/{totalQuestions}
        </Text>

        <Text style={styles.numbers}>
          {numbers.a} ? {numbers.b}
        </Text>

        <View style={styles.row}>
          {(["<", "=", ">"] as const).map((op) => (
            <TouchableOpacity
              key={op}
              style={styles.choiceBtn}
              onPress={() => checkAnswer(op)}
            >
              <Text style={styles.choiceText}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Result
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả</Text>
      <Text style={styles.score}>Điểm: {score}</Text>

      <TouchableOpacity style={styles.button} onPress={() => setStep("select")}>
        <Text style={styles.text}>Chơi lại</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={exitGame}>
        <Text style={styles.text}>Thoát</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  numbers: { fontSize: 48, marginVertical: 25, fontWeight: "bold" },
  row: { flexDirection: "row" },
  choiceBtn: {
    backgroundColor: "#e67e22",
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  choiceText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  score: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  backBtn: { marginTop: 10 },
  backText: { fontSize: 16, fontWeight: "bold" },
});
