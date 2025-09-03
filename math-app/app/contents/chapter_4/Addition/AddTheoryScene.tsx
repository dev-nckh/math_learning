import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Speech from "expo-speech";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width } = Dimensions.get("window");

const QUE_10 = require("../../../../assets/images/10sticks.png");
const QUE_1 = require("../../../../assets/images/1stick.png");
const backgroundImg = require("../../../../assets/images/bg.jpg");
// Thêm hình ảnh chú cú
const OWL_TEACHER_IMAGE = require("../../../../assets/images/owl.png");

type TheoryItem = {
  chuc: number;
  donvi: number;
  vietSo: number;
  docSo: string;
};

const numberToText = (n: number): string => {
  // Định nghĩa từ điển các số
  const options: Record<number, string> = {
    0: "Không",
    1: "Một",
    2: "Hai",
    3: "Ba",
    4: "Bốn",
    5: "Năm",
    6: "Sáu",
    7: "Bảy",
    8: "Tám",
    9: "Chín",
    10: "Mười",
    11: "Mười một",
    12: "Mười hai",
    13: "Mười ba",
    14: "Mười bốn",
    15: "Mười lăm",
    16: "Mười sáu",
    17: "Mười bảy",
    18: "Mười tám",
    19: "Mười chín",
    20: "Hai mươi",
    30: "Ba mươi",
    40: "Bốn mươi",
    50: "Năm mươi",
    60: "Sáu mươi",
    70: "Bảy mươi",
    80: "Tám mươi",
    90: "Chín mươi",
  };

  // Nếu số đã có trong từ điển, trả về luôn
  if (options[n] !== undefined) return options[n];

  // Xử lý cho các số hai chữ số khác
  const chuc = Math.floor(n / 10) * 10;
  const donvi = n % 10;

  // Xử lý đặc biệt cho số 1 và 5 ở vị trí đơn vị
  let donviText;
  if (donvi === 1) {
    donviText = "mốt";
  } else if (donvi === 5) {
    donviText = "lăm";
  } else {
    // Sử dụng chữ đọc từ options thay vì số
    donviText = options[donvi].toLowerCase();
  }

  return `${options[chuc]} ${donviText}`.trim();
};

// Tạo một item từ số cụ thể
const createNumberItem = (num: number): TheoryItem => {
  return {
    chuc: Math.floor(num / 10),
    donvi: num % 10,
    vietSo: num,
    docSo: numberToText(num),
  };
};

// Danh sách số cố định theo yêu cầu
const FIXED_NUMBERS = [
  12, 15, 21, 26, 33, 36, 41, 40, 56, 52, 64, 67, 71, 76, 82, 88, 91, 99,
];

const AddTheoryScene = () => {
  // Ban đầu chỉ hiển thị 3 số đầu tiên
  const [visibleCount, setVisibleCount] = useState(3);
  const [screenKey, setScreenKey] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  // Animated values cho UI elements
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const loadMoreScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const characterAnim = useRef(new Animated.Value(0)).current;

  // Thêm animation refs cho hiệu ứng lắc lư chú cú
  const owlSwayX = useRef(new Animated.Value(0)).current;
  const owlRotate = useRef(new Animated.Value(0)).current;
  const owlBounceY = useRef(new Animated.Value(0)).current;
  const owlScaleX = useRef(new Animated.Value(1)).current;
  const owlScaleY = useRef(new Animated.Value(1)).current;

  // Tạo danh sách items từ các số cố định
  const allItems = FIXED_NUMBERS.map((num) => createNumberItem(num));

  // Chỉ hiển thị một phần của danh sách
  const data = allItems.slice(0, visibleCount);

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.1, // Cao độ (0.5-2.0)
    rate: 0.75, // Tốc độ chậm để trẻ hiểu rõ (0.1-2.0)
    volume: 1.0, // Âm lượng (0-1.0)
  };

  // Hàm đọc văn bản
  const speak = async (text: string, options = {}) => {
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
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });

      // Hiệu ứng lắc lư nâng cao khi đang nói
      if (speaking) {
        // Tạo animation lắc lư tự nhiên, nhanh hơn khi nói
        Animated.loop(
          Animated.sequence([
            // Lắc qua phải + nhún xuống nhẹ khi nói
            Animated.parallel([
              Animated.timing(owlSwayX, {
                toValue: 4,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlRotate, {
                toValue: 0.05,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlBounceY, {
                toValue: 2,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlScaleY, {
                toValue: 0.97,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlScaleX, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),

            // Lắc qua trái + nhún lên
            Animated.parallel([
              Animated.timing(owlSwayX, {
                toValue: -4,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlRotate, {
                toValue: -0.05,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlBounceY, {
                toValue: -2,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlScaleY, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(owlScaleX, {
                toValue: 0.97,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
          ]),
          { iterations: 10 }
        ).start();
      }
    } catch (error) {
      console.error("Lỗi phát âm thanh:", error);
      setSpeaking(false);
    }
  };

  // Tạo hiệu ứng lắc lư tự nhiên cho chú cú
  const startOwlWobble = () => {
    // Tạo random factor để mỗi lần animation khác nhau một chút
    const randomFactor = Math.random() * 0.3 + 0.85;

    // Animation phức hợp để chú cú lắc lư tự nhiên hơn
    const createWobbleAnimation = () => {
      // Reset giá trị
      owlBounceY.setValue(0);

      // Tạo chuỗi animation ngẫu nhiên
      const animations = [
        // Lắc qua phải + nghiêng + co giãn nhẹ
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: 3 * randomFactor,
            duration: 1000 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0.03 * randomFactor,
            duration: 1000 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1.02,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: -2 * randomFactor,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Lắc qua trái + nghiêng ngược lại + co giãn nhẹ khác
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: -3 * randomFactor,
            duration: 1000 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: -0.03 * randomFactor,
            duration: 1000 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 0.98,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 2 * randomFactor,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Trở về vị trí gốc với nhẹ nhàng
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ];

      // Kết hợp các animation và lặp lại ngẫu nhiên
      Animated.sequence(animations).start(() => {
        // Đợi một chút trước khi bắt đầu lại
        setTimeout(() => {
          createWobbleAnimation();
        }, Math.random() * 500 + 200);
      });
    };

    // Bắt đầu animation
    createWobbleAnimation();
  };

  // Hàm tạo hiệu ứng lắc mạnh khi nhấn vào chú cú
  const shakeOwl = (message: string) => {
    // Reset về vị trí gốc trước khi tạo hiệu ứng mới
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);

    // Tạo hiệu ứng lắc mạnh
    Animated.sequence([
      // Co lại nhẹ
      Animated.parallel([
        Animated.timing(owlScaleX, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlScaleY, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlBounceY, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua phải mạnh
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: 0.08,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlScaleX, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlScaleY, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua trái mạnh
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: -0.08,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua phải vừa
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: 8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: 0.06,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua trái vừa
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: -8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: -0.06,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),

      // Trở về vị trí ban đầu
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlScaleX, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlScaleY, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlBounceY, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Sau khi lắc xong, bắt đầu đọc
      setTimeout(() => {
        speak(message);
      }, 500);
    });
  };

  // Start animations when component mounts
  useEffect(() => {
    let mounted = true;

    // Hiển thị UI
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
      Animated.timing(characterAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Bắt đầu hiệu ứng lắc lư cho chú cú
    startOwlWobble();

    // Đọc phần giới thiệu sau khi UI hiển thị
    setTimeout(() => {
      speak(
        "Mỗi số có hai phần là chục và đơn vị. Dưới đây là các ví dụ về cách viết và đọc số."
      );

      // Đọc giải thích về ví dụ đầu tiên sau 2 giây
      setTimeout(() => {
        speak(
          "Ta có Ví dụ đầu tiên đây là hình ảnh 1 bó que và 2 que riêng, vậy ta có 1 bó que tương đương với hàng chục là 1 và 2 que riêng tương đương với hàng đơn vị là 2, viết số là 12 và đọc số là mười hai"
        );
      }, 5000); // Chờ 5 giây để đủ thời gian đọc câu đầu
    }, 1000);

    return () => {
      mounted = false;
      // Dừng âm thanh khi unmount component
      Speech.stop();
    };
  }, [screenKey]);

  // Xử lý khi nhấn nút hiện thêm - chỉ hiển thị thêm 1 số mới mỗi lần nhấn
  const handleTap = () => {
    // Animate button
    Animated.sequence([
      Animated.timing(loadMoreScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(loadMoreScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(loadMoreScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Hiển thị animation khi thay đổi layout
    LayoutAnimation.configureNext({
      duration: 500,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
    });

    // Tăng số lượng hiển thị lên 1, tối đa là số lượng trong danh sách
    setVisibleCount((prev) => Math.min(prev + 1, FIXED_NUMBERS.length));

    // Đọc số tiếp theo
    const nextIndex = visibleCount;
    if (nextIndex < FIXED_NUMBERS.length) {
      const nextNumber = FIXED_NUMBERS[nextIndex];
      const chuc = Math.floor(nextNumber / 10);
      const donvi = nextNumber % 10;
      const message = `Ví dụ tiếp theo: ${chuc} bó que và ${donvi} que riêng, tương đương với số ${nextNumber}, đọc là ${numberToText(
        nextNumber
      )}`;
      speak(message);
    }
  };

  // Xử lý nút tải lại
  const handleReload = () => {
    // Dừng âm thanh hiện tại
    Speech.stop();
    setSpeaking(false);

    // Reset các animation values
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);

    // Fade out
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      setScreenKey((prev) => prev + 1);
      // Reset về hiển thị 3 số đầu tiên
      setVisibleCount(3);

      // Fade in
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  // Hiệu ứng nhấn nút
  const animateButton = (buttonAnim: Animated.Value | Animated.ValueXY) => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Lấy giải thích về một số cụ thể
  const getExplanationFor = (item: TheoryItem) => {
    return `Đây là hình ảnh ${item.chuc} bó que và ${item.donvi} que riêng, vậy ta có ${item.chuc} bó que tương đương với hàng chục là ${item.chuc} và ${item.donvi} que riêng tương đương với hàng đơn vị là ${item.donvi}, viết số là ${item.vietSo} và đọc số là ${item.docSo}`;
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View key={screenKey} style={styles.container}>
          {/* Tiêu đề */}
          <Animated.View
            style={[styles.titleContainer, { opacity: titleOpacity }]}
          >
            <LinearGradient
              colors={["#FF9A8B", "#FF6B95"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.titleText}>
                Lý thuyết: Cách đọc và viết số
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Nhân vật chú cú */}
          <Animated.View
            style={[
              styles.characterContainer,
              {
                opacity: characterAnim,
                transform: [
                  { scale: characterAnim },
                  {
                    translateY: characterAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Bong bóng thoại */}
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechPointer} />
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.speechBubble}
              >
                <Text style={styles.characterName}>Bạn Cú</Text>
                <Text style={styles.speech}>
                  Mỗi số có hai phần là chục và đơn vị. Dưới đây là các ví dụ về
                  cách viết và đọc số.
                </Text>

                {/* Nút phát lại lời thoại */}
                <TouchableOpacity
                  style={styles.speakAgainButton}
                  onPress={() => {
                    // Phát lại giải thích cho số đầu tiên
                    if (data.length > 0) {
                      speak(getExplanationFor(data[0]));
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name={speaking ? "volume-up" : "volume-up"}
                    size={16}
                    color={speaking ? "#FF6B95" : "#666"}
                    style={speaking ? styles.speakingIcon : {}}
                  />
                </TouchableOpacity>
              </Shadow>
            </View>

            {/* Nhân vật với hiệu ứng lắc lư */}
            <TouchableOpacity
              onPress={() =>
                shakeOwl(
                  "Mỗi số có hai phần là chục và đơn vị. Dưới đây là các ví dụ về cách viết và đọc số."
                )
              }
              activeOpacity={0.8}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateX: owlSwayX },
                    { translateY: owlBounceY },
                    {
                      rotate: owlRotate.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ["-1rad", "0rad", "1rad"],
                      }),
                    },
                    { scaleX: owlScaleX },
                    { scaleY: owlScaleY },
                  ],
                }}
              >
                <Image
                  source={OWL_TEACHER_IMAGE}
                  style={styles.characterImage}
                />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* Main Content */}
          <Animated.View
            style={[styles.contentWrapper, { opacity: contentOpacity }]}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Bảng hiển thị số */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <View style={styles.tableContainer}>
                  {/* Header */}
                  <LinearGradient
                    colors={["#FFE0B2", "#FFCC80"]}
                    style={[styles.headerRow]}
                  >
                    <Text
                      style={[
                        styles.cell,
                        styles.imageCell,
                        styles.headerCell,
                        styles.borderRight,
                      ]}
                    >
                      Hình ảnh
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.headerCell,
                        styles.borderRight,
                      ]}
                    >
                      Chục
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.headerCell,
                        styles.borderRight,
                      ]}
                    >
                      Đơn vị
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.headerCell,
                        styles.borderRight,
                      ]}
                    >
                      Viết số
                    </Text>
                    <Text style={[styles.cell, styles.headerCell]}>Đọc số</Text>
                  </LinearGradient>

                  {/* Rows */}
                  {data.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.row,
                        {
                          backgroundColor:
                            index % 2 === 0 ? "#FFF8E1" : "#FFFFFF",
                        },
                      ]}
                      onPress={() => speak(getExplanationFor(item))}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.cell,
                          styles.imageCell,
                          styles.borderRight,
                        ]}
                      >
                        <View style={styles.queContainer}>
                          {Array.from({ length: item.chuc }).map((_, i) => (
                            <Image
                              key={`10-${index}-${i}`}
                              source={QUE_10}
                              style={styles.queImage}
                              resizeMode="contain"
                            />
                          ))}
                          {Array.from({ length: item.donvi }).map((_, i) => (
                            <Image
                              key={`1-${index}-${i}`}
                              source={QUE_1}
                              style={styles.queImage}
                              resizeMode="contain"
                            />
                          ))}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.cell,
                          styles.numberText,
                          styles.borderRight,
                        ]}
                      >
                        {item.chuc}
                      </Text>
                      <Text
                        style={[
                          styles.cell,
                          styles.numberText,
                          styles.borderRight,
                        ]}
                      >
                        {item.donvi}
                      </Text>
                      <Text
                        style={[
                          styles.cell,
                          styles.numberText,
                          styles.borderRight,
                        ]}
                      >
                        {item.vietSo}
                      </Text>
                      <Text style={[styles.cell, styles.docText]}>
                        {item.docSo}
                      </Text>

                      {/* Thêm icon loa ở đây */}
                      <View style={styles.speakerIconContainer}>
                        <FontAwesome5
                          name="volume-up"
                          size={14}
                          color="#FF6B95"
                          style={styles.speakerIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Shadow>

              {/* Nút hiện thêm số - chỉ hiển thị khi chưa hiện hết */}
              {visibleCount < FIXED_NUMBERS.length && (
                <Animated.View
                  style={{ transform: [{ scale: loadMoreScale }] }}
                >
                  <TouchableOpacity onPress={handleTap}>
                    <Shadow
                      distance={0}
                      startColor="rgba(0,0,0,0.2)"
                      style={styles.loadMoreButtonShadow}
                    >
                      <LinearGradient
                        colors={["#FF9800", "#F57C00"]}
                        style={styles.loadMoreButton}
                      >
                        <Text style={styles.loadMoreText}>
                          Hiện thêm số ({FIXED_NUMBERS.length - visibleCount} số
                          nữa)
                        </Text>
                      </LinearGradient>
                    </Shadow>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Ghi chú học tập */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F5F5F5"]}
                  style={styles.tipContainer}
                >
                  <Text style={styles.tipTitle}>Lưu ý quan trọng</Text>
                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#F57C00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>1</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Số hàng chục luôn đứng ở vị trí bên trái
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#F57C00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>2</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Số hàng đơn vị luôn đứng ở vị trí bên phải
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#F57C00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>3</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Khi đọc, luôn đọc số hàng chục trước, sau đó đến số hàng
                      đơn vị
                    </Text>
                  </View>
                </LinearGradient>
              </Shadow>
            </ScrollView>
          </Animated.View>

          {/* Nút điều hướng */}
          <View style={styles.bottomControls}>
            {/* Nút quay lại */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: backButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => {
                  animateButton(backButtonScale);
                  // Dừng âm thanh trước khi chuyển trang
                  Speech.stop();
                  setTimeout(() => router.back(), 300);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF5F6D", "#FFC371"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.buttonLabel}>Quay lại</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Nút tải lại */}
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={handleReload}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#00F5A0", "#00D9F5"]}
                style={styles.gradientReloadButton}
              >
                <FontAwesome5
                  name="sync-alt"
                  size={18}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.reloadButtonText}>Tải lại</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Nút tiếp theo */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => {
                  animateButton(nextButtonScale);
                  // Dừng âm thanh trước khi chuyển trang
                  Speech.stop();
                  setTimeout(() => router.push("./AdditionTheoryScene"), 300);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#B721FF", "#21D4FD"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-right" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.buttonLabel}>Tiếp theo</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 25,
  },
  container: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  contentWrapper: {
    flex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  titleGradient: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardShadow: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 12,
  },
  // Thêm style cho chú cú và bong bóng thoại
  characterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    marginVertical: 5,
  },
  characterImage: {
    width: 100,
    height: 100,
  },
  speechBubbleContainer: {
    flex: 1,
    position: "relative",
  },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    width: "110%",
    minHeight: 90,
  },
  speechPointer: {
    position: "absolute",
    right: -5,
    top: "40%",
    width: 15,
    height: 15,
    backgroundColor: "white",
    transform: [{ rotate: "45deg" }],
    zIndex: -1,
  },
  characterName: {
    color: "orange",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  speech: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "center",
  },
  speakAgainButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(240,240,240,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  speakingIcon: {
    color: "#FF6B95",
  },
  introContainer: {
    borderRadius: 12,
    padding: 16,
  },
  introText: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 22,
  },
  tableContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#FFE0B2",
    paddingVertical: 12,
  },
  headerRow: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  headerCell: {
    fontWeight: "bold",
    color: "#E65100",
    fontSize: 16,
  },
  numberText: {
    fontWeight: "bold",
    color: "#FF5722",
    fontSize: 18,
  },
  docText: {
    color: "#4E342E",
    fontSize: 15,
    flex: 1.5,
    textAlign: "center",
    flexWrap: "wrap",
  },
  imageCell: {
    flex: 2,
    justifyContent: "center",
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: "#FFE0B2",
  },
  queContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 5,
  },
  queImage: {
    width: 24,
    height: 40,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  loadMoreButtonShadow: {
    alignSelf: "center",
    paddingBottom: 20,
  },
  loadMoreButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loadMoreText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  tipContainer: {
    borderRadius: 12,
    padding: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 12,
    textAlign: "center",
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  tipNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  tipNumber: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  tipText: {
    fontSize: 15,
    color: "#5D4037",
    flex: 1,
    lineHeight: 22,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  circleButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonLabel: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  reloadButton: {
    flex: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  gradientReloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 6,
  },
  reloadButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  speakerIconContainer: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  speakerIcon: {
    paddingLeft: 1, // Điều chỉnh nhẹ để icon loa căn giữa hơn
  },
});

export default AddTheoryScene;
