import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  runOnJS,
  withRepeat,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { router } from "expo-router";
import useImagePreload from "../hooks/useImagePreload";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { Shadow } from "react-native-shadow-2";
import { useSpeech } from "../../useSpeechHook";

const { width, height } = Dimensions.get("window");
const MELON = require("../../../../../../../../../../../assets/images/ToanVo/images/watermelon.png");
const SAD_OWL = require("../../../../../../../../../../../assets/images/ToanVo/images/owl_cry.png");
const OWL_NORMAL = require("../../../../../../../../../../../assets/images/ToanVo/images/owl.png");
const backgroundImg = require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

type AnimatedMelonProps = {
  index: number;
  delay: number;
  onPress?: () => void;
  disabled: boolean;
  highlight: boolean;
  falling: boolean;
};

const AnimatedMelon = ({
  index,
  delay,
  onPress,
  disabled,
  highlight,
  falling,
}: AnimatedMelonProps) => {
  const bounce = useSharedValue(0);
  const scale = useSharedValue(1);
  const fallY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0); // Thêm rotate để dưa hấu xoay nhẹ

  useEffect(() => {
    bounce.value = withDelay(
      delay,
      withSpring(-20, {}, () => {
        bounce.value = withSpring(0);
      })
    );

    // Thêm hiệu ứng xoay nhẹ
    if (!falling && !disabled) {
      rotate.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 2000 }),
          withTiming(2, { duration: 2000 })
        ),
        -1,
        true
      );
    }

    if (falling) {
      rotate.value = withSequence(
        withTiming(-15, { duration: 300 }),
        withTiming(15, { duration: 300 }),
        withTiming(-15, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );

      fallY.value = withDelay(
        delay,
        withTiming(150, { duration: 1000 }, () => {
          opacity.value = withTiming(0, { duration: 300 });
        })
      );
    }
  }, [delay, falling, disabled]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: falling ? fallY.value : bounce.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(withSpring(1.3), withSpring(1));
    onPress?.();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[styles.melonWrapper, style, highlight && styles.highlight]}
      >
        <Shadow
          distance={3}
          startColor="rgba(0,0,0,0.1)"
          containerStyle={{ borderRadius: 25 }}
        >
          <LinearGradient
            colors={highlight ? ["#FFF9C4", "#FFECB3"] : ["white", "#FAFAFA"]}
            style={styles.melonInner}
          >
            <Image source={MELON} style={styles.melon} />
            <Text style={styles.melonCount}>{index + 1}</Text>
          </LinearGradient>
        </Shadow>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

type AnswerButtonProps = {
  value: number;
  onPress: (value: number) => void;
  result: string | null;
  correct: number;
};

const AnswerButton = ({
  value,
  onPress,
  result,
  correct,
}: AnswerButtonProps) => {
  const scale = useSharedValue(1);

  const isCorrect = value === correct;
  const isSelected =
    result &&
    ((result === "correct" && isCorrect) || (result === "wrong" && !isCorrect));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    onPress(value);
  };

  return (
    <Shadow
      distance={4}
      startColor="rgba(0,0,0,0.15)"
      containerStyle={{ borderRadius: 25 }}
    >
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.answerBtn,
          animatedStyle,
          result === "correct" && isCorrect && styles.correctAnswer,
          result === "wrong" && !isCorrect && styles.wrongAnswer,
        ]}
      >
        <Text
          style={[
            styles.answerText,
            result === "correct" && isCorrect && { color: "white" },
          ]}
        >
          {value}
        </Text>
      </AnimatedPressable>
    </Shadow>
  );
};

type CountBadgeProps = {
  count: number;
};

const CountBadge = ({ count }: CountBadgeProps) => (
  <View style={styles.countBadge}>
    <LinearGradient
      colors={["#FF9A8B", "#FF6B95"]}
      style={styles.countBadgeGradient}
    >
      <Text style={styles.countNumber}>{count}</Text>
    </LinearGradient>
  </View>
);

const SubtractMelonScene = () => {
  const [phase, setPhase] = useState("intro");
  const [melons, setMelons] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [fallingMelons, setFallingMelons] = useState<number[]>([]);
  const [touched, setTouched] = useState<number[]>([]);
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [messages, setMessages] = useState({
    intro: true,
    drop: false,
    sad: false,
    count: false,
    quiz: false,
  });
  const { speak, stopSpeech, isSpeechActive, pageId } = useSpeech({
    pageId: "SubtractMelonScene",
    autoCleanupOnUnmount: true,
    autoStopOnBlur: true,
  });
  // Animation references
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
  // const speechOptions = {
  //   language: "vi-VN",
  //   pitch: 1.1, // Cao độ (0.5-2.0)
  //   rate: 0.9, // Tốc độ (0.1-2.0)
  //   volume: 1.0, // Âm lượng (0-1.0)
  // };

  // Reanimated values
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const opacity4 = useSharedValue(0);
  const opacityResult = useSharedValue(0);
  const owlRotation = useSharedValue(0);
  const pulsingOpacity = useSharedValue(0.5);

  const ready = useImagePreload([MELON, SAD_OWL, OWL_NORMAL, backgroundImg]);

  // Animated styles
  const textStyle1 = useAnimatedStyle(() => ({ opacity: opacity1.value }));
  const textStyle2 = useAnimatedStyle(() => ({ opacity: opacity2.value }));
  const textStyle3 = useAnimatedStyle(() => ({ opacity: opacity3.value }));
  const textStyle4 = useAnimatedStyle(() => ({ opacity: opacity4.value }));
  const resultStyle = useAnimatedStyle(() => ({
    opacity: opacityResult.value,
  }));
  const owlStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${owlRotation.value}deg` }],
  }));
  const pulsingStyle = useAnimatedStyle(() => ({
    opacity: pulsingOpacity.value,
  }));

  // Hàm đọc văn bản
  // const speak = async (text: string, options = {}) => {
  //   if (speaking) {
  //     await Speech.stop();
  //     setSpeaking(false);
  //     return;
  //   }

  //   setSpeaking(true);

  //   try {
  //     await Speech.speak(text:string, {
  //       ...speechOptions,
  //       ...options,
  //       onDone: () => setSpeaking(false),
  //       onError: () => setSpeaking(false),
  //     });

  //     // Hiệu ứng lắc lư nâng cao khi đang nói
  //     if (speaking) {
  //       // Tạo animation lắc lư tự nhiên, nhanh hơn khi nói
  //       RNAnimated.loop(
  //         RNAnimated.sequence([
  //           // Lắc qua phải + nhún xuống nhẹ khi nói
  //           RNAnimated.parallel([
  //             RNAnimated.timing(owlSwayX, {
  //               toValue: 4,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlRotate, {
  //               toValue: 0.05,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlBounceY, {
  //               toValue: 2,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlScaleY, {
  //               toValue: 0.97,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlScaleX, {
  //               toValue: 1.03,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //           ]),

  //           // Lắc qua trái + nhún lên
  //           RNAnimated.parallel([
  //             RNAnimated.timing(owlSwayX, {
  //               toValue: -4,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlRotate, {
  //               toValue: -0.05,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlBounceY, {
  //               toValue: -2,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlScaleY, {
  //               toValue: 1.03,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //             RNAnimated.timing(owlScaleX, {
  //               toValue: 0.97,
  //               duration: 200,
  //               useNativeDriver: true,
  //             }),
  //           ]),
  //         ]),
  //         { iterations: 10 }
  //       ).start();
  //     }
  //   } catch (error) {
  //     console.error("Lỗi phát âm thanh:", error);
  //     setSpeaking(false);
  //   }
  // };

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

  // Lấy câu thoại hiện tại dựa vào trạng thái
  const getCurrentMessage = () => {
    if (phase === "quiz") {
      return "Vậy Cú còn mấy miếng dưa?";
    } else if (phase === "sad" || phase === "count") {
      return "Mình buồn quá... còn mấy miếng nhỉ?";
    } else if (phase === "drop") {
      return "3 miếng bị rơi xuống sông mất tiêu ";
    } else {
      return "Mình có 7 miếng dưa hấu ngon lành ";
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);
  // Start animation sequence
  useEffect(() => {
    if (!ready) return;

    // UI animations
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

    // Bắt đầu hiệu ứng lắc lư cho chú cú
    startOwlWobble();

    // Content animations
    setMelons([0, 1, 2, 3, 4, 5, 6]);
    opacity1.value = withTiming(1, { duration: 800 });

    owlRotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 600 }),
        withTiming(5, { duration: 600 })
      ),
      -1,
      true
    );

    // Tự động đọc câu đầu tiên
    setTimeout(() => {
      speak("Mình có 7 miếng dưa hấu ngon lành");
    }, 1000);

    setTimeout(() => {
      setPhase("drop");
      setMessages((prev) => ({ ...prev, drop: true }));
      opacity2.value = withTiming(1, { duration: 800 });

      // Tự động đọc câu thứ hai
      setTimeout(() => {
        speak("3 miếng bị rơi xuống sông mất tiêu");
      }, 1000);
    }, 4000); // Tăng thời gian để đọc xong câu đầu tiên
  }, [ready, refreshKey]);

  useEffect(() => {
    if (phase === "drop") {
      setFallingMelons([4, 5, 6]);
      setTimeout(() => {
        setMelons([0, 1, 2, 3]);
        setFallingMelons([]);
        setPhase("sad");
        setMessages((prev) => ({ ...prev, sad: true }));
        opacity3.value = withTiming(1, { duration: 800 });
        owlRotation.value = 0;

        // Tự động đọc câu thứ ba
        setTimeout(() => {
          speak("Mình buồn quá... còn mấy miếng nhỉ?");
        }, 1000);
      }, 3000); // Tăng thời gian để đọc xong câu thứ hai
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "sad") {
      setTimeout(() => {
        setPhase("count");
        setMessages((prev) => ({ ...prev, count: true }));
        opacity4.value = withTiming(1, { duration: 800 });

        // Tự động đọc hướng dẫn đếm
        setTimeout(() => {
          speak("Hãy chạm vào từng miếng dưa để đếm cùng mình nhé!");
        }, 1000);
      }, 3000); // Tăng thời gian để đọc xong câu thứ ba
    }
  }, [phase]);

  // Tự động đọc khi chuyển sang phase "quiz"
  useEffect(() => {
    if (phase === "quiz") {
      setTimeout(() => {
        speak("Vậy Cú còn mấy miếng dưa?");
      }, 1000);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "count") {
      pulsingOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulsingOpacity.value = withTiming(0.5);
    }
  }, [phase]);

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

  const handleReload = async () => {
    animateButton(reloadButtonScale);

    // Dừng âm thanh trước khi reload
    await stopSpeech();

    // Reset các animation values
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
      RNAnimated.timing(characterAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset states
      setMelons([]);
      setFallingMelons([]);
      setTouched([]);
      setResult(null);
      setPhase("intro");
      setMessages({
        intro: true,
        drop: false,
        sad: false,
        count: false,
        quiz: false,
      });

      // Reset animation values
      opacity1.value = 0;
      opacity2.value = 0;
      opacity3.value = 0;
      opacity4.value = 0;
      opacityResult.value = 0;
      owlRotation.value = 0;

      setRefreshKey((prev) => prev + 1);

      // Làm sáng màn hình sau khi reset
      setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          RNAnimated.timing(characterAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
    });
  };

  interface HandleMelonPressParams {
    i: number;
  }

  const handleMelonPress = ({ i }: HandleMelonPressParams) => {
    if (touched.includes(i) || phase !== "count") return;
    setTouched([...touched, i]);

    // Đọc số khi chạm vào dưa hấu
    speak(`${touched.length + 1}`);

    if (touched.length + 1 === 4) {
      setTimeout(() => {
        setPhase("quiz");
        setMessages((prev) => ({ ...prev, quiz: true }));
      }, 1500);
    }
  };

  const handleAnswer = (val: number) => {
    if (val === 4) {
      setResult("correct");
      opacityResult.value = withTiming(1, { duration: 800 });

      // Thêm hiệu ứng vui mừng cho owl khi trả lời đúng
      owlRotation.value = withSequence(
        withTiming(-10, { duration: 200 }),
        withTiming(10, { duration: 200 }),
        withTiming(-10, { duration: 200 }),
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );

      // Đọc khen khi trả lời đúng
      speak("Đúng rồi! 7 trừ 3 bằng 4 miếng");
    } else {
      setResult("wrong");
      owlRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      // Đọc nhắc nhở khi trả lời sai
      speak("Sai rồi! Hãy thử lại nhé");

      // Reset sau 1.5s
      setTimeout(() => setResult(null), 1500);
    }
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
      </View>
    );
  }

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
                <View style={styles.speechTextContainer}>
                  <AnimatedText style={[styles.speechText, textStyle1]}>
                    {messages.intro && "Mình có 7 miếng dưa hấu ngon lành 🍉"}
                  </AnimatedText>

                  <AnimatedText style={[styles.speechText, textStyle2]}>
                    {messages.drop && "3 miếng bị rơi xuống sông mất tiêu"}
                  </AnimatedText>

                  <AnimatedText style={[styles.speechText, textStyle3]}>
                    {messages.sad && "Mình buồn quá... còn mấy miếng nhỉ?"}
                  </AnimatedText>

                  {result === "correct" && (
                    <AnimatedText style={[styles.successText, resultStyle]}>
                      Đúng rồi! 7 - 3 = 4 miếng 👍
                    </AnimatedText>
                  )}
                </View>

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
                  source={
                    phase === "sad" || phase === "count" || phase === "quiz"
                      ? SAD_OWL
                      : OWL_NORMAL
                  }
                  style={styles.characterImage}
                />
              </RNAnimated.View>
            </TouchableOpacity>
          </RNAnimated.View>

          {/* Khu vực chính */}
          <RNAnimated.View
            style={[styles.mainContentCard, { opacity: contentOpacity }]}
          >
            <Shadow
              distance={5}
              startColor="rgba(0,0,0,0.1)"
              style={styles.mainContentCardInner}
            >
              <View style={styles.contentContainer}>
                {/* Khu vực dưa hấu */}
                <View style={styles.melonsContainer}>
                  {melons.map((i) => (
                    <AnimatedMelon
                      key={`melon-${i}`}
                      index={i}
                      delay={i * 150}
                      onPress={() => handleMelonPress({ i })}
                      disabled={phase !== "count"}
                      highlight={touched.includes(i)}
                      falling={fallingMelons.includes(i)}
                    />
                  ))}
                </View>
                {messages.count && phase === "count" && touched.length < 1 && (
                  <AnimatedText
                    style={[styles.instructionText, textStyle4, pulsingStyle]}
                  >
                    Hãy chạm vào từng quả để đếm cùng mình nhé!
                  </AnimatedText>
                )}
                {/* Số đếm ở giữa */}
                {phase === "count" && touched.length > 0 && (
                  <CountBadge count={touched.length} />
                )}

                {/* Khu vực câu hỏi */}
                {phase === "quiz" && (
                  <View style={styles.quizContainer}>
                    <Shadow
                      distance={4}
                      startColor="rgba(0,0,0,0.1)"
                      style={styles.quizContentWrapper}
                    >
                      <View style={styles.quizContent}>
                        <Text style={styles.quizTitle}>
                          Vậy Cú còn mấy miếng dưa?
                        </Text>
                        <TouchableOpacity
                          style={styles.equation}
                          onPress={async () => await speak("7 trừ 3 bằng mấy?")}
                        >
                          <Text style={styles.equationText}>7 - 3 = ?</Text>
                          <FontAwesome5
                            name="volume-up"
                            size={16}
                            color="#1976D2"
                            style={styles.equationSpeakIcon}
                          />
                        </TouchableOpacity>

                        <View style={styles.answerOptions}>
                          {[5, 4, 3].map((v) => (
                            <AnswerButton
                              key={v}
                              value={v}
                              onPress={handleAnswer}
                              result={result}
                              correct={4}
                            />
                          ))}
                        </View>
                      </View>
                    </Shadow>
                  </View>
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

            {/* Nút tiếp theo - chỉ bật khi trả lời đúng */}
            <RNAnimated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonScale }] },
              ]}
            >
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
            </RNAnimated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default SubtractMelonScene;

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
    minHeight: 130,
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
  speechTextContainer: {
    gap: 8,
  },
  speechText: {
    fontSize: 15,
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
  instructionText: {
    fontSize: 15,
    color: "#E91E63",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  successText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 5,
  },
  mainContentCard: {
    flex: 1,
    marginVertical: 10,
  },
  mainContentCardInner: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    width: "100%",
    height: "100%",
    position: "relative",
  },
  melonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    minHeight: 130,
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "rgba(255, 248, 225, 0.5)",
    borderRadius: 12,
    padding: 12,
  },
  melonWrapper: {
    margin: 4,
  },
  melonInner: {
    borderRadius: 25,
    padding: 5,
    alignItems: "center",
  },
  melon: {
    width: 48,
    height: 48,
  },
  melonCount: {
    marginTop: 2,
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  highlight: {
    backgroundColor: "rgba(255, 249, 196, 0.8)",
    borderRadius: 25,
  },
  countBadge: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  countBadgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
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
    marginTop: 20,
    alignItems: "center",
  },
  quizContentWrapper: {
    borderRadius: 16,
    width: "100%",
  },
  quizContent: {
    backgroundColor: "rgba(255, 248, 225, 0.8)",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
    paddingTop: -5,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 10,
  },
  equation: {
    backgroundColor: "#EEEEEE",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(25, 118, 210, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  equationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976D2",
  },
  equationSpeakIcon: {
    marginLeft: 10,
  },
  answerOptions: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    marginVertical: 10,
  },
  answerBtn: {
    backgroundColor: "#FFD54F",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  answerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5D4037",
  },
  correctAnswer: {
    backgroundColor: "#4CAF50",
  },
  wrongAnswer: {
    backgroundColor: "#E0E0E0",
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
  disabledButton: {
    opacity: 0.5,
    elevation: 0,
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
