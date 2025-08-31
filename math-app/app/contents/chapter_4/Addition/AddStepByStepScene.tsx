// CustomTable.tsx
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
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Cập nhật đường dẫn hình ảnh chính xác
const images = {
  mango10: require("../../../../assets/images/10mango.png"),
  mango: require("../../../../assets/images/mango.png"),
  background: require("../../../../assets/images/bg.jpg"),
};

export default function CustomTable() {
  // Thêm hook navigation
  const navigation = useNavigation();

  // State và các hàm tính toán khác giữ nguyên
  const [number1, setNumber1] = useState(35);
  const [number2, setNumber2] = useState(24);

  const chuc1 = Math.floor(number1 / 10);
  const donvi1 = number1 % 10;
  const chuc2 = Math.floor(number2 / 10);
  const donvi2 = number2 % 10;
  const sum = number1 + number2;
  const chucSum = Math.floor(sum / 10);
  const donviSum = sum % 10;

  // Thêm state để quản lý âm thanh
  const [speaking, setSpeaking] = useState(false);

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
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Thêm state để theo dõi bước hiện tại
  const [currentStep, setCurrentStep] = useState(0);

  // Thêm state để điều khiển confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Tạo thêm state cho hiệu ứng
  const [showMovingSticks, setShowMovingSticks] = useState(false);
  const [stickPositions] = useState({
    top: new Animated.Value(0),
    left: new Animated.Value(0),
    opacity: new Animated.Value(0),
  });

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.1, // Cao độ (0.5-2.0)
    rate: 0.75, // Tốc độ chậm để trẻ hiểu rõ (0.1-2.0)
    volume: 1.0, // Âm lượng (0-1.0)
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
          if (callback) callback(); // Gọi callback khi giọng nói hoàn thành
        },
        onError: () => setSpeaking(false),
      });
    } catch (error) {
      console.error("Lỗi phát âm thanh:", error);
      setSpeaking(false);
    }
  };

  // Điều chỉnh kích thước hình ảnh lớn hơn
  const getImageSize = (count: number, isChuc: boolean): number => {
    // Tăng kích thước cơ bản cho cả hai loại hình
    const baseSize = isChuc ? 50 : 45; // Tăng từ 40/35 lên 50/45

    // Điều chỉnh tỷ lệ giảm để không bị tràn ô
    if (count <= 3) return baseSize;
    if (count <= 5) return baseSize * 0.85; // Tăng từ 0.8 lên 0.85
    if (count <= 7) return baseSize * 0.75; // Tăng từ 0.7 lên 0.75
    return baseSize * 0.65; // Tăng từ 0.6 lên 0.65
  };

  // Điều chỉnh margin giữa các hình
  const getImageMargin = (count: number, isChuc: boolean): number => {
    if (isChuc) {
      if (count <= 3) return 4; // Tăng từ 3 lên 4
      if (count <= 5) return 3; // Tăng từ 2 lên 3
      return 2; // Tăng từ 1 lên 2
    } else {
      if (count <= 3) return 3; // Tăng từ 2 lên 3
      if (count <= 5) return 2; // Tăng từ 1.5 lên 2
      return 1.5; // Tăng từ 1 lên 1.5
    }
  };

  // Khởi tạo animated values cho từng hình ảnh
  useEffect(() => {
    // Khởi tạo animated values cho hình ảnh bó 10
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

    // Khởi tạo animated values cho hình ảnh bó 10 của số thứ 2
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

    // Khởi tạo animated values cho hình ảnh đơn vị
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

    // Khởi tạo animated values cho hình ảnh đơn vị của số thứ 2
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
        `Cùng học phép cộng hai số ${number1} và ${number2} theo từng bước!`
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

  // Sửa lại hàm renderImages để thêm animation
  const renderImages = (count: number, isChuc: boolean, rowIndex: number) => {
    const imageSize = getImageSize(count, isChuc);
    const imageMargin = getImageMargin(count, isChuc);
    const imageSource = isChuc ? images.mango10 : images.mango;
    const type = isChuc ? "chuc" : "donvi";
    const prefix = `${type}${rowIndex}_`;

    // Điều chỉnh số lượng hình ảnh trên mỗi hàng phù hợp với kích thước ô
    let imagesPerRow;
    if (isChuc) {
      if (count <= 3) imagesPerRow = 1;
      else imagesPerRow = 2;
    } else {
      if (count <= 3) imagesPerRow = 2;
      else if (count <= 6) imagesPerRow = 3;
      else imagesPerRow = 3;
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

  // Thêm vào hàm generateNewExample
  const generateNewExample = () => {
    // Dừng speech đang phát nếu có
    Speech.stop();
    setSpeaking(false);

    // Hiển thị confetti
    setShowConfetti(true);

    // Sau khi tạo số mới, thiết lập hiệu ứng que di chuyển
    setShowMovingSticks(true);

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

    // Hiệu ứng fade out
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
      // Tạo số ngẫu nhiên từ 10-89
      const generateFirstDigit = () => Math.floor(Math.random() * 8) + 1; // 1-8
      const generateSecondDigit = () => Math.floor(Math.random() * 9) + 1; // 1-9

      // Tạo số thứ nhất
      const chuc1 = generateFirstDigit();
      const donvi1 = generateSecondDigit();
      const num1 = chuc1 * 10 + donvi1;

      // Tạo số thứ hai để đảm bảo không có nhớ trong phép cộng
      // Đảm bảo donvi1 + donvi2 < 10
      const maxDonvi2 = 9 - donvi1;
      const donvi2 =
        maxDonvi2 > 0 ? Math.floor(Math.random() * maxDonvi2) + 1 : 0;

      // Đảm bảo chuc1 + chuc2 < 10
      const maxChuc2 = 9 - chuc1;
      const chuc2 = maxChuc2 > 0 ? Math.floor(Math.random() * maxChuc2) + 1 : 0;

      const num2 = chuc2 * 10 + donvi2;

      // Cập nhật state
      setNumber1(num1);
      setNumber2(num2);

      // Reset bước hiện tại
      setCurrentStep(0);

      // Hiệu ứng fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Đọc giới thiệu ví dụ mới
        setTimeout(() => {
          speak(`Ví dụ mới: Cùng tính ${num1} cộng ${num2}!`);
        }, 500);
      });

      // Reset sau 2 giây
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    });
  };

  // Tự động đọc giải thích theo từng bước
  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => {
        speak(
          `Bước 1: Cộng phần đơn vị. ${donvi1} cộng ${donvi2} bằng ${donviSum}. Viết ${donviSum} vào hàng đơn vị của kết quả.`,
          {},
          () => {
            // Chuyển sang bước tiếp theo sau khi giọng nói hoàn thành
            setCurrentStep(2);
          }
        );
      }, 300); // Delay 300ms trước khi bắt đầu bước 1
    } else if (currentStep === 2) {
      setTimeout(() => {
        speak(
          `Bước 2: Cộng phần chục. ${chuc1} cộng ${chuc2} bằng ${chucSum}. Viết ${chucSum} vào hàng chục của kết quả. Vậy ${number1} cộng ${number2} bằng ${sum}.`,
          {},
          () => {
            // Kết thúc hoặc thực hiện hành động khác sau bước cuối
            console.log("Hoàn thành tất cả các bước!");
          }
        );
      }, 300); // Delay 300ms trước khi bắt đầu bước 2
    }
  }, [currentStep]);

  // Thêm useEffect để tự động chuyển bước
  useEffect(() => {
    if (currentStep < 2) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 11000); // Tăng thời gian chờ lên 11 giây để đồng bộ với thời gian giọng nói
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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
          <Text style={styles.titleText}>Phép cộng theo từng bước</Text>

          {/* Nút phát lại lời giới thiệu */}
          <TouchableOpacity
            style={styles.speakAgainButton}
            onPress={() =>
              speak(
                `Cùng học phép cộng hai số ${number1} và ${number2} theo từng bước!`
              )
            }
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={speaking ? "volume-up" : "volume-up"}
              size={16}
              color={speaking ? "#FF6B95" : "#E65100"}
              style={speaking ? styles.speakingIcon : {}}
            />
          </TouchableOpacity>
        </Animated.View>

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

          {/* Hàng dữ liệu 1 */}
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

          {/* Hàng dữ liệu 2 */}
          <View style={styles.row}>
            <View style={styles.cell1}>
              <View style={styles.numberCell}>
                <Text style={styles.numberText}>{number2}</Text>
              </View>
            </View>
            <View style={styles.cell2}>
              <View style={styles.imageCell}>
                {renderImages(chuc2, true, 2)}
              </View>
            </View>
            <View style={styles.cell3}>
              <View style={styles.imageCell}>
                {renderImages(donvi2, false, 2)}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Phần tính toán */}
        <Animated.View
          style={[styles.countContainer, { opacity: contentOpacity }]}
        >
          <View style={styles.calculationArea}>
            <View style={styles.calculationBlock}>
              <View style={styles.numbersColumn}>
                <Text style={styles.calcNumber}>
                  {"   "}
                  {number1}
                </Text>
                <Text style={styles.calcNumber}>+</Text>
                <Text style={styles.calcNumber}>
                  {"   "}
                  {number2}
                </Text>
                <View style={styles.calcLine} />
                <Text style={styles.calcNumber}>
                  {"   "}
                  {sum}
                </Text>
              </View>
            </View>

            <View style={styles.explanationBlock}>
              <TouchableOpacity
                style={[
                  styles.explanationItem,
                  currentStep >= 1 ? styles.activeExplanation : {}, // Highlight khi currentStep >= 1
                ]}
                onPress={() =>
                  speak(
                    `Bước 1: Cộng phần đơn vị. ${donvi1} cộng ${donvi2} bằng ${donviSum}. Viết ${donviSum} vào hàng đơn vị của kết quả.`
                  )
                }
              >
                <Text style={styles.explanationText}>
                  {donvi1} cộng {donvi2} bằng {donviSum}, viết {donviSum}
                </Text>
                <FontAwesome5
                  name="volume-up"
                  size={14}
                  color="#FF6B95"
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
                    `Bước 2: Cộng phần chục. ${chuc1} cộng ${chuc2} bằng ${chucSum}. Viết ${chucSum} vào hàng chục của kết quả.`
                  )
                }
              >
                <Text style={styles.explanationText}>
                  {chuc1} cộng {chuc2} bằng {chucSum}, viết {chucSum}
                </Text>
                <FontAwesome5
                  name="volume-up"
                  size={14}
                  color="#FF6B95"
                  style={styles.explanationSpeaker}
                />
              </TouchableOpacity>

              {/* Kết luận - chỉ hiển thị khi đã hoàn thành cả hai bước */}
              {currentStep >= 2 && (
                <TouchableOpacity
                  style={[styles.conclusionItem]}
                  onPress={() =>
                    speak(`Vậy ${number1} cộng ${number2} bằng ${sum}.`)
                  }
                >
                  <Text style={styles.conclusionText}>
                    Vậy {number1} + {number2} = {sum}
                  </Text>
                  <FontAwesome5
                    name="volume-up"
                    size={14}
                    color="#FF6B95"
                    style={styles.explanationSpeaker}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Thêm nút điều hướng đến trang thực hành */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.newExampleButton}
            onPress={generateNewExample}
          >
            <Text style={styles.newExampleButtonText}>Ví dụ khác</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => {
              Speech.stop();
              router.push("./AdditionPracticeScene");
            }}
          >
            <Text style={styles.practiceButtonText}>Thực hành</Text>
          </TouchableOpacity>
        </View>

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
    paddingVertical: 20,
    marginTop: -30, // Thay đổi từ -50 thành -30 để có thêm không gian cho tiêu đề
  },
  // Thêm styles cho tiêu đề
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 248, 225, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FF9800",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E65100",
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
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: 8,
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  cell1: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden", // Thêm để ngăn tràn
  },
  cell2: {
    width: "35%", // Giảm từ 40% xuống 35%
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden", // Thêm để ngăn tràn
  },
  cell3: {
    width: "45%", // Tăng từ 40% lên 45%
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden", // Thêm để ngăn tràn
  },
  header: {
    backgroundColor: "#FFE0B2",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E65100",
    textAlign: "center",
    padding: 8,
  },
  numberCell: {
    alignItems: "center",
    justifyContent: "center",
    height: 100, // Cố định chiều cao
    padding: 8,
  },
  numberText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D84315",
    textAlign: "center",
  },
  imageCell: {
    justifyContent: "center",
    alignItems: "center",
    height: 180, // Tăng từ 160px lên 180px để chứa hình lớn hơn
    padding: 4,
    overflow: "hidden",
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
  },
  countContainer: {
    width: "90%",
    paddingTop: 20,
  },
  // Phần style còn lại giữ nguyên
  calculationArea: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 248, 225, 0.95)",
    borderRadius: 12,
    justifyContent: "space-between",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  calculationBlock: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    paddingLeft: 30,
  },
  numbersColumn: {
    alignItems: "flex-start",
  },
  calcNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9800",
    lineHeight: 30,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  calcLine: {
    height: 3,
    backgroundColor: "#FF9800",
    marginVertical: 4,
    width: 60,
  },
  explanationBlock: {
    marginLeft: 40,
    justifyContent: "center",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255, 224, 178, 0.8)",
    paddingLeft: 15,
    flex: 1,
  },
  explanationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    position: "relative",
    paddingRight: 30,
    padding: 5,
  },
  explanationText: {
    fontSize: 16,
    color: "#5D4037",
    fontWeight: "500",
    overflow: "hidden",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
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
  activeExplanation: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderRadius: 8,
    padding: 5,
    transform: [{ scale: 1.05 }],
  },
  newExampleButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
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
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginTop: 20,
    gap: 15,
  },
  practiceButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 20,
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
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
