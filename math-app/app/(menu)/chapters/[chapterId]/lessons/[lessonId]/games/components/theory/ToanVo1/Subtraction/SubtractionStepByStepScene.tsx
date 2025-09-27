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
  Easing,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Sửa tên biến hình ảnh cho đúng với thực tế
const images = {
  mango10: require("../../../../../../../../../../../assets/images/ToanVo/images/10mango.png"),
  mango: require("../../../../../../../../../../../assets/images/ToanVo/images/mango.png"),
  background: require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg"),
};

interface SubtractionStepByStepSceneProps {
  chapterId: string;
  lessonId: string;
  gameId: string;
  gameData: {
    id: number;
    title: string;
    type: string;
    difficulty: string;
    description: string;
  };
}
export default function SubtractionStepByStepScene({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: SubtractionStepByStepSceneProps) {
  // State để lưu hai số trong phép trừ
  const [number1, setNumber1] = useState(75);
  const [number2, setNumber2] = useState(42);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMovingSticks, setShowMovingSticks] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const characterAnim = useRef(new Animated.Value(0)).current;

  // Các animated values cho hiệu ứng lắc lư hình ảnh
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

  // Animated values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const stickPositions = useRef({
    top: new Animated.Value(0),
    left: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Tính toán các giá trị liên quan
  const chuc1 = Math.floor(number1 / 10);
  const donvi1 = number1 % 10;
  const chuc2 = Math.floor(number2 / 10);
  const donvi2 = number2 % 10;
  const result = number1 - number2;
  const chucResult = Math.floor(result / 10);
  const donviResult = result % 10;

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

  // Khởi tạo khi component mount
  useEffect(() => {
    // Khởi tạo animated values cho từng hình ảnh
    // Chục của số bị trừ
    const chuc1AnimValues: Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    > = {};
    for (let i = 0; i < chuc1; i++) {
      chuc1AnimValues[`chuc1_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Chục của số trừ
    const chuc2AnimValues: Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    > = {};
    for (let i = 0; i < chuc2; i++) {
      chuc2AnimValues[`chuc2_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Đơn vị của số bị trừ
    const donvi1AnimValues: Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    > = {};
    for (let i = 0; i < donvi1; i++) {
      donvi1AnimValues[`donvi1_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    // Đơn vị của số trừ
    const donvi2AnimValues: Record<
      string,
      {
        rotate: Animated.Value;
        translateX: Animated.Value;
        scale: Animated.Value;
      }
    > = {};
    for (let i = 0; i < donvi2; i++) {
      donvi2AnimValues[`donvi2_${i}`] = {
        rotate: new Animated.Value(0),
        translateX: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
    }

    setFruitAnimValues({
      ...chuc1AnimValues,
      ...chuc2AnimValues,
      ...donvi1AnimValues,
      ...donvi2AnimValues,
    });

    // Animation cho UI
    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Đọc giới thiệu ban đầu sau khi UI hiển thị
    const timer = setTimeout(() => {
      speak(
        `Cùng học phép trừ hai số ${number1} và ${number2} theo từng bước!`
      );
    }, 1000);

    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [number1, number2]);

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
        }),
        Animated.timing(rotate, {
          toValue: 0.1 * randomFactor,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.05,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua trái
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -3 * randomFactor,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -0.1 * randomFactor,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),

      // Trở về vị trí gốc
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
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

  // Khởi động hiệu ứng lắc lư cho tất cả hình ảnh với độ trễ ngẫu nhiên
  useEffect(() => {
    Object.keys(fruitAnimValues).forEach((key, index) => {
      setTimeout(() => {
        wobbleImage(key);
      }, Math.random() * 2000);
    });
  }, [fruitAnimValues]);

  // Tự động đọc giải thích theo từng bước
  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => {
        speak(
          `Bước 1: Trừ phần đơn vị. ${donvi1} trừ ${donvi2} bằng ${donviResult}. Viết ${donviResult} vào hàng đơn vị của kết quả.`
        );
      }, 300);
    } else if (currentStep === 2) {
      setTimeout(() => {
        speak(
          `Bước 2: Trừ phần chục. ${chuc1} trừ ${chuc2} bằng ${chucResult}. Viết ${chucResult} vào hàng chục của kết quả. Vậy ${number1} trừ ${number2} bằng ${result}.`
        );
      }, 300);
    }
  }, [currentStep]);

  // Tự động chuyển bước - tăng thời gian chờ để đủ thời gian nghe giải thích
  useEffect(() => {
    if (currentStep < 2) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 11000); // Tăng từ 1500ms lên 5000ms
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Tối ưu hiển thị hình ảnh - thu gọn lại như AddStepByStepScene
  const getImageSize = (count: number, isChuc: boolean): number => {
    // Thu nhỏ kích thước hình so với phiên bản trước
    const baseSize = isChuc ? 50 : 45; // Tăng kích thước lên

    if (count <= 3) return baseSize;
    if (count <= 5) return baseSize * 0.85;
    if (count <= 7) return baseSize * 0.75;
    return baseSize * 0.65;
  };

  const getImageMargin = (count: number, isChuc: boolean): number => {
    if (isChuc) {
      if (count <= 3) return 4; // Tăng lên
      if (count <= 5) return 3; // Tăng lên
      return 2; // Tăng lên
    } else {
      if (count <= 3) return 3; // Tăng lên
      if (count <= 5) return 2; // Tăng lên
      return 1.5; // Tăng lên
    }
  };

  // Hàm tạo ví dụ mới - chỉ tạo phép trừ không nhớ
  const generateNewExample = () => {
    // Dừng speech đang phát nếu có
    Speech.stop();
    setSpeaking(false);

    // Hiển thị confetti
    setShowConfetti(true);

    // Thiết lập hiệu ứng que di chuyển
    setShowMovingSticks(true);

    // Tạo hiệu ứng fade-out trước khi thay đổi số
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tạo số đơn vị không cần vay mượn (donvi1 > donvi2)
      const donvi1 = Math.floor(Math.random() * 9) + 1; // 1-9
      const donvi2 = Math.floor(Math.random() * donvi1); // 0 đến donvi1-1

      // Tạo số chục không cần vay mượn (chuc1 > chuc2)
      const chuc1 = Math.floor(Math.random() * 8) + 1; // 1-8
      const chuc2 = Math.floor(Math.random() * chuc1); // 0 đến chuc1-1

      // Tạo số hoàn chỉnh
      const newNumber1 = chuc1 * 10 + donvi1;
      const newNumber2 = chuc2 * 10 + donvi2;

      // Cập nhật state
      setNumber1(newNumber1);
      setNumber2(newNumber2);
      // Reset bước hiện tại
      setCurrentStep(0);

      // Hiệu ứng fade-in với các giá trị mới
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Đọc giới thiệu ví dụ mới
        setTimeout(() => {
          speak(`Ví dụ mới: Cùng tính ${newNumber1} trừ ${newNumber2}!`);
        }, 500);
      });

      // Animation que di chuyển
      Animated.sequence([
        Animated.timing(stickPositions.opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(stickPositions.top, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setShowMovingSticks(false);
          stickPositions.top.setValue(0);
          stickPositions.opacity.setValue(0);
        }, 1000);
      });

      // Tắt confetti sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    });
  };

  // Render hình ảnh trong ô theo dạng lưới - giống như AddStepByStepScene
  const renderImages = (
    count: number,
    isChuc: boolean,
    rowIndex: number,
    isBorrowed: boolean = false,
    isResult: boolean = false
  ) => {
    const imageSize = getImageSize(count, isChuc);
    const imageMargin = getImageMargin(count, isChuc);
    // Sửa nguồn hình ảnh để khớp với biến images đã định nghĩa
    const imageSource = isChuc ? images.mango10 : images.mango;
    const type = isChuc ? "chuc" : "donvi";
    const prefix = `${type}${rowIndex}_`;

    // Tối ưu số lượng hình trên mỗi hàng
    let imagesPerRow;
    if (isChuc) {
      imagesPerRow = count <= 3 ? 1 : 2;
    } else {
      if (count <= 3) imagesPerRow = 2;
      else if (count <= 6) imagesPerRow = 3;
      else imagesPerRow = 4;
    }

    // Tính số hàng cần thiết
    const rows = Math.ceil(count / imagesPerRow);

    // Tạo mảng 2 chiều chứa hình ảnh
    const imageGrid = [];
    for (let r = 0; r < rows; r++) {
      const rowImages = [];
      for (let c = 0; c < imagesPerRow; c++) {
        const index = r * imagesPerRow + c;
        const key = `${prefix}${index}`;
        if (index < count) {
          if (fruitAnimValues[key]) {
            // Sử dụng Animated.Image để tạo hiệu ứng
            rowImages.push(
              <TouchableOpacity
                key={`${key}`}
                onPress={() =>
                  speak(
                    isChuc ? `Đây là 1 rổ 10 quả xoài.` : `Đây là 1 quả xoài.`
                  )
                }
              >
                <Animated.Image
                  source={imageSource}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    margin: imageMargin,
                    opacity: isBorrowed ? 0.6 : 1, // Giữ opacity để vẫn phân biệt được
                    // Bỏ dòng tintColor hoàn toàn
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
            rowImages.push(
              <Image
                key={`img-${index}`}
                source={imageSource}
                style={{
                  width: imageSize,
                  height: imageSize,
                  margin: imageMargin,
                  opacity: isBorrowed ? 0.6 : 1,
                }}
                resizeMode="contain"
              />
            );
          }
        }
      }
      imageGrid.push(
        <View key={`row-${r}`} style={styles.imageRow}>
          {rowImages}
        </View>
      );
    }

    return <View style={styles.imageContainer}>{imageGrid}</View>;
  };
  const handleNext = async () => {
    try {
      // Dừng giọng nói hiện tại trước khi chuyển bước
      await Speech.stop();
      setSpeaking(false);
      console.log("🛑 Speech stopped before next transition");
    } catch (error) {
      console.warn("Error stopping speech in handleNext:", error);
    }

    // Thực hiện các animation chuyển tiếp
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(characterAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Điều hướng sang AddCountScene sau khi animation kết thúc
      router.push(
        `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/components/theory/ToanVo1/Subtraction/SubtractionPracticeScene`
      );
    });
  };
  return (
    <ImageBackground
      source={images.background}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        {/* Tiêu đề */}
        <Animated.View
          style={[styles.titleContainer, { opacity: titleOpacity }]}
        >
          <Text style={styles.titleText}>Phép trừ theo từng bước</Text>

          {/* Nút phát lại lời giới thiệu */}
          <TouchableOpacity
            style={styles.speakAgainButton}
            onPress={() =>
              speak(
                `Cùng học phép trừ hai số ${number1} và ${number2} theo từng bước!`
              )
            }
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={speaking ? "volume-up" : "volume-up"}
              size={16}
              color={speaking ? "#FF6B95" : "#1565C0"}
              style={speaking ? styles.speakingIcon : {}}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Bảng phép trừ */}
        <Animated.View
          style={[
            styles.table,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
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

          {/* Hàng số bị trừ */}
          <View style={styles.row}>
            <View style={styles.cell1}>
              <View style={styles.numberCell}>
                <Text style={styles.numberText}>{number1}</Text>
              </View>
            </View>
            <View style={styles.cell2}>
              <View style={styles.imageCell}>
                {renderImages(chuc1, true, 1)}
              </View>
            </View>
            <View style={styles.cell3}>
              <View style={styles.imageCell}>
                {renderImages(donvi1, false, 1)}
              </View>
            </View>
          </View>

          {/* Hàng số trừ */}
          <View style={styles.row}>
            <View style={styles.cell1}>
              <View style={styles.numberCell}>
                <Text style={[styles.numberText, styles.subtractorNumber]}>
                  {number2}
                </Text>
              </View>
            </View>
            <View style={styles.cell2}>
              <View style={styles.imageCell}>
                {renderImages(chuc2, true, 1)}
              </View>
            </View>
            <View style={styles.cell3}>
              <View style={styles.imageCell}>
                {renderImages(donvi2, false, 1)}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Phần phép tính */}
        <Animated.View
          style={[styles.calculationContainer, { opacity: contentOpacity }]}
        >
          <View style={styles.calculationArea}>
            <View style={styles.calculationBlock}>
              <View style={styles.numbersColumn}>
                <Text style={styles.calcNumber}>
                  {"   "}
                  {number1}
                </Text>
                <Text style={styles.calcNumber}>-</Text>
                <Text style={styles.calcNumber}>
                  {"   "}
                  {number2}
                </Text>
                <View style={styles.calcLine} />
                <Text style={[styles.calcNumber, styles.calcResult]}>
                  {"   "}
                  {result}
                </Text>
              </View>
            </View>

            <View style={styles.explanationBlock}>
              <TouchableOpacity
                style={[
                  styles.explanationItem,
                  currentStep >= 1 ? styles.activeExplanation : {},
                ]}
                onPress={() =>
                  speak(
                    `Bước 1: Trừ phần đơn vị. ${donvi1} trừ ${donvi2} bằng ${donviResult}. Viết ${donviResult} vào hàng đơn vị của kết quả.`
                  )
                }
              >
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.explanationText}>
                  {donvi1} trừ {donvi2} bằng {donviResult}, viết {donviResult}
                </Text>
                <FontAwesome5
                  name="volume-up"
                  size={14}
                  color="#1565C0"
                  style={styles.explanationSpeaker}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.explanationItem,
                  currentStep >= 2 ? styles.activeExplanation : {},
                ]}
                onPress={() =>
                  speak(
                    `Bước 2: Trừ phần chục. ${chuc1} trừ ${chuc2} bằng ${chucResult}. Viết ${chucResult} vào hàng chục của kết quả.`
                  )
                }
              >
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={styles.explanationText}>
                  {chuc1} trừ {chuc2} bằng {chucResult}, viết {chucResult}
                </Text>
                <FontAwesome5
                  name="volume-up"
                  size={14}
                  color="#1565C0"
                  style={styles.explanationSpeaker}
                />
              </TouchableOpacity>

              {/* Kết luận - chỉ hiển thị khi đã hoàn thành cả hai bước */}
              {currentStep >= 2 && (
                <TouchableOpacity
                  style={[styles.conclusionItem]}
                  onPress={() =>
                    speak(`Vậy ${number1} trừ ${number2} bằng ${result}.`)
                  }
                >
                  <Text style={styles.conclusionText}>
                    Vậy {number1} - {number2} = {result}
                  </Text>
                  <FontAwesome5
                    name="volume-up"
                    size={14}
                    color="#1565C0"
                    style={styles.explanationSpeaker}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Các nút điều khiển */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.newExampleButton}
            onPress={generateNewExample}
          >
            <Text style={styles.newExampleButtonText}>Ví dụ khác</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.practiceButton} onPress={handleNext}>
            <Text style={styles.practiceButtonText}>Thực hành</Text>
          </TouchableOpacity>
        </View>

        {/* Hiệu ứng confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={30}
            origin={{ x: width / 2, y: 0 }}
            explosionSpeed={350}
            fallSpeed={3000}
            colors={["#64B5F6", "#2196F3", "#1976D2", "#42A5F5"]}
          />
        )}

        {/* Hiệu ứng que di chuyển */}
        {showMovingSticks && (
          <Animated.View
            style={{
              position: "absolute",
              top: 200,
              left: width / 2 - 50,
              opacity: stickPositions.opacity,
              transform: [{ translateY: stickPositions.top }],
              zIndex: 100,
            }}
          >
            <Image
              source={images.mango}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Animated.View>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: -30, // Để có không gian cho tiêu đề
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(227, 242, 253, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1565C0",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  speakAgainButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  speakingIcon: {
    color: "#FF6B95",
  },
  table: {
    width: "90%",
    borderWidth: 2,
    borderColor: "#2196F3", // Màu xanh dương cho phép trừ
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#BBDEFB",
  },
  header: {
    backgroundColor: "#E3F2FD",
  },
  cell1: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#BBDEFB",
    overflow: "hidden",
  },
  cell2: {
    width: "35%",
    borderRightWidth: 1,
    borderColor: "#BBDEFB",
    overflow: "hidden",
  },
  cell3: {
    width: "45%",
    overflow: "hidden",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1565C0",
    textAlign: "center",
    padding: 6,
  },
  numberCell: {
    alignItems: "center",
    justifyContent: "center",
    height: 100, // Tăng chiều cao ô số
    padding: 6,
    position: "relative",
  },
  numberText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D47A1",
    textAlign: "center",
  },
  subtractorNumber: {
    color: "#D32F2F",
  },
  resultNumber: {
    color: "#388E3C",
  },
  imageCell: {
    justifyContent: "center",
    alignItems: "center",
    height: 180, // Tăng chiều cao ô hình ảnh
    padding: 3,
    overflow: "hidden",
    position: "relative",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1, // Giảm khoảng cách giữa các hàng
  },
  calculationContainer: {
    width: "90%",
    marginTop: 15,
  },
  calculationArea: {
    flexDirection: "row",
    backgroundColor: "rgba(227, 242, 253, 0.95)",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calculationBlock: {
    width: 90,
    alignItems: "center",
  },
  numbersColumn: {
    alignItems: "flex-end",
  },
  calcNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
    lineHeight: 32,
  },
  calcResult: {
    color: "#388E3C",
  },
  calcLine: {
    height: 3,
    backgroundColor: "#2196F3",
    marginVertical: 4,
    width: 70,
  },
  explanationBlock: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(33, 150, 243, 0.3)",
    paddingLeft: 12,
  },
  explanationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
    position: "relative",
    paddingRight: 30,
  },
  activeExplanation: {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    transform: [{ scale: 1.05 }],
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  explanationText: {
    fontSize: 15,
    color: "#37474F",
    flex: 1,
  },
  explanationSpeaker: {
    position: "absolute",
    right: 5,
  },
  conclusionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderRadius: 8,
    padding: 8,
    position: "relative",
    paddingRight: 30,
  },
  conclusionText: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
    overflow: "hidden",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    flex: 1,
  },
  // Nút điều khiển
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginTop: 15,
    gap: 15,
  },
  newExampleButton: {
    backgroundColor: "#9C27B0", // Tím cho nút ví dụ khác
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  newExampleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  practiceButton: {
    backgroundColor: "#4CAF50", // Xanh lá cho nút thực hành
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  practiceButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
