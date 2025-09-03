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
  ScrollView,
  Easing,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { router } from "expo-router";
import * as Speech from "expo-speech";

const { width } = Dimensions.get("window");

// Cập nhật đường dẫn hình ảnh
const images = {
  mango10: require("../../../../assets/images/10mango.png"),
  mango: require("../../../../assets/images/mango.png"),
  background: require("../../../../assets/images/bg.jpg"),
  star: require("../../../../assets/images/star.png"),
  correct: require("../../../../assets/images/correct.png"),
  wrong: require("../../../../assets/images/wrong.png"),
  fish: require("../../../../assets/images/mango.png"),
  bubble: require("../../../../assets/images/mango.png"),
};

const MAX_QUESTIONS = 5;

export default function SubtractionPracticeScene() {
  // State để lưu thông tin bài thực hành
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Thông tin phép tính
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  // Animation
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(1)).current;
  const bubblePosition = useRef(new Animated.Value(-100)).current;

  // Thêm state để quản lý các animated values cho hiệu ứng lắc lư hình ảnh
  const [fruitAnimValues, setFruitAnimValues] = useState<
    Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    >
  >({});

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.1,
    rate: 0.75,
    volume: 1.0,
  };

  // Hàm đọc văn bản
  const speak = async (
    text: string,
    options = {},
    callback: (() => void) | null = null
  ) => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);

    try {
      await Speech.speak(text, {
        ...speechOptions,
        ...options,
        onDone: () => {
          setSpeaking(false);
          if (callback) callback();
        },
        onError: () => setSpeaking(false),
      });
    } catch (error) {
      console.error("Lỗi phát âm thanh:", error);
      setSpeaking(false);
    }
  };

  // Tạo phép tính trừ mới (chỉ phép trừ KHÔNG nhớ)
  const generateNewQuestion = () => {
    // Tạo đơn vị không cần vay mượn (donvi1 > donvi2)
    const donvi1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const donvi2 = Math.floor(Math.random() * donvi1); // 0 đến donvi1-1

    // Tạo số chục (chuc1 > chuc2)
    const chuc1 = Math.floor(Math.random() * 8) + 1; // 1-8
    const chuc2 = Math.floor(Math.random() * chuc1); // 0 đến chuc1-1

    // Tạo số hoàn chỉnh
    const minuend = chuc1 * 10 + donvi1; // Số bị trừ (số lớn hơn)
    const subtrahend = chuc2 * 10 + donvi2; // Số trừ (số nhỏ hơn)

    // Tính kết quả đúng
    const correctAnswer = minuend - subtrahend;

    // Tạo các lựa chọn đáp án
    const generateOptions = (correct: number) => {
      const options = [correct];

      // Thêm 3 đáp án sai ngẫu nhiên, có giá trị gần với đáp án đúng
      while (options.length < 4) {
        // Tạo đáp án sai có thể +/- 10 hoặc đổi chữ số hàng đơn vị/chục
        let wrongAnswer;
        const randomType = Math.floor(Math.random() * 4);

        switch (randomType) {
          case 0:
            // Tăng 10
            wrongAnswer = correct + 10;
            break;
          case 1:
            // Giảm 10 (nếu có thể)
            wrongAnswer = correct > 10 ? correct - 10 : correct + 5;
            break;
          case 2:
            // Đổi chữ số hàng đơn vị
            const donviCorrect = correct % 10;
            let newDonvi =
              (donviCorrect + Math.floor(Math.random() * 8) + 1) % 10;
            wrongAnswer = correct - donviCorrect + newDonvi;
            break;
          default:
            // Đổi chữ số hàng chục
            const chucCorrect = Math.floor(correct / 10);
            let newChuc =
              (chucCorrect + Math.floor(Math.random() * 8) + 1) % 10;
            wrongAnswer = correct - chucCorrect * 10 + newChuc * 10;
        }

        // Đảm bảo đáp án hợp lệ và không trùng
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }

      // Xáo trộn các lựa chọn
      return options.sort(() => Math.random() - 0.5);
    };

    setNumber1(minuend);
    setNumber2(subtrahend);
    setOptions(generateOptions(correctAnswer));

    // Khởi tạo các animated values cho hình ảnh mới
    initFruitAnimValues(minuend, subtrahend);
  };

  // Khởi tạo animated values cho hiệu ứng lắc lư
  const initFruitAnimValues = (minuend: number, subtrahend: number) => {
    const chuc1 = Math.floor(minuend / 10);
    const donvi1 = minuend % 10;
    const chuc2 = Math.floor(subtrahend / 10);
    const donvi2 = subtrahend % 10;

    const newAnimValues: Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    > = {};

    // Animated values cho số bị trừ (chục)
    for (let i = 0; i < chuc1; i++) {
      newAnimValues[`chuc1_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Animated values cho số bị trừ (đơn vị)
    for (let i = 0; i < donvi1; i++) {
      newAnimValues[`donvi1_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Animated values cho số trừ (chục)
    for (let i = 0; i < chuc2; i++) {
      newAnimValues[`chuc2_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Animated values cho số trừ (đơn vị)
    for (let i = 0; i < donvi2; i++) {
      newAnimValues[`donvi2_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    setFruitAnimValues(newAnimValues);
  };

  // Hàm tạo hiệu ứng lắc lư cho một hình ảnh
  const wobbleImage = (key: string) => {
    if (!fruitAnimValues[key]) return;

    const { rotate, translateX, scale } = fruitAnimValues[key];

    // Tạo random factor để mỗi hình có animation khác nhau
    const randomFactor = Math.random() * 0.3 + 0.85;
    const duration = 800 + Math.random() * 200;

    Animated.sequence([
      // Lắc qua phải
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 3 * randomFactor,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotate, {
          toValue: 0.1 * randomFactor,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scale, {
          toValue: 1.05,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),

      // Lắc qua trái
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -3 * randomFactor,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotate, {
          toValue: -0.1 * randomFactor,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),

      // Trở về vị trí gốc
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ]).start(() => {
      // Đợi một chút rồi tiếp tục lắc (nếu đang ở màn hình này)
      setTimeout(() => {
        if (fruitAnimValues[key]) {
          wobbleImage(key);
        }
      }, Math.random() * 2000 + 1000);
    });
  };

  // Animation nổi bọt
  useEffect(() => {
    const animateBubble = () => {
      bubblePosition.setValue(-50);
      Animated.timing(bubblePosition, {
        toValue: -400,
        duration: 5000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(animateBubble, Math.random() * 2000);
      });
    };

    animateBubble();
  }, []);

  // Khởi tạo bài tập đầu tiên
  useEffect(() => {
    generateNewQuestion();

    // Dọn dẹp khi unmount
    return () => {
      Speech.stop();
    };
  }, []);

  // Khởi động hiệu ứng lắc lư cho tất cả hình ảnh với độ trễ ngẫu nhiên
  useEffect(() => {
    // Thêm độ trễ trước khi bắt đầu animation để tránh ảnh hưởng đến performance khi load
    const timer = setTimeout(() => {
      Object.keys(fruitAnimValues).forEach((key, index) => {
        setTimeout(() => {
          wobbleImage(key);
        }, Math.random() * 2000);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [fruitAnimValues]);

  // Xử lý khi học sinh chọn đáp án
  const handleAnswerSelected = (selectedAnswer: number) => {
    const correctAnswer = number1 - number2;
    const isAnswerCorrect = selectedAnswer === correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    // Hiển thị animation phản hồi
    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();

    // Phát âm thanh phản hồi
    if (isAnswerCorrect) {
      speak("Đúng rồi! Giỏi quá!");
      setScore(score + 1);
      setShowConfetti(true);

      // Tắt confetti sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    } else {
      speak(`Sai rồi! Đáp án đúng là ${correctAnswer}.`);
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
          // Thông báo kết quả
          const finalScore = isAnswerCorrect ? score + 1 : score;
          setTimeout(() => {
            if (finalScore === MAX_QUESTIONS) {
              speak("Tuyệt vời! Con đã làm đúng tất cả!");
            } else if (finalScore >= MAX_QUESTIONS / 2) {
              speak("Làm tốt lắm! Con có thể làm tốt hơn!");
            } else {
              speak("Hãy cố gắng thêm nhé!");
            }
          }, 500);
        }
      });
    }, 1500);
  };

  // Hàm render hình ảnh có hiệu ứng lắc lư
  const renderAnimatedImages = (
    count: number,
    isChuc: boolean,
    rowIndex: number,
    isSubtractor: boolean = false
  ) => {
    const imageSize = isChuc ? 40 : 30;
    const margin = 2;
    const imageSource = isChuc ? images.mango10 : images.mango;
    const type = isChuc ? "chuc" : "donvi";
    const prefix = `${type}${rowIndex}_`;

    return Array.from({ length: count }).map((_, idx) => {
      const key = `${prefix}${idx}`;

      if (fruitAnimValues[key]) {
        // Sử dụng Animated.Image nếu có animated values
        return (
          <TouchableOpacity
            key={key}
            onPress={() => speak(isChuc ? "1 rổ 10 quả xoài" : "1 quả xoài")}
          >
            <Animated.Image
              source={imageSource}
              style={{
                width: imageSize,
                height: imageSize,
                margin: margin,
                opacity: isSubtractor ? 0.6 : 1,
                transform: [
                  { translateX: fruitAnimValues[key].translateX },
                  {
                    rotate: fruitAnimValues[key].rotate.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: ["-0.3rad", "0rad", "0.3rad"],
                    }),
                  },
                  { scale: fruitAnimValues[key].scale },
                ],
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      } else {
        // Fallback nếu không có animated values
        return (
          <Image
            key={`static-${key}`}
            source={imageSource}
            style={{
              width: imageSize,
              height: imageSize,
              margin: margin,
              opacity: isSubtractor ? 0.6 : 1,
            }}
            resizeMode="contain"
          />
        );
      }
    });
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
          </View>
        </View>

        {/* Hình ảnh trang trí dưới nước */}
        <Image
          source={images.fish}
          style={[styles.fishImage, { bottom: 30, right: 20 }]}
        />
        <Image
          source={images.fish}
          style={[
            styles.fishImage,
            { bottom: 120, left: 30, transform: [{ scaleX: -1 }] },
          ]}
        />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={images.background}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Hiển thị tiến độ */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Câu {currentQuestion + 1}/{MAX_QUESTIONS}
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
              <Text style={styles.operator}>-</Text>
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

                {/* Số bị trừ */}
                <View style={styles.row}>
                  <View style={styles.cell1}>
                    <Text style={styles.cellText}>{number1}</Text>
                  </View>
                  <View style={styles.cell2}>
                    <View style={styles.stickContainer}>
                      {renderAnimatedImages(Math.floor(number1 / 10), true, 1)}
                    </View>
                  </View>
                  <View style={styles.cell3}>
                    <View style={styles.stickContainer}>
                      {renderAnimatedImages(number1 % 10, false, 1)}
                    </View>
                  </View>
                </View>

                {/* Số trừ */}
                <View style={styles.row}>
                  <View style={styles.cell1}>
                    <Text style={[styles.cellText, styles.subtractorText]}>
                      {number2}
                    </Text>
                  </View>
                  <View style={styles.cell2}>
                    <View style={styles.stickContainer}>
                      {renderAnimatedImages(Math.floor(number2 / 10), true, 2)}
                    </View>
                  </View>
                  <View style={styles.cell3}>
                    <View style={styles.stickContainer}>
                      {renderAnimatedImages(number2 % 10, false, 2)}
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
                  Đáp án đúng là: {number1 - number2}
                </Text>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Hiệu ứng confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: width / 2, y: 0 }}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={["#64B5F6", "#2196F3", "#1976D2", "#42A5F5"]}
        />
      )}

      {/* Hiệu ứng bọt nước */}
      <Animated.Image
        source={images.bubble}
        style={[
          styles.bubbleImage,
          {
            transform: [{ translateY: bubblePosition }],
            left: width * 0.2,
          },
        ]}
      />

      <Animated.Image
        source={images.bubble}
        style={[
          styles.bubbleImage,
          {
            transform: [
              {
                translateY: bubblePosition.interpolate({
                  inputRange: [-400, -50],
                  outputRange: [-200, -100],
                }),
              },
            ],
            left: width * 0.7,
          },
        ]}
      />

      {/* Hình ảnh trang trí */}
      <Image
        source={images.fish}
        style={[styles.fishImage, { bottom: 10, right: 20 }]}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
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
    backgroundColor: "#64B5F6",
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
    color: "#1565C0",
    marginHorizontal: 8,
  },
  operator: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#D32F2F",
    marginHorizontal: 8,
  },
  questionMark: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
    marginHorizontal: 8,
  },
  tableContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#2196F3",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#BBDEFB",
  },
  cell1: {
    width: "20%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#BBDEFB",
    position: "relative",
  },
  cell2: {
    width: "35%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#BBDEFB",
  },
  cell3: {
    width: "45%",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#E3F2FD",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1565C0",
  },
  cellText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1565C0",
  },
  subtractorText: {
    color: "#D32F2F",
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
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 2,
    borderColor: "#2196F3",
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
    color: "#1565C0",
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
    borderColor: "#E3F2FD",
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
    color: "#1565C0",
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2196F3",
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
    color: "#37474F",
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "#2196F3",
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  bubbleImage: {
    width: 30,
    height: 30,
    position: "absolute",
    opacity: 0.7,
  },
  fishImage: {
    width: 80,
    height: 40,
    position: "absolute",
    opacity: 0.8,
  },
});
