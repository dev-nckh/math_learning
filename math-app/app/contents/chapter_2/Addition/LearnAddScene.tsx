// src/features/MathAddSub/screens/LearnAddScreen.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import WobbleImage from "../components/WobbleImage";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import * as Speech from "expo-speech";

const { width, height } = Dimensions.get("window");

const LearnAddScreen = () => {
  const apple = require("../../../../assets/images/apple.png");
  const character = require("../../../../assets/images/owl.png");
  const backgroundImg = require("../../../../assets/images/bg.jpg");

  const [screenKey, setScreenKey] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const router = useRouter();

  // Animation refs
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const reloadButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const characterAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const equationScale = useRef(new Animated.Value(0.9)).current;
  const speakButtonScale = useRef(new Animated.Value(1)).current;

  // Thêm các animation values cho hiệu ứng lắc lư nâng cao
  const owlSwayX = useRef(new Animated.Value(0)).current;
  const owlRotate = useRef(new Animated.Value(0)).current;
  const owlBounceY = useRef(new Animated.Value(0)).current; // Thêm mới - chuyển động lên xuống
  const owlScaleX = useRef(new Animated.Value(1)).current; // Thêm mới - hiệu ứng co giãn ngang
  const owlScaleY = useRef(new Animated.Value(1)).current; // Thêm mới - hiệu ứng co giãn dọc

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.0, // Cao độ (0.5-2.0)
    rate: 1.0, // Tốc độ (0.1-2.0)
    volume: 1.0, // Âm lượng (0-1.0)// Ví dụ, thay đổi theo voice_id thực tế
    voice: "vi-VN-Standard-B", // Giọng nói (thay đổi theo giọng có sẵn trên thiết bị)
  };

  // Nội dung cần đọc
  const lessonContent = {
    title: "Học Phép Cộng",
    character: "Phép Toán Cộng",
    speech:
      "Mình rất thích kết nối các bạn số lại với nhau. Khi bạn 2 và bạn 3 chơi với nhau, mình đến để giúp: 2 cộng 3 bằng 5 đó!",
    equation: "2 cộng 3 bằng 5",
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
        const talkingAnimation = () => {
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
        };

        talkingAnimation();
      }
    } catch (error) {
      console.error("Lỗi phát âm thanh:", error);
      setSpeaking(false);
    }
  };

  // Tự động đọc khi màn hình hiển thị
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(lessonContent.speech);
    }, 1500); // Chờ 1.5s để animation hiển thị xong

    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [screenKey]);

  // Đọc phép tính
  const speakEquation = () => {
    speak(lessonContent.equation);
  };

  // Hàm để lấy danh sách các giọng có sẵn
  const getAvailableVoices = async () => {
    const voices = await Speech.getAvailableVoicesAsync();
    console.log("Available voices:", voices);

    // Lọc các giọng tiếng Việt
    const vietnameseVoices = voices.filter(
      (voice) =>
        voice.language.includes("vi-VN") || voice.language.includes("vi_VN")
    );
    console.log("Vietnamese voices:", vietnameseVoices);

    return voices;
  };

  // Gọi khi component mount
  useEffect(() => {
    getAvailableVoices();
  }, []);

  // Animations
  useEffect(() => {
    const animations = [
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(characterAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(equationScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(200, animations).start();

    return () => {
      titleOpacity.setValue(0);
      characterAnim.setValue(0);
      contentOpacity.setValue(0);
      equationScale.setValue(0.9);
    };
  }, [screenKey]);

  // Tạo hiệu ứng lắc lư cho chú cú
  useEffect(() => {
    // Animation lắc lư liên tục
    const startSwayAnimation = () => {
      Animated.loop(
        Animated.sequence([
          // Lắc sang phải và nghiêng nhẹ
          Animated.parallel([
            Animated.timing(owlSwayX, {
              toValue: 5,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(owlRotate, {
              toValue: 0.05, // Xoay 5 độ
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
          // Lắc sang trái và nghiêng ngược lại
          Animated.parallel([
            Animated.timing(owlSwayX, {
              toValue: -5,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(owlRotate, {
              toValue: -0.05, // Xoay -5 độ
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
        ])
      ).start();
    };

    // Bắt đầu animation sau khi nhân vật xuất hiện
    const timer = setTimeout(() => {
      startSwayAnimation();
    }, 1500);

    return () => {
      clearTimeout(timer);
      // Reset giá trị khi unmount
      owlSwayX.setValue(0);
      owlRotate.setValue(0);
    };
  }, [screenKey]);

  // Tạo hiệu ứng lắc lư tự nhiên cho chú cú
  useEffect(() => {
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
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0.03 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1.02,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: -2 * randomFactor,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),

        // Lắc qua trái + nghiêng ngược lại + co giãn nhẹ khác
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: -3 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: -0.03 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 2 * randomFactor,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),

        // Trở về vị trí gốc với nhẹ nhàng
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ];

      // Kết hợp các animation và lặp lại ngẫu nhiên
      Animated.sequence(animations).start(() => {
        // Đợi một chút trước khi bắt đầu lại
        setTimeout(() => {
          createWobbleAnimation();
        }, Math.random() * 300 + 100);
      });
    };

    // Bắt đầu animation sau khi nhân vật xuất hiện
    const timer = setTimeout(() => {
      createWobbleAnimation();
    }, 1800);

    return () => {
      clearTimeout(timer);
      // Reset giá trị khi unmount
      owlSwayX.setValue(0);
      owlRotate.setValue(0);
      owlBounceY.setValue(0);
      owlScaleX.setValue(1);
      owlScaleY.setValue(1);
    };
  }, [screenKey]);

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

  const handleReload = () => {
    animateButton(reloadButtonScale);

    // Dừng giọng nói trước khi reload
    Speech.stop();
    setSpeaking(false);

    // Reset tất cả animation values
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);

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
      setScreenKey((prev) => prev + 1);
      setShowResult(true);
    });
  };

  // Hàm tạo hiệu ứng lắc mạnh khi nhấn vào chú cú
  const shakeOwl = () => {
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

      // Lắc qua phải nhẹ
      Animated.parallel([
        Animated.timing(owlSwayX, {
          toValue: 4,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(owlRotate, {
          toValue: 0.03,
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
      ]),
    ]).start(() => {
      // Sau khi lắc xong, bắt đầu đọc
      speak(lessonContent.speech);
    });
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
              <Text style={styles.titleText}>{lessonContent.title}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Nhân vật và bong bóng thoại */}
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
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechPointer} />
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.speechBubble}
              >
                <Text style={styles.characterName}>
                  {lessonContent.character}
                </Text>
                <Text style={styles.speech}>{lessonContent.speech}</Text>

                {/* Nút phát lại lời thoại */}
                <TouchableOpacity
                  style={styles.speakAgainButton}
                  onPress={() => {
                    animateButton(speakButtonScale);
                    speak(lessonContent.speech);
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[{ transform: [{ scale: speakButtonScale }] }]}
                  >
                    <FontAwesome5
                      name={speaking ? "volume-up" : "volume-up"}
                      size={16}
                      color={speaking ? "#FF6B95" : "#666"}
                      style={speaking ? styles.speakingIcon : {}}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </Shadow>
            </View>

            <TouchableOpacity onPress={shakeOwl} activeOpacity={0.8}>
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
                  // Thêm origin giữa để quay đúng
                  transformOrigin: "center",
                }}
              >
                <Image source={character} style={styles.characterImage} />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* Phép tính với ví dụ */}
          <Animated.View
            style={[
              styles.equationCard,
              {
                opacity: contentOpacity,
                transform: [{ scale: equationScale }],
              },
            ]}
          >
            <Shadow
              distance={5}
              startColor="rgba(0,0,0,0.1)"
              style={styles.equationCardInner}
            >
              <View style={styles.equationContainer}>
                {/* Dòng 1: 2 quả */}
                <View style={styles.row}>
                  {[...Array(2)].map((_, i) => (
                    <WobbleImage key={`top-${i}`} source={apple} size={40} />
                  ))}
                </View>

                {/* Dấu + */}
                <View style={styles.operatorContainer}>
                  <LinearGradient
                    colors={["#FFD54F", "#FFA000"]}
                    style={styles.operatorCircle}
                  >
                    <Text style={styles.operator}>+</Text>
                  </LinearGradient>
                </View>

                {/* Dòng 2: 3 quả */}
                <View style={styles.row}>
                  {[...Array(3)].map((_, i) => (
                    <WobbleImage key={`bottom-${i}`} source={apple} size={40} />
                  ))}
                </View>

                {/* Dòng 3: gạch ngang */}
                <LinearGradient
                  colors={["#E0E0E0", "#9E9E9E", "#E0E0E0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.line}
                />

                {/* Dòng 4: 5 quả */}
                <View style={styles.resultRow}>
                  {[...Array(5)].map((_, i) => (
                    <WobbleImage key={`sum-${i}`} source={apple} size={36} />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.mathTextContainer}
                onPress={speakEquation}
              >
                <Text style={styles.mathText}>2 + 3 = 5</Text>
                <FontAwesome5
                  name="volume-up"
                  size={16}
                  color="#1976D2"
                  style={styles.equationSpeakIcon}
                />
              </TouchableOpacity>
            </Shadow>
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
                  if (router.canGoBack()) {
                    router.back(); // Quay lại màn hình trước đó
                  } else {
                    router.replace("../chapter2"); // Điều hướng đến màn hình cụ thể
                  }
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF5F6D", "#FFC371"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Nút tải lại */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: reloadButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleReload}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#00F5A0", "#00D9F5"]}
                  style={styles.gradientMainButton}
                >
                  <FontAwesome5
                    name="sync-alt"
                    size={18}
                    color="white"
                    style={styles.buttonIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

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
                  setTimeout(() => router.push("./AddCountScene"), 300);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#B721FF", "#21D4FD"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-right" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LearnAddScreen;

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
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
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
    padding: 10,
    width: "110%",
    height: 120,
    justifyContent: "center",
    textAlign: "center",
    alignContent: "center",
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
  speech: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
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
  equationCard: {
    flex: 1,
    marginVertical: 10,
    maxHeight: height * 0.4, // Giới hạn chiều cao tối đa
  },
  equationCardInner: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  equationContainer: {
    backgroundColor: "rgba(255, 248, 225, 0.5)",
    borderRadius: 12,
    padding: 10,
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 5,
  },
  resultRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 5,
  },
  operatorContainer: {
    alignItems: "center",
    marginVertical: 3,
  },
  operatorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  operator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  line: {
    height: 3,
    borderRadius: 1.5,
    marginVertical: 8,
    marginHorizontal: 30,
  },
  mathTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 0,
    backgroundColor: "#EEEEEE",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "center",
  },
  mathText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1976D2",
    marginRight: 10,
  },
  equationSpeakIcon: {
    marginLeft: 5,
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
    color: "black",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  mainButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientMainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 0,
  },
  mainButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  characterName: {
    color: "orange",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
});
