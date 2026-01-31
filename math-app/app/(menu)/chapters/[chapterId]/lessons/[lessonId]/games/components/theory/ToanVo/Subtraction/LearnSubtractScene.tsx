import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { Shadow } from "react-native-shadow-2";
import { useSpeech } from "../../useSpeechHook";

const { width, height } = Dimensions.get("window");

// 📦 Hình ảnh dùng require
const CAKE_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/Cake1.png");
const ANT_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/ant.png");
const OWL_TEACHER_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/owl.png");
const OWL_CRY_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/owl_cry.png");
const backgroundImg = require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg");

// Tạo components animated
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface LearnSubtractSceneProps {
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
export default function LearnSubtractScene({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: LearnSubtractSceneProps) {
  const [visibleCakes, setVisibleCakes] = useState(0);
  const [showText1, setShowText1] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [showText3, setShowText3] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [screenKey, setScreenKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Animated values cho nội dung (Reanimated)
  const antX = useSharedValue(width);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const opacityResult = useSharedValue(0);
  const owlRotation = useSharedValue(0);

  // UI animation values (React Native Animated)
  const titleOpacity = useRef(new RNAnimated.Value(0)).current;
  const contentOpacity = useRef(new RNAnimated.Value(0)).current;
  const backButtonScale = useRef(new RNAnimated.Value(1)).current;
  const reloadButtonScale = useRef(new RNAnimated.Value(1)).current;
  const nextButtonScale = useRef(new RNAnimated.Value(1)).current;
  const characterAnim = useRef(new RNAnimated.Value(0)).current;
  const equationScale = useRef(new RNAnimated.Value(0.9)).current;

  // Thêm animation refs cho hiệu ứng lắc lư nâng cao
  const owlSwayX = useRef(new RNAnimated.Value(0)).current;
  const owlRotate = useRef(new RNAnimated.Value(0)).current;
  const owlBounceY = useRef(new RNAnimated.Value(0)).current;
  const owlScaleX = useRef(new RNAnimated.Value(1)).current;
  const owlScaleY = useRef(new RNAnimated.Value(1)).current;

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.1,
    rate: 0.75, // Giảm tốc độ từ 0.9 xuống 0.75 để trẻ hiểu rõ hơn
    volume: 1.0,
  };

  const owlStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${owlRotation.value}deg` }],
  }));

  const antStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: antX.value }],
    position: "absolute",
    top: height * 0.2,
  }));

  const textStyle1 = useAnimatedStyle(() => ({ opacity: opacity1.value }));
  const textStyle2 = useAnimatedStyle(() => ({ opacity: opacity2.value }));
  const textStyle3 = useAnimatedStyle(() => ({ opacity: opacity3.value }));
  const resultStyle = useAnimatedStyle(() => ({
    opacity: opacityResult.value,
  }));

  // 🔄 Hàm preload ảnh
  const preloadImages = async () => {
    const images = [
      CAKE_IMAGE,
      ANT_IMAGE,
      OWL_TEACHER_IMAGE,
      OWL_CRY_IMAGE,
      backgroundImg,
    ];
    try {
      await Promise.all(
        images.map((img) => {
          Image.resolveAssetSource(img);
          return Promise.resolve();
        })
      );
      setImagesLoaded(true);
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh:", error);
      setImagesLoaded(true);
    }
  };

  // Hàm đọc văn bản
  // const speak = async (text: string, options = {}) => {
  //   if (speaking) {
  //     await stopSpeech(); // Dừng giọng nói hiện tại trước khi phát giọng nói mới
  //   }

  //   setSpeaking(true);

  //   try {
  //     await Speech.speak(text, {
  //       ...speechOptions,
  //       ...options,
  //       onDone: () => setSpeaking(false),
  //       onError: () => setSpeaking(false),
  //     });
  //   } catch (error) {
  //     console.error("Speech error:", error);
  //     setSpeaking(false);
  //   }
  // };

  // // Hàm dừng giọng nói
  // const stopSpeech = async () => {
  //   try {
  //     await Speech.stop();
  //     setSpeaking(false);
  //   } catch (error) {
  //     console.warn("Error stopping speech:", error);
  //   }
  // };
  const { speak, stopSpeech, isSpeechActive, pageId } = useSpeech({
    pageId: `LearnSubtractScene-${chapterId}-${lessonId}-${gameId}`,
    autoCleanupOnUnmount: true,
    autoStopOnBlur: true,
  });

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
        RNAnimated.parallel([
          RNAnimated.timing(owlSwayX, {
            toValue: 3 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlRotate, {
            toValue: 0.03 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlScaleX, {
            toValue: 1.02,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlBounceY, {
            toValue: -2 * randomFactor,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Lắc qua trái + nghiêng ngược lại + co giãn nhẹ khác
        RNAnimated.parallel([
          RNAnimated.timing(owlSwayX, {
            toValue: -3 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlRotate, {
            toValue: -0.03 * randomFactor,
            duration: 800 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlScaleX, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlBounceY, {
            toValue: 2 * randomFactor,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Trở về vị trí gốc với nhẹ nhàng
        RNAnimated.parallel([
          RNAnimated.timing(owlSwayX, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlRotate, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlScaleX, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(owlBounceY, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ];

      // Kết hợp các animation và lặp lại ngẫu nhiên
      RNAnimated.sequence(animations).start(() => {
        // Đợi một chút trước khi bắt đầu lại
        setTimeout(() => {
          createWobbleAnimation();
        }, Math.random() * 300 + 100);
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
    RNAnimated.sequence([
      // Co lại nhẹ
      RNAnimated.parallel([
        RNAnimated.timing(owlScaleX, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlScaleY, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlBounceY, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua phải mạnh
      RNAnimated.parallel([
        RNAnimated.timing(owlSwayX, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlRotate, {
          toValue: 0.08,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlScaleX, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlScaleY, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua trái mạnh
      RNAnimated.parallel([
        RNAnimated.timing(owlSwayX, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlRotate, {
          toValue: -0.08,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua phải vừa
      RNAnimated.parallel([
        RNAnimated.timing(owlSwayX, {
          toValue: 8,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlRotate, {
          toValue: 0.06,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),

      // Lắc qua trái vừa
      RNAnimated.parallel([
        RNAnimated.timing(owlSwayX, {
          toValue: -8,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlRotate, {
          toValue: -0.06,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),

      // Trở về vị trí ban đầu
      RNAnimated.parallel([
        RNAnimated.timing(owlSwayX, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlRotate, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlScaleX, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlScaleY, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(owlBounceY, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Sau khi lắc xong, bắt đầu đọc
      speak(message);
    });
  };

  // 🔁 Animation flow khi bắt đầu học
  const startAnimationFlow = () => {
    // Hiệu ứng UI xuất hiện giữ nguyên
    RNAnimated.parallel([
      RNAnimated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(characterAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.spring(equationScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Bắt đầu hiệu ứng lắc lư cho chú cú
    startOwlWobble();

    // Logic bài học (Reanimated)
    setVisibleCakes(6);
    setShowText1(true);
    opacity1.value = withTiming(1, { duration: 1200 }); // Tăng từ 800ms lên 1200ms

    // Đọc câu đầu tiên - đợi lâu hơn (từ 1500ms lên 2500ms)
    setTimeout(() => {
      speak("Mình có 6 chiếc bánh ngon lành");
    }, 2500);

    // Cú mèo lắc đầu liên tục - giảm tần suất lắc
    owlRotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 800 }), // Tăng từ 600ms lên 800ms
        withTiming(5, { duration: 800 }) // Tăng từ 600ms lên 800ms
      ),
      -1,
      true
    );

    // Đợi lâu hơn trước khi hiển thị câu tiếp theo (tăng từ 3000ms lên 5000ms)
    setTimeout(() => {
      setShowText2(true);
      opacity2.value = withTiming(1, { duration: 1200 }); // Tăng từ 800ms lên 1200ms

      // Đọc câu thứ hai - đợi lâu hơn để trẻ hiểu câu đầu tiên
      setTimeout(() => {
        speak("Ồ không! Có chú kiến tinh nghịch đang lấy đi 2 cái bánh!");
      }, 1500); // Tăng từ 1000ms lên 1500ms

      // Tăng thời gian trước khi kiến di chuyển (từ 3000ms lên 4500ms)
      setTimeout(() => {
        // Kiến di chuyển chậm hơn (từ 2500ms lên 3500ms)
        antX.value = withTiming(-300, { duration: 3500 }, (finished) => {
          if (finished) {
            runOnJS(setVisibleCakes)(4);
            runOnJS(setShowText3)(true);
            runOnJS(setShowResult)(true);
          }
        });

        // Đợi lâu hơn trước khi hiển thị câu thứ ba và phép tính
        setTimeout(() => {
          opacity3.value = withTiming(1, { duration: 1200 }); // Tăng từ 800ms lên 1200ms

          // Đọc câu thứ ba sau khi kiến đã di chuyển
          setTimeout(() => {
            speak("Vậy là mình chỉ còn lại 4 cái bánh thôi");
          }, 1500); // Tăng từ 1000ms lên 1500ms

          // Đợi lâu hơn trước khi hiển thị phép tính
          setTimeout(() => {
            opacityResult.value = withTiming(1, { duration: 1200 }); // Tăng từ 800ms lên 1200ms

            // Đọc phép tính sau khi hiển thị
            setTimeout(() => {
              speak("Vậy chúng ta có phép toán 6 trừ 2 bằng 4");
            }, 1500); // Tăng từ 1000ms lên 1500ms
          }, 3000); // Tăng từ 600ms lên 3000ms
        }, 4000); // Tăng từ 2000ms lên 4000ms
      }, 4500);
    }, 5000); // Tăng từ 3000ms lên 5000ms
  };

  // 🧠 useEffect khởi động preload & animation
  useEffect(() => {
    let mounted = true;

    preloadImages().then(() => {
      if (mounted) {
        console.log("✅ Tất cả hình ảnh đã sẵn sàng!");
        startAnimationFlow();
      }
    });

    return () => {
      mounted = false;
      // Dừng âm thanh khi unmount
      stopSpeech();
    };
  }, [screenKey]);

  // Hiệu ứng nhấn nút
  const animateButton = (buttonAnim: RNAnimated.Value | RNAnimated.ValueXY) => {
    RNAnimated.sequence([
      RNAnimated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(buttonAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReload = () => {
    animateButton(reloadButtonScale);

    // Dừng âm thanh trước khi reload
    stopSpeech();

    // Reset các animation values
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);

    // Fade out
    RNAnimated.parallel([
      RNAnimated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(characterAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset các state
      setVisibleCakes(0);
      setShowText1(false);
      setShowText2(false);
      setShowText3(false);
      setShowResult(false);

      // Reset các Reanimated values
      antX.value = width;
      opacity1.value = 0;
      opacity2.value = 0;
      opacity3.value = 0;
      opacityResult.value = 0;
      owlRotation.value = 0;

      setScreenKey((prev) => prev + 1);
    });
  };

  // Lấy câu thoại hiện tại dựa vào trạng thái
  const getCurrentMessage = () => {
    if (showText3) return "Vậy là mình chỉ còn lại 4 cái bánh thôi";
    if (showText2)
      return "Ồ không! Có chú kiến tinh nghịch đang lấy đi 2 cái bánh!";
    if (showText1) return "Mình có 6 chiếc bánh ngon lành";
    return "";
  };
  const handleNext = async () => {
    try {
      await stopSpeech();
    } catch (error) {
      console.warn("Error stopping speech:", error);
    }

    // Thực hiện các animation chuyển tiếp
    RNAnimated.parallel([
      RNAnimated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(characterAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Điều hướng sang AddCountScene sau khi animation kết thúc
      router.push(
        `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/components/theory/ToanVo/Subtraction/SubtractCountScene`
      );
    });
  };
  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View key={screenKey} style={styles.container}>
          {!imagesLoaded ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF69B4" />
              <Text style={styles.loadingText}>Đang tải tài nguyên...</Text>
            </View>
          ) : (
            <>
              {/* Tiêu đề */}
              <RNAnimated.View
                style={[styles.titleContainer, { opacity: titleOpacity }]}
              >
                <LinearGradient
                  colors={["#FF9A8B", "#FF6B95"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.titleGradient}
                >
                  <Text style={styles.titleText}>Học Phép Trừ</Text>
                </LinearGradient>
              </RNAnimated.View>

              {/* Nhân vật và bong bóng thoại */}
              <RNAnimated.View
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
                    <Text style={styles.characterName}>Bạn Cú</Text>
                    <Text style={styles.speech}>
                      {showText1 && "Mình có 6 chiếc bánh ngon lành"}
                    </Text>
                    <Text style={styles.speech}>
                      {showText2 &&
                        "Ồ không! Có chú kiến tinh nghịch đang lấy đi 2 cái bánh!"}
                    </Text>
                    <Text style={styles.speech}>
                      {showText3 && "Vậy là mình chỉ còn lại 4 cái bánh thôi"}
                    </Text>

                    {/* Nút phát lại lời thoại */}
                    <TouchableOpacity
                      style={styles.speakAgainButton}
                      onPress={() => speak(getCurrentMessage())}
                      activeOpacity={0.8}
                    >
                      <FontAwesome5
                        name={isSpeechActive() ? "volume-up" : "volume-up"}
                        size={16}
                        color={isSpeechActive() ? "#FF6B95" : "#666"}
                        style={isSpeechActive() ? styles.speakingIcon : {}}
                      />
                    </TouchableOpacity>
                  </Shadow>
                </View>

                {/* Nhân vật với hiệu ứng lắc lư */}
                <TouchableOpacity
                  onPress={() => shakeOwl(getCurrentMessage())}
                  activeOpacity={0.8}
                >
                  <RNAnimated.View
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
                      source={showText3 ? OWL_CRY_IMAGE : OWL_TEACHER_IMAGE}
                      style={styles.characterImage}
                    />
                  </RNAnimated.View>
                </TouchableOpacity>
              </RNAnimated.View>

              {/* Nội dung chính */}
              <RNAnimated.View
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
                    {/* 🐜 Kiến đi ngang */}
                    {showText2 && (
                      <AnimatedView style={antStyle}>
                        <Image source={ANT_IMAGE} style={styles.ant} />
                      </AnimatedView>
                    )}

                    {/* 🍰 Bánh */}
                    <View style={styles.cakeContainer}>
                      {Array.from({ length: visibleCakes }).map((_, i) => (
                        <Image
                          key={i}
                          source={CAKE_IMAGE}
                          style={styles.cake}
                        />
                      ))}
                    </View>

                    {/* Kết quả phép trừ */}
                    {showResult && (
                      <TouchableOpacity
                        style={styles.mathTextContainer}
                        onPress={() => speak("6 trừ 2 bằng 4")}
                      >
                        <AnimatedText style={[styles.mathText, resultStyle]}>
                          6 - 2 = 4
                        </AnimatedText>
                        <FontAwesome5
                          name="volume-up"
                          size={16}
                          color="#1976D2"
                          style={styles.equationSpeakIcon}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </Shadow>
              </RNAnimated.View>

              {/* Nút điều hướng */}
              <View style={styles.bottomControls}>
                {/* Nút quay lại */}
                <RNAnimated.View
                  style={[
                    styles.buttonContainer,
                    { transform: [{ scale: backButtonScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={async () => {
                      animateButton(backButtonScale);

                      // Dừng âm thanh trước khi chuyển trang
                      await stopSpeech();

                      setTimeout(() => {
                        // Reset các giá trị animation
                        owlSwayX.setValue(0);
                        owlRotate.setValue(0);
                        owlBounceY.setValue(0);
                        owlScaleX.setValue(1);
                        owlScaleY.setValue(1);

                        antX.value = width;
                        opacity1.value = 0;
                        opacity2.value = 0;
                        opacity3.value = 0;
                        opacityResult.value = 0;
                        owlRotation.value = 0;

                        // Reset các giá trị trạng thái
                        setVisibleCakes(0);
                        setShowText1(false);
                        setShowText2(false);
                        setShowText3(false);
                        setShowResult(false);

                        // Điều hướng
                        if (router.canGoBack()) {
                          router.back(); // Quay lại màn hình trước đó
                        } else {
                          router.replace("../chapter2"); // Điều hướng đến màn hình cụ thể
                        }
                      }, 300); // Đợi 300ms để đảm bảo Speech.stop() hoàn thành
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
                </RNAnimated.View>

                {/* Nút tải lại */}
                <RNAnimated.View
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
                </RNAnimated.View>

                {/* Nút tiếp theo */}
                <RNAnimated.View
                  style={[
                    styles.buttonContainer,
                    { transform: [{ scale: nextButtonScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#B721FF", "#21D4FD"]}
                      style={styles.gradientButton}
                    >
                      <FontAwesome5
                        name="arrow-right"
                        size={20}
                        color="white"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </RNAnimated.View>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

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
    height: 140,
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
    textAlign: "auto",
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
    maxHeight: height * 0.4,
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
    position: "relative",
  },
  cakeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  cake: {
    width: 50,
    height: 50,
    margin: 3,
  },
  ant: {
    width: 40,
    height: 40,
    zIndex: 10,
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
    marginRight: 5,
  },
  equationSpeakIcon: {
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#4E342E",
    marginTop: 20,
  },
  // Nút điều hướng
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
    textAlign: "center",
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
});
