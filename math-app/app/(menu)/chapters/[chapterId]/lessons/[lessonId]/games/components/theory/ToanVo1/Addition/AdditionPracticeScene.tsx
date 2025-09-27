import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Cập nhật đường dẫn hình ảnh
const images = {
  mango10: require("../../../../../../../../../../../assets/images/ToanVo/images/10mango.png"),
  mango: require("../../../../../../../../../../../assets/images/ToanVo/images/mango.png"),
  background: require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg"),
  star: require("../../../../../../../../../../../assets/images/ToanVo/images/star.png"),
  correct: require("../../../../../../../../../../../assets/images/ToanVo/images/correct.png"),
  wrong: require("../../../../../../../../../../../assets/images/ToanVo/images/wrong.png"),
};

const MAX_QUESTIONS = 5;

export default function AdditionPracticeScene() {
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Tạo biến để lưu thông tin về phép tính hiện tại
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  // Animation
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(1)).current;
  const optionsAnim = useRef(options.map(() => new Animated.Value(1))).current;

  // Tạo phép tính mới
  const generateNewQuestion = () => {
    // Tạo hai số ngẫu nhiên phù hợp (không có phép cộng nhớ)
    const generateFirstDigit = () => Math.floor(Math.random() * 8) + 1; // 1-8
    const generateSecondDigit = () => Math.floor(Math.random() * 9) + 1; // 1-9

    // Tạo số thứ nhất
    const chuc1 = generateFirstDigit();
    const donvi1 = generateSecondDigit();
    const num1 = chuc1 * 10 + donvi1;

    // Tạo số thứ hai đảm bảo không có nhớ
    const maxDonvi2 = 9 - donvi1;
    const donvi2 =
      maxDonvi2 > 0 ? Math.floor(Math.random() * maxDonvi2) + 1 : 0;

    const maxChuc2 = 9 - chuc1;
    const chuc2 = maxChuc2 > 0 ? Math.floor(Math.random() * maxChuc2) + 1 : 0;

    const num2 = chuc2 * 10 + donvi2;

    // Tính kết quả đúng
    const correctAnswer = num1 + num2;

    // Tạo các lựa chọn đáp án
    const generateOptions = (correct: number) => {
      const options = [correct];

      // Thêm 3 đáp án sai ngẫu nhiên, có giá trị gần với đáp án đúng
      while (options.length < 4) {
        // Tạo đáp án sai có thể +/- 10 hoặc đổi chữ số hàng đơn vị/chục
        let wrongAnswer: number = -1;
        const randomType = Math.floor(Math.random() * 4);

        switch (randomType) {
          case 0:
            // Tăng/giảm 10
            wrongAnswer = correct + 10;
            break;
          case 1:
            // Tăng/giảm 10
            wrongAnswer = correct - 10;
            break;
          case 2:
            // Đổi chữ số hàng đơn vị
            const donviCorrect = correct % 10;
            let newDonvi =
              (donviCorrect + Math.floor(Math.random() * 8) + 1) % 10;
            wrongAnswer = correct - donviCorrect + newDonvi;
            break;
          case 3:
            // Đổi chữ số hàng chục
            const chucCorrect = Math.floor(correct / 10);
            let newChuc =
              (chucCorrect + Math.floor(Math.random() * 8) + 1) % 10;
            wrongAnswer = correct - chucCorrect * 10 + newChuc * 10;
            break;
        }

        // Đảm bảo đáp án hợp lệ và không trùng
        if (
          wrongAnswer !== undefined &&
          wrongAnswer > 0 &&
          wrongAnswer < 100 &&
          !options.includes(wrongAnswer)
        ) {
          options.push(wrongAnswer);
        }
      }

      // Xáo trộn các lựa chọn
      return options.sort(() => Math.random() - 0.5);
    };

    setNumber1(num1);
    setNumber2(num2);
    setOptions(generateOptions(correctAnswer));
  };

  // Khởi tạo bài tập đầu tiên
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // Xử lý khi học sinh chọn đáp án
  const handleAnswerSelected = (selectedAnswer: number) => {
    const correctAnswer = number1 + number2;
    const isAnswerCorrect = selectedAnswer === correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    // Hiển thị animation phản hồi
    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();

    // Cập nhật điểm số
    if (isAnswerCorrect) {
      setScore(score + 1);
      setShowConfetti(true);

      // Tắt confetti sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    }

    // Chuyển sang câu hỏi tiếp theo sau 1.5 giây
    setTimeout(() => {
      // Ẩn phản hồi
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowFeedback(false);

        if (currentQuestion < MAX_QUESTIONS - 1) {
          // Animation chuyển câu hỏi
          Animated.sequence([
            Animated.timing(questionAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(questionAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();

          // Tạo câu hỏi mới
          setCurrentQuestion(currentQuestion + 1);
          generateNewQuestion();
        } else {
          // Kết thúc bài tập
          setGameOver(true);
        }
      });
    }, 1500);
  };

  // Hiển thị màn hình kết quả
  if (gameOver) {
    return (
      <ImageBackground
        source={images.background}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả của bạn</Text>
          <Text style={styles.resultScore}>
            {score}/{MAX_QUESTIONS}
          </Text>

          <View style={styles.starsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                source={images.star}
                style={[
                  styles.starImage,
                  index < score ? styles.activeStar : styles.inactiveStar,
                ]}
              />
            ))}
          </View>

          <Text style={styles.resultMessage}>
            {score === MAX_QUESTIONS
              ? "Tuyệt vời! Con đã làm đúng tất cả!"
              : score >= MAX_QUESTIONS / 2
              ? "Làm tốt lắm! Con có thể làm tốt hơn!"
              : "Hãy cố gắng thêm nhé!"}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setCurrentQuestion(0);
                setScore(0);
                setGameOver(false);
                generateNewQuestion();
              }}
            >
              <Text style={styles.buttonText}>Làm lại</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[styles.actionButton, styles.homeButton]}
              onPress={() => navigation.navigate("MathHome")}
            >
              <Text style={styles.buttonText}>Trang chính</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={images.background}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Hiển thị tiến độ */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Câu hỏi {currentQuestion + 1}/{MAX_QUESTIONS}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentQuestion / MAX_QUESTIONS) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreText}>Điểm: {score}</Text>
        </View>

        {/* Phép tính */}
        <Animated.View
          style={[styles.questionContainer, { opacity: questionAnim }]}
        >
          <View style={styles.numberRow}>
            <Text style={styles.questionNumber}>{number1}</Text>
            <Text style={styles.operator}>+</Text>
            <Text style={styles.questionNumber}>{number2}</Text>
            <Text style={styles.operator}>=</Text>
            <Text style={styles.questionMark}>?</Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.table}>
              {/* Hàng tiêu đề */}
              <View style={[styles.row, styles.header]}>
                <View style={styles.cell1}>
                  <Text style={styles.headerText}>SỐ</Text>
                </View>
                <View style={styles.cell2}>
                  <Text style={styles.headerText}>CHỤC</Text>
                </View>
                <View style={styles.cell3}>
                  <Text style={styles.headerText}>ĐƠN VỊ</Text>
                </View>
              </View>

              {/* Số thứ nhất */}
              <View style={styles.row}>
                <View style={styles.cell1}>
                  <Text style={styles.cellText}>{number1}</Text>
                </View>
                <View style={styles.cell2}>
                  <View style={styles.stickContainer}>
                    {Array.from({ length: Math.floor(number1 / 10) }).map(
                      (_, idx) => (
                        <Image
                          key={`10-${idx}`}
                          source={images.mango10}
                          style={styles.stickImage10}
                        />
                      )
                    )}
                  </View>
                </View>
                <View style={styles.cell3}>
                  <View style={styles.stickContainer}>
                    {Array.from({ length: number1 % 10 }).map((_, idx) => (
                      <Image
                        key={`1-${idx}`}
                        source={images.mango}
                        style={styles.stickImage}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Số thứ hai */}
              <View style={styles.row}>
                <View style={styles.cell1}>
                  <Text style={styles.cellText}>{number2}</Text>
                </View>
                <View style={styles.cell2}>
                  <View style={styles.stickContainer}>
                    {Array.from({ length: Math.floor(number2 / 10) }).map(
                      (_, idx) => (
                        <Image
                          key={`10-${idx}`}
                          source={images.mango10}
                          style={styles.stickImage10}
                        />
                      )
                    )}
                  </View>
                </View>
                <View style={styles.cell3}>
                  <View style={styles.stickContainer}>
                    {Array.from({ length: number2 % 10 }).map((_, idx) => (
                      <Image
                        key={`1-${idx}`}
                        source={images.mango}
                        style={styles.stickImage}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Các lựa chọn đáp án */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Chọn đáp án đúng:</Text>
          <View style={styles.optionsGrid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswerSelected(option)}
                disabled={showFeedback}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phản hồi */}
        {showFeedback && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                transform: [
                  {
                    scale: feedbackAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
                opacity: feedbackAnim,
              },
            ]}
          >
            <Image
              source={isCorrect ? images.correct : images.wrong}
              style={styles.feedbackIcon}
            />
            <Text
              style={[
                styles.feedbackText,
                isCorrect ? styles.correctText : styles.wrongText,
              ]}
            >
              {isCorrect ? "Đúng rồi!" : "Sai rồi!"}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>
                Đáp án đúng là: {number1 + number2}
              </Text>
            )}
          </Animated.View>
        )}

        {/* Hiệu ứng confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={50}
            origin={{ x: width / 2, y: 0 }}
            explosionSpeed={350}
            fallSpeed={3000}
            colors={["#FF9800", "#FFC107", "#FFEB3B", "#4CAF50"]}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingVertical: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5D4037",
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D84315",
  },
  questionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FF9800",
    marginHorizontal: 8,
  },
  operator: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4CAF50",
    marginHorizontal: 8,
  },
  questionMark: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#E91E63",
    marginHorizontal: 8,
  },
  tableContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  cell1: {
    width: "20%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
  },
  cell2: {
    width: "35%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
  },
  cell3: {
    width: "45%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFE0B2",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#E65100",
  },
  cellText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D84315",
  },
  stickContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  stickImage10: {
    width: 40,
    height: 40,
    margin: 2,
  },
  stickImage: {
    width: 30,
    height: 30,
    margin: 2,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 10,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: "#FFF8E1",
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: 12,
    padding: 15,
    margin: 8,
    minWidth: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9800",
  },
  feedbackContainer: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: 200,
    marginLeft: -100,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#FFE0B2",
  },
  feedbackIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  correctText: {
    color: "#4CAF50",
  },
  wrongText: {
    color: "#F44336",
  },
  correctAnswerText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 30,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  starImage: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  activeStar: {
    tintColor: "#FFD700",
    opacity: 1,
  },
  inactiveStar: {
    tintColor: "#E0E0E0",
    opacity: 0.7,
  },
  resultMessage: {
    fontSize: 20,
    textAlign: "center",
    color: "#5D4037",
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 130,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  homeButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
