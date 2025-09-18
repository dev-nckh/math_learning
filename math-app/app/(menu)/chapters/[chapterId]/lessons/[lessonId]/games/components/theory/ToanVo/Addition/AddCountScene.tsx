import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Animated as RNAnimated,
  TouchableOpacity,
  Easing,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { Shadow } from "react-native-shadow-2";
import { useRouter } from "expo-router";
import useImagePreload from "../hooks/useImagePreload";
import * as Speech from "expo-speech";

const { width, height } = Dimensions.get("window");
const BALL_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/apple.png");
const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedBall = ({
  delay,
  index,
  onPress,
  disabled,
  highlight,
}: {
  delay: number;
  index: number;
  onPress?: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) => {
  const bounce = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      delay,
      withSpring(-20, { damping: 4, stiffness: 140 }, () => {
        bounce.value = withSpring(0);
      })
    );
    rotation.value = withDelay(
      delay,
      withRepeat(withTiming(10, { duration: 100 }), 6, true)
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    if (disabled) return;

    scale.value = withSequence(withSpring(1.3), withSpring(1));
    onPress?.();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.ballWrapper,
          animatedStyle,
          highlight && styles.highlightedBall,
        ]}
      >
        <Image source={BALL_IMAGE} style={styles.ball} />
        <Text style={styles.ballCount}>{index + 1}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const AnswerBall = ({
  value,
  onPress,
  result,
}: {
  value: number;
  onPress: () => void;
  result: "correct" | "wrong" | null;
}) => {
  const scale = useSharedValue(1);
  const isCorrect = value === 5;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    runOnJS(onPress)();
  };

  const getButtonStyle = () => {
    if (result === null) return {};
    if (result === "correct" && isCorrect) return styles.correctAnswer;
    if (result === "wrong" && !isCorrect) return {};
    if (result === "wrong" && isCorrect) return styles.correctAnswer;
    return styles.wrongAnswer;
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.answerBtn, animatedStyle, getButtonStyle()]}
    >
      <Text
        style={[
          styles.answerText,
          result === "correct" && isCorrect && { color: "white" },
          result === "wrong" && !isCorrect && { color: "#AAA" },
        ]}
      >
        {value}
      </Text>
    </AnimatedPressable>
  );
};
interface AddCountSceneProps {
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
export default function AddCountScene({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: AddCountSceneProps) {
  // Các state và hooks
  const [phase, setPhase] = useState<
    "intro" | "addMore" | "merge" | "counting" | "quiz"
  >("intro");
  const [ballsTop, setBallsTop] = useState<number[]>([]);
  const [ballsBottom, setBallsBottom] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [touchedBalls, setTouchedBalls] = useState<number[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const router = useRouter();
  const backgroundImg = require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg");
  const character = require("../../../../../../../../../../../assets/images/ToanVo/images/owl.png");

  // Animation refs
  const titleOpacity = useRef(new RNAnimated.Value(0)).current;
  const contentOpacity = useRef(new RNAnimated.Value(0)).current;
  const characterAnim = useRef(new RNAnimated.Value(0)).current;
  const backButtonScale = useRef(new RNAnimated.Value(1)).current;
  const reloadButtonScale = useRef(new RNAnimated.Value(1)).current;
  const nextButtonScale = useRef(new RNAnimated.Value(1)).current;

  // Thêm animation refs cho hiệu ứng lắc lư nâng cao
  const owlSwayX = useRef(new RNAnimated.Value(0)).current;
  const owlRotate = useRef(new RNAnimated.Value(0)).current;
  const owlBounceY = useRef(new RNAnimated.Value(0)).current;
  const owlScaleX = useRef(new RNAnimated.Value(1)).current;
  const owlScaleY = useRef(new RNAnimated.Value(1)).current;

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.0, // Cao độ (0.5-2.0)
    rate: 1.0, // Tốc độ (0.1-2.0)
    volume: 1.0, // Âm lượng (0-1.0)
  };

  // Preload hình ảnh
  const ready = useImagePreload([BALL_IMAGE, backgroundImg, character]);

  // Hiệu ứng animation khi component mount
  useEffect(() => {
    if (!ready) return;

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
    ]).start();

    // Tạo hiệu ứng lắc lư cho chú cú
    startOwlWobble();

    // Đợi lâu hơn trước khi hiển thị các quả bóng đầu tiên
    setTimeout(() => {
      speak("Ồ, đầu tiên có 2 quả táo!");
      setTimeout(() => setBallsTop([0, 1]), 800);
    }, 1200);

    // Tăng thời gian trước khi chuyển sang phase "addMore"
    setTimeout(() => setPhase("addMore"), 5000); // Tăng từ 2500ms lên 5000ms
  }, [ready]);

  useEffect(() => {
    if (!ready || phase !== "addMore") return;

    // Thêm delay trước khi hiển thị các quả bóng mới
    setTimeout(() => {
      speak("Sau đó, thêm 3 quả nữa...");
      setTimeout(() => setBallsBottom([0, 1, 2]), 800);
    }, 500);

    // Tăng thời gian trước khi chuyển sang phase "merge"
    setTimeout(() => {
      setPhase("merge");
    }, 5000); // Tăng từ 2500ms lên 5000ms
  }, [phase, ready]);

  useEffect(() => {
    if (!ready || phase !== "merge") return;

    // Thêm delay trước khi gộp các quả bóng
    setTimeout(() => {
      speak("Tất cả các quả táo tụ lại một chỗ!     ");

      speak("Hãy đếm cùng mình nhé! Bạn hãy chạm vào từng quả táo đi!");
      setTimeout(() => {
        setBallsTop([0, 1, 2, 3, 4]);
        setBallsBottom([]);
      }, 800);
    }, 500);

    // Tăng thời gian trước khi chuyển sang phase "counting"
    setTimeout(() => {
      setPhase("counting");
    }, 3500); // Tăng từ 1200ms lên 3500ms
  }, [phase, ready]);

  // Tự động đọc câu khi thay đổi phase
  useEffect(() => {
    if (!ready) return;

    // Không tự động phát âm ở đây vì đã di chuyển vào các useEffect riêng
    // để đồng bộ hóa với thời điểm hiển thị bóng
  }, [phase, ready]);

  // Phát âm thanh khi trả lời đúng/sai
  useEffect(() => {
    if (result === "correct") {
      speak("Đúng rồi! Giỏi quá!");
    } else if (result === "wrong") {
      speak("Sai rồi! Hãy thử lại.");
    }
  }, [result]);

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
        RNAnimated.loop(
          RNAnimated.sequence([
            // Lắc qua phải + nhún xuống nhẹ khi nói
            RNAnimated.parallel([
              RNAnimated.timing(owlSwayX, {
                toValue: 4,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlRotate, {
                toValue: 0.05,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlBounceY, {
                toValue: 2,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlScaleY, {
                toValue: 0.97,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlScaleX, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),

            // Lắc qua trái + nhún lên
            RNAnimated.parallel([
              RNAnimated.timing(owlSwayX, {
                toValue: -4,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlRotate, {
                toValue: -0.05,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlBounceY, {
                toValue: -2,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlScaleY, {
                toValue: 1.03,
                duration: 200,
                useNativeDriver: true,
              }),
              RNAnimated.timing(owlScaleX, {
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

  // Cải thiện hàm speak để đảm bảo chờ đến khi hoàn thành lời thoại trước
  const speakWithDelay = (text: string, delay: number = 500) => {
    setTimeout(() => {
      if (!speaking) {
        speak(text);
      }
    }, delay);
  };

  // Thêm hàm tiện ích để nói và đợi trước khi chuyển phase

  // Hàm để nói và thực hiện một callback sau khi nói xong
  const speakAndThen = (text: string, callback: () => void, delay = 500) => {
    speak(text);

    // Đặt thời gian tối thiểu để đọc dựa trên độ dài của văn bản
    const minSpeakTime = Math.max(2000, text.length * 90); // ~90ms mỗi ký tự

    // Gọi callback sau thời gian đọc ước tính + delay
    setTimeout(() => {
      callback();
    }, minSpeakTime + delay);
  };

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

  // Tải lại màn hình
  const handleReload = () => {
    animateButton(reloadButtonScale);

    // Dừng âm thanh trước khi reload
    Speech.stop();
    setSpeaking(false);

    // Reset tất cả animation values
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);

    RNAnimated.parallel([
      RNAnimated.timing(contentOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase("intro");
      setBallsTop([]);
      setBallsBottom([]);
      setResult(null);
      setTouchedBalls([]);

      // Hiện lại các nội dung
      setTimeout(() => {
        RNAnimated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        setTimeout(() => setBallsTop([0, 1]), 1000);
        setTimeout(() => setPhase("addMore"), 2500);

        // Khởi động lại hiệu ứng lắc lư
        startOwlWobble();
      }, 300);
    });
  };

  const handleAnswer = (value: number) => {
    if (value === 5) {
      setResult("correct");
    } else {
      setResult("wrong");
      // Cho phép thử lại sau 1.5s
      setTimeout(() => setResult(null), 1500);
    }
  };

  const onBallPress = (index: number) => {
    if (touchedBalls.includes(index) || phase !== "counting") return;

    setTouchedBalls((prev) => [...prev, index]);

    // Phát âm số khi chạm vào quả bóng
    speak(`${touchedBalls.length + 1}`);

    if (touchedBalls.length + 1 === 5) {
      speak("Tuyệt lắm! Bạn đã đếm đủ 5 quả!");
      speak("Giờ thì tính nào? 2 + 3 bằng mấy nhỉ?");
      // Tăng thời gian trước khi chuyển sang phase "quiz"
      setTimeout(() => {
        setPhase("quiz");
      }, 2500); // Tăng từ 800ms lên 2500ms
    }
  };

  // Loading state
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Đang tải tài nguyên...</Text>
      </View>
    );
  }

  // Lấy tin nhắn hiện tại dựa trên phase
  const getCurrentMessage = () => {
    if (phase === "intro") return "Ồ, đầu tiên có 2 quả táo";
    if (phase === "addMore") return "Sau đó, thêm 3 quả nữa...";
    if (phase === "merge") return "Tất cả các quả táo tụ lại một chỗ!";
    if (phase === "counting" && touchedBalls.length < 5)
      return "Hãy đếm cùng mình nhé! Hãy chạm vào từng quả táo đi.";
    if (phase === "counting" && touchedBalls.length === 5)
      return "Tuyệt lắm! Bạn đã đếm đủ 5 quả!";
    if (phase === "quiz") return "Tính nào... 2 + 3 = ?";
    if (result === "correct") return "Đúng rồi! Giỏi quá! 👏";
    return "";
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
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
              <Text style={styles.titleText}>Học Đếm và Cộng</Text>
            </LinearGradient>
          </RNAnimated.View>

          {/* Nhân vật và hướng dẫn */}
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
                distance={3}
                startColor="rgba(0,0,0,0.1)"
                style={styles.speechBubble}
              >
                {phase === "intro" && (
                  <Text style={styles.speech}>Ồ, đầu tiên có 2 quả táo!</Text>
                )}
                {phase === "addMore" && (
                  <Text style={styles.speech}>Sau đó, thêm 3 quả nữa...</Text>
                )}
                {phase === "merge" && (
                  <Text style={styles.speech}>
                    Tất cả các quả tụ lại một chỗ!
                  </Text>
                )}
                {phase === "counting" && touchedBalls.length < 5 && (
                  <Text style={styles.speech}>
                    Hãy đếm cùng mình nhé! Hãy chạm vào từng quả táo đi.
                  </Text>
                )}
                {phase === "counting" && touchedBalls.length === 5 && (
                  <Text style={styles.speech}>
                    Tuyệt lắm! Bạn đã đếm đủ 5 quả!
                  </Text>
                )}
                {phase === "quiz" && (
                  <Text style={styles.speech}>Tính nào... 2 + 3 = ?</Text>
                )}
                {phase === "quiz" && result === "correct" && (
                  <Text style={styles.successMessage}>Đúng rồi! Giỏi quá!</Text>
                )}

                {/* Thêm nút phát lại lời thoại */}
                <TouchableOpacity
                  style={styles.speakAgainButton}
                  onPress={() => speak(getCurrentMessage())}
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
                <Image source={character} style={styles.characterImage} />
              </RNAnimated.View>
            </TouchableOpacity>
          </RNAnimated.View>

          {/* Khu vực chính với các quả bóng */}
          <RNAnimated.View
            style={[styles.mainContentCard, { opacity: contentOpacity }]}
          >
            <Shadow
              distance={5}
              startColor="rgba(0,0,0,0.1)"
              style={styles.mainContentInner}
            >
              <View style={styles.ballsZone}>
                <View style={styles.ballsRow}>
                  {ballsTop.map((_, i) => (
                    <AnimatedBall
                      key={`top-${i}`}
                      index={i}
                      delay={i * 150}
                      onPress={() => onBallPress(i)}
                      disabled={phase !== "counting"}
                      highlight={touchedBalls.includes(i)}
                    />
                  ))}
                </View>

                {ballsBottom.length > 0 && (
                  <View style={styles.ballsRow}>
                    {ballsBottom.map((_, i) => (
                      <AnimatedBall
                        key={`bot-${i}`}
                        index={i + 2}
                        delay={i * 150}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Đếm: Hiện số đếm ở giữa */}
              {phase === "counting" && touchedBalls.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countNumber}>{touchedBalls.length}</Text>
                </View>
              )}

              {/* Câu hỏi và các nút trả lời */}
              {phase === "quiz" && (
                <View style={styles.quizContainer}>
                  <TouchableOpacity
                    style={styles.equation}
                    onPress={() => speak("2 cộng 3 bằng mấy?")}
                  >
                    <Text style={styles.equationText}>2 + 3 = ?</Text>
                  </TouchableOpacity>
                  <View style={styles.answerOptions}>
                    {[3, 5, 6].map((val) => (
                      <AnswerBall
                        key={val}
                        value={val}
                        onPress={() => handleAnswer(val)}
                        result={result}
                      />
                    ))}
                  </View>
                </View>
              )}
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
                onPress={() => {
                  animateButton(backButtonScale);
                  // Dừng giọng nói trước khi chuyển trang
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
                <Text style={styles.buttonLabel}></Text>
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
                  <Text style={styles.mainButtonText}></Text>
                </LinearGradient>
              </TouchableOpacity>
            </RNAnimated.View>

            {/* Nút tiếp theo - chỉ hiển thị khi đã trả lời đúng */}
            {/* <RNAnimated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => {
                  animateButton(nextButtonScale);
                  setTimeout(() => router.push("/math_add_sub"), 300);
                }}
                activeOpacity={0.8}
                disabled={!(phase === "quiz" && result === "correct")}
              >
                <LinearGradient
                  colors={
                    result === "correct"
                      ? ["#B721FF", "#21D4FD"]
                      : ["#CCCCCC", "#AAAAAA"]
                  }
                  style={[
                    styles.gradientButton,
                    !(phase === "quiz" && result === "correct") &&
                      styles.disabledButton,
                  ]}
                >
                  <FontAwesome5
                    name="arrow-right"
                    size={20}
                    color={result === "correct" ? "white" : "#888888"}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.buttonLabel,
                    !(phase === "quiz" && result === "correct") &&
                      styles.disabledText,
                  ]}
                >
                  Tiếp theo
                </Text>
              </TouchableOpacity>
            </RNAnimated.View> */}
          </View>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFDE7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
    justifyContent: "space-between",
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  speechBubbleContainer: {
    flex: 1,
    marginRight: -15,
    position: "relative",
  },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  speechPointer: {
    position: "absolute",
    right: 5,
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
  successMessage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 5,
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
  mainContentCard: {
    flex: 1,
    marginVertical: 10,
    justifyContent: "center",
  },
  mainContentInner: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  ballsZone: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  ballsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ballWrapper: {
    alignItems: "center",
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 30,
  },
  highlightedBall: {
    backgroundColor: "rgba(255, 249, 196, 0.8)",
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  ball: {
    width: 48,
    height: 48,
  },
  ballCount: {
    marginTop: 2,
    fontSize: 14,
    color: "#444",
    fontWeight: "bold",
  },
  countBadge: {
    position: "absolute",
    top: "80%",
    alignSelf: "center",
    backgroundColor: "rgba(255, 87, 34, 0.8)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  countNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  quizContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  equation: {
    backgroundColor: "#EEEEEE",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 15,
  },
  equationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976D2",
  },
  answerOptions: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
  },
  answerBtn: {
    backgroundColor: "#FFD54F",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  correctAnswer: {
    backgroundColor: "#4CAF50",
  },
  wrongAnswer: {
    backgroundColor: "#E0E0E0",
  },
  answerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5D4037",
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
  disabledText: {
    color: "#888888",
    textShadowColor: "transparent",
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
});
