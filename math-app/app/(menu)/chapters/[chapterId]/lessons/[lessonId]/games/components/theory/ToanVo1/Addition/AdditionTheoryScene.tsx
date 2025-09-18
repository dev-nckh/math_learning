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
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Animated,
  Easing,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const { width } = Dimensions.get("window");

const QUE_10 = require("../../../../../../../../../../../assets/images/ToanVo/images/10sticks.png");
const QUE_1 = require("../../../../../../../../../../../assets/images/ToanVo/images/1stick.png");
const MANGO = require("../../../../../../../../../../../assets/images/ToanVo/images/mango.png");
const backgroundImg = require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg");
// Thêm hình ảnh chú cú
const OWL_TEACHER_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/owl.png");

// Ví dụ phép cộng đơn giản
const ADDITION_EXAMPLE = {
  a: 3,
  b: 4,
  result: 7,
};

// Ví dụ tính chất giao hoán
const COMMUTATIVE_EXAMPLE = {
  a: 4,
  b: 3,
  result: 7,
};

interface AdditionTheorySceneProps {
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
export default function AdditionTheoryScene({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: AdditionTheorySceneProps) {
  const [screenKey, setScreenKey] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [currentSection, setCurrentSection] = useState("intro"); // "intro", "term1", "term2", "commutative", "tips"
  type OwlPosition = "top" | "middle" | "bottom" | "tips";
  const [owlPosition, setOwlPosition] = useState<OwlPosition>("top"); // "top", "middle", "bottom", "tips"

  // Animated values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const reloadButtonScale = useRef(new Animated.Value(1)).current;
  const characterAnim = useRef(new Animated.Value(0)).current;

  // Thêm animation refs cho hiệu ứng lắc lư chú cú
  const owlSwayX = useRef(new Animated.Value(0)).current;
  const owlRotate = useRef(new Animated.Value(0)).current;
  const owlBounceY = useRef(new Animated.Value(0)).current;
  const owlScaleX = useRef(new Animated.Value(1)).current;
  const owlScaleY = useRef(new Animated.Value(1)).current;
  const owlPositionY = useRef(new Animated.Value(0)).current;

  // Ref cho ScrollView để có thể tự động cuộn
  const scrollViewRef = useRef<ScrollView>(null);

  // Cấu hình giọng nói
  const speechOptions = {
    language: "vi-VN",
    pitch: 1.0, // Cao độ (0.5-2.0)
    rate: 0.8, // Tốc độ chậm để trẻ hiểu rõ (0.1-2.0)
    volume: 1.0, // Âm lượng (0-1.0)
  };

  // Hàm đọc văn bản
  const speak = async (
    text: string,
    options: object = {},
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
  interface ShakeOwlFn {
    (message: string): void;
  }

  const shakeOwl: ShakeOwlFn = (message) => {
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

  // Hàm di chuyển chú cú từ phần số hạng xuống phần tổng
  const moveOwlToTerm2 = () => {
    moveOwlToPosition("middle", 150, 1500, () => {
      // Lắc nhẹ khi đến vị trí mới
      shakeOwl(
        "Tổng là kết quả của phép cộng, là số lượng khi đã ghép các nhóm lại. Trong phép cộng 5 + 2 = 7. Tổng ở đây là 7"
      );
    });
  };

  // Hàm di chuyển chú cú từ phần tổng xuống phần tính chất giao hoán
  const moveOwlToCommutative = () => {
    moveOwlToPosition("bottom", 0, 1500, () => {
      // Đọc phần tính chất giao hoán
      setTimeout(() => {
        shakeOwl(
          "Phép cộng có tính chất giao hoán: thứ tự các số hạng có thể đổi chỗ mà không làm thay đổi tổng. Ở đây ví dụ chúng ta có, 3 quả xoài + 4 quả xoài sẽ bằng 7 và khi chúng ta thay đổi vị trí các số hạng với nhau, 4 quả xoài + 3 quả xoài thì kết quả vẫn bằng 7 quả xoài."
        );
      }, 1000);
    });
  };

  // Hàm di chuyển chú cú đến phần mẹo học
  const moveOwlToTips = () => {
    moveOwlToPosition("tips", 150, 1500, () => {
      // Đọc phần mẹo học
      setTimeout(() => {
        shakeOwl(
          "Để học phép cộng tốt hơn, các bạn hãy nhớ một số mẹo sau: Phép cộng các số có thứ tự thay đổi được, phép cộng với số 0 vẫn giữ nguyên giá trị ban đầu, và khi tính tổng các số, bạn có thể cộng theo nhóm để dễ dàng hơn."
        );
      }, 1000);
    });
  };

  // Thêm một hàm di chuyển chú cú tới vị trí bất kỳ
  const moveOwlToPosition = (
    position: OwlPosition,
    yOffset: number = 0,
    duration: number = 1000,
    callback?: () => void
  ) => {
    // Cuộn màn hình nếu cần
    if (scrollViewRef.current && OWL_SCROLL_POSITIONS[position] !== undefined) {
      scrollViewRef.current.scrollTo({
        y: OWL_SCROLL_POSITIONS[position],
        animated: true,
      });
    }

    // Hiệu ứng bay đến vị trí mới
    Animated.timing(owlPositionY, {
      toValue: yOffset,
      duration: duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOwlPosition(position); // Cập nhật vị trí hiện tại
      owlPositionY.setValue(0); // Reset lại giá trị để sẵn sàng cho di chuyển tiếp theo

      if (callback) callback();
    });
  };

  // Animation khi load trang và theo dõi thay đổi vị trí
  useEffect(() => {
    let mounted = true;

    // Animation khi load trang
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

    // Bắt đầu đọc phần giới thiệu sau khi màn hình hiển thị
    setTimeout(() => {
      if (mounted) {
        setCurrentSection("term1");
        shakeOwl(
          "Các số tham gia vào phép cộng được gọi là các số hạng. Và ví dụ trong phép cộng 5 + 2 = 7. Chúng ta có số hạng là 5 và 2"
        );

        // Sau khi đọc xong phần số hạng, di chuyển xuống phần tổng
        setTimeout(() => {
          if (mounted) {
            moveOwlToTerm2();
            setCurrentSection("term2");

            // Sau khi đọc xong phần tổng, di chuyển xuống phần tính chất giao hoán
            setTimeout(() => {
              if (mounted) {
                moveOwlToCommutative();
                setCurrentSection("commutative");

                // Sau khi đọc xong phần tính chất giao hoán, di chuyển xuống phần mẹo học
                setTimeout(() => {
                  if (mounted) {
                    moveOwlToTips();
                    setCurrentSection("tips");
                  }
                }, 27000); // Đợi đọc xong phần tính chất giao hoán
              }
            }, 12000); // Đợi đọc xong phần tổng
          }
        }, 12000); // Đợi đọc xong phần số hạng
      }
    }, 1500);

    return () => {
      mounted = false;
      // Dừng âm thanh khi unmount component
      Speech.stop();
    };
  }, [screenKey]);

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

  // Xử lý nút tải lại
  const handleReload = () => {
    animateButton(reloadButtonScale);

    // Dừng âm thanh hiện tại
    Speech.stop();
    setSpeaking(false);

    // Reset các animation values
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);
    owlPositionY.setValue(0);

    // Fade out
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setScreenKey((prev) => prev + 1);
      setCurrentSection("intro");
      setOwlPosition("top");

      // Cuộn lại về đầu trang
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: 0,
          animated: false,
        });
      }

      // Fade in
      setTimeout(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 100);
    });
  };

  // Hàm lấy văn bản dựa trên vị trí hiện tại của chú cú
  const getCurrentMessage = () => {
    switch (currentSection) {
      case "term1":
        return "Các số tham gia vào phép cộng được gọi là các số hạng.";
      case "term2":
        return "Tổng là kết quả của phép cộng, là số lượng khi đã ghép các nhóm lại.";
      case "commutative":
        return "Phép cộng có tính chất giao hoán: thứ tự các số hạng có thể đổi chỗ mà không làm thay đổi tổng.";
      case "tips":
        return "Để học phép cộng tốt hơn, các bạn hãy nhớ một số mẹo sau: Phép cộng các số có thứ tự thay đổi được, phép cộng với số 0 vẫn giữ nguyên giá trị ban đầu, và khi tính tổng các số, bạn có thể cộng theo nhóm để dễ dàng hơn.";
      default:
        return "Chào mừng bạn đến với lý thuyết về phép cộng!";
    }
  };
  // Thay thế vị trí cố định bằng đối tượng cấu hình vị trí
  const OWL_POSITIONS: Record<OwlPosition, { right: number; top: number }> = {
    top: { right: -20, top: 150 },
    middle: { right: -20, top: 300 },
    bottom: { right: -20, top: 250 },
    tips: { right: -30, top: 420 }, // Thêm vị trí cho phần mẹo học
  };

  // Tạo mapping riêng cho scroll positions nếu cần cuộn
  const OWL_SCROLL_POSITIONS: Record<OwlPosition, number> = {
    top: 0,
    middle: 0,
    bottom: 280,
    tips: 450, // Vị trí cuộn đến phần mẹo học
  };

  // Chú cú sẽ hiển thị ở vị trí khác nhau tùy theo state
  const renderOwl = () => {
    const position = OWL_POSITIONS[owlPosition] || OWL_POSITIONS.top;

    return (
      <Animated.View
        style={[
          styles.owlContainer,
          {
            position: "absolute",
            right: position.right,
            top: position.top,
            opacity: characterAnim,
            transform: [
              { translateX: owlSwayX },
              { translateY: Animated.add(owlBounceY, owlPositionY) },
              {
                rotate: owlRotate.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ["-1rad", "0rad", "1rad"],
                }),
              },
              { scaleX: owlScaleX },
              { scaleY: owlScaleY },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => shakeOwl(getCurrentMessage())}
          activeOpacity={0.8}
        >
          <Image source={OWL_TEACHER_IMAGE} style={styles.owlImage} />
        </TouchableOpacity>
      </Animated.View>
    );
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
        `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/components/theory/ToanVo1/Addition/AddStepByStepScene`
      );
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
              <Text style={styles.titleText}>Lý thuyết về phép cộng</Text>

              {/* Thêm nút phát lại lời giới thiệu */}
              <TouchableOpacity
                style={styles.speakAgainButton}
                onPress={() =>
                  speak("Chào mừng bạn đến với lý thuyết về phép cộng!")
                }
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name={speaking ? "volume-up" : "volume-up"}
                  size={16}
                  color={speaking ? "#1565C0" : "white"}
                  style={speaking ? styles.speakingIcon : {}}
                />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Nội dung chính */}
          <Animated.View
            style={[styles.contentWrapper, { opacity: contentOpacity }]}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Thuật ngữ trong phép cộng */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={styles.sectionCard}
                >
                  <Text style={styles.sectionTitle}>
                    Thuật ngữ trong phép cộng
                  </Text>

                  <View
                    style={[
                      styles.termContainer,
                      currentSection === "term1" && styles.activeTermContainer,
                    ]}
                  >
                    <LinearGradient
                      colors={["#FFE0B2", "#FFCC80"]}
                      style={styles.termHeader}
                    >
                      <Text style={styles.termTitle}>Số hạng</Text>
                      {/* Icon loa */}
                      <TouchableOpacity
                        style={styles.speakerIconContainer}
                        onPress={() =>
                          speak(
                            "Các số tham gia vào phép cộng được gọi là các số hạng."
                          )
                        }
                      >
                        <FontAwesome5
                          name="volume-up"
                          size={14}
                          color="#FF6B95"
                          style={styles.speakerIcon}
                        />
                      </TouchableOpacity>
                    </LinearGradient>
                    <Text style={styles.termText}>
                      Các số tham gia vào phép cộng được gọi là các số hạng.
                    </Text>
                    <Text style={styles.termExample}>
                      Trong phép cộng 5 + 2 = 7, số hạng là 5 và 2
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.termContainer,
                      currentSection === "term2" && styles.activeTermContainer,
                    ]}
                  >
                    <LinearGradient
                      colors={["#FFE0B2", "#FFCC80"]}
                      style={styles.termHeader}
                    >
                      <Text style={styles.termTitle}>Tổng</Text>
                      {/* Icon loa */}
                      <TouchableOpacity
                        style={styles.speakerIconContainer}
                        onPress={() =>
                          speak(
                            "Tổng là kết quả của phép cộng, là số lượng khi đã ghép các nhóm lại."
                          )
                        }
                      >
                        <FontAwesome5
                          name="volume-up"
                          size={14}
                          color="#FF6B95"
                          style={styles.speakerIcon}
                        />
                      </TouchableOpacity>
                    </LinearGradient>
                    <Text style={styles.termText}>
                      Tổng là kết quả của phép cộng, là số lượng khi đã ghép các
                      nhóm lại.
                    </Text>
                    <Text style={styles.termExample}>
                      Trong phép cộng 5 + 2 = 7, tổng là 7
                    </Text>
                  </View>
                </LinearGradient>
              </Shadow>

              {/* Tính chất giao hoán */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={[
                    styles.sectionCard,
                    currentSection === "commutative" &&
                      styles.activeSectionCard,
                  ]}
                >
                  <Text style={styles.sectionTitle}>Tính chất giao hoán</Text>
                  <View style={styles.termHeader}>
                    <Text style={styles.sectionText}>
                      Phép cộng có tính chất giao hoán: thứ tự các số hạng có
                      thể đổi chỗ mà không làm thay đổi tổng.
                    </Text>
                    {/* Icon loa */}
                    <TouchableOpacity
                      style={[
                        styles.speakerIconContainer,
                        { top: 5, right: 5 },
                      ]}
                      onPress={() =>
                        speak(
                          "Phép cộng có tính chất giao hoán: thứ tự các số hạng có thể đổi chỗ mà không làm thay đổi tổng."
                        )
                      }
                    >
                      <FontAwesome5
                        name="volume-up"
                        size={14}
                        color="#FF6B95"
                        style={styles.speakerIcon}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commutativeExample}>
                    <View style={styles.equationWrapper}>
                      <Text style={styles.equationText}>
                        {ADDITION_EXAMPLE.a} + {ADDITION_EXAMPLE.b} ={" "}
                        {ADDITION_EXAMPLE.result}
                      </Text>
                      <View style={styles.equationImages}>
                        <View style={styles.equationGroup}>
                          {Array.from({ length: ADDITION_EXAMPLE.a }).map(
                            (_, i) => (
                              <Image
                                key={`comm1-a-${i}`}
                                source={MANGO}
                                style={[styles.smallFruit, styles.firstGroup]}
                                resizeMode="contain"
                              />
                            )
                          )}
                        </View>
                        <Text style={styles.smallPlus}>+</Text>
                        <View style={styles.equationGroup}>
                          {Array.from({ length: ADDITION_EXAMPLE.b }).map(
                            (_, i) => (
                              <Image
                                key={`comm1-b-${i}`}
                                source={MANGO}
                                style={[styles.smallFruit, styles.secondGroup]}
                                resizeMode="contain"
                              />
                            )
                          )}
                        </View>
                      </View>
                    </View>

                    <Text style={styles.equalsText}>tương đương với</Text>

                    <View style={styles.equationWrapper}>
                      <Text style={styles.equationText}>
                        {COMMUTATIVE_EXAMPLE.a} + {COMMUTATIVE_EXAMPLE.b} ={" "}
                        {COMMUTATIVE_EXAMPLE.result}
                      </Text>
                      <View style={styles.equationImages}>
                        <View style={styles.equationGroup}>
                          {Array.from({ length: COMMUTATIVE_EXAMPLE.a }).map(
                            (_, i) => (
                              <Image
                                key={`comm2-a-${i}`}
                                source={MANGO}
                                style={[styles.smallFruit, styles.secondGroup]}
                                resizeMode="contain"
                              />
                            )
                          )}
                        </View>
                        <Text style={styles.smallPlus}>+</Text>
                        <View style={styles.equationGroup}>
                          {Array.from({ length: COMMUTATIVE_EXAMPLE.b }).map(
                            (_, i) => (
                              <Image
                                key={`comm2-b-${i}`}
                                source={MANGO}
                                style={[styles.smallFruit, styles.firstGroup]}
                                resizeMode="contain"
                              />
                            )
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Shadow>

              {/* Thêm mẹo học phép cộng */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={[
                    styles.sectionCard,
                    currentSection === "tips" && styles.activeSectionCard,
                  ]}
                >
                  <Text style={styles.sectionTitle}>Mẹo học phép cộng</Text>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#FF6D00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>1</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Tính chất giao hoán: Thứ tự các số hạng có thể đổi chỗ mà
                      không làm thay đổi tổng. Ví dụ: 2 + 3 = 3 + 2
                    </Text>
                  </View>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#FF6D00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>2</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Phép cộng với 0: Bất kỳ số nào cộng với 0 thì kết quả vẫn
                      là số đó. Ví dụ: 5 + 0 = 5
                    </Text>
                  </View>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#FF9800", "#FF6D00"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>3</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Cộng theo nhóm: Khi phải cộng nhiều số, bạn có thể nhóm
                      các số lại để dễ tính hơn. Ví dụ: 3 + 7 + 5 = 10 + 5 = 15
                    </Text>
                  </View>

                  {/* Icon loa cho phần mẹo học */}
                  <TouchableOpacity
                    style={styles.tipSpeakerContainer}
                    onPress={() =>
                      speak(
                        "Để học phép cộng tốt hơn, các bạn hãy nhớ một số mẹo sau: Phép cộng các số có thứ tự thay đổi được, phép cộng với số 0 vẫn giữ nguyên giá trị ban đầu, và khi tính tổng các số, bạn có thể cộng theo nhóm để dễ dàng hơn."
                      )
                    }
                  >
                    <FontAwesome5
                      name="volume-up"
                      size={16}
                      color="#FF6B95"
                      style={speaking ? styles.speakingIcon : {}}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              </Shadow>
            </ScrollView>
          </Animated.View>

          {/* Render chú cú ở vị trí hiện tại */}
          {renderOwl()}

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
                <Text style={styles.buttonLabel}></Text>
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
                  <Text style={styles.mainButtonText}></Text>
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
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#B721FF", "#21D4FD"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-right" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.buttonLabel}></Text>
              </TouchableOpacity>
            </Animated.View>
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
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    position: "relative", // Để có thể position chú cú
    minHeight: 1000, // Đảm bảo có đủ không gian để chú cú bay xuống
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  titleGradient: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: "row", // Thêm flexDirection để chứa cả text và nút
    alignItems: "center", // Căn giữa theo chiều dọc
    justifyContent: "center", // Căn giữa theo chiều ngang
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  speakAgainButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  cardShadow: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 12,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.1)",
  },
  activeSectionCard: {
    borderWidth: 2,
    borderColor: "#FF9800",
    transform: [{ scale: 1.01 }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionText: {
    fontSize: 15,
    color: "#5D4037",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
    flex: 1, // Để có thể đặt icon loa bên cạnh
    paddingRight: 30, // Tạo khoảng trống cho icon
  },
  // Ví dụ phép cộng
  exampleContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 12,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
    textAlign: "center",
    marginBottom: 5,
  },
  exampleSubtitle: {
    fontSize: 14,
    color: "#FF5722",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  visualContainer: {
    alignItems: "center",
  },
  visualGroup: {
    marginBottom: 8,
    width: "100%",
  },
  visualLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 5,
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 5,
  },
  fruitImage: {
    width: 40,
    height: 40,
    marginHorizontal: 3,
  },
  firstGroup: {
    tintColor: "#EF6C00",
  },
  secondGroup: {
    tintColor: "#2E7D32",
  },
  plusSign: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E65100",
    marginVertical: 5,
  },
  resultLine: {
    height: 2,
    backgroundColor: "#E65100",
    width: "80%",
    marginVertical: 10,
  },
  // Thuật ngữ
  termContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  activeTermContainer: {
    borderWidth: 2,
    borderColor: "#FF9800",
    transform: [{ scale: 1.02 }],
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  termHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: "relative", // Để đặt icon loa
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  termTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
    textAlign: "center",
  },
  termText: {
    fontSize: 15,
    color: "#5D4037",
    padding: 10,
    backgroundColor: "white",
  },
  termExample: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#FF5722",
    padding: 10,
    backgroundColor: "#FFF8E1",
    textAlign: "center",
  },
  // Tính chất giao hoán
  commutativeExample: {
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 12,
  },
  equationWrapper: {
    alignItems: "center",
    marginVertical: 5,
  },
  equationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 8,
  },
  equationImages: {
    flexDirection: "row",
    alignItems: "center",
  },
  equationGroup: {
    flexDirection: "row",
    marginHorizontal: 5,
  },
  smallFruit: {
    width: 30,
    height: 30,
    marginHorizontal: 2,
    zIndex: 100,
  },
  smallPlus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginHorizontal: 5,
  },
  equalsText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5D4037",
    marginVertical: 8,
  },
  // Chú cú
  owlContainer: {
    zIndex: 100,
  },
  owlImage: {
    width: 100,
    height: 100,
  },
  speakingIcon: {
    color: "#FF6B95",
  },
  speakerIconContainer: {
    position: "absolute",
    right: 8,
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
  // Mẹo học
  tipItem: {
    flexDirection: "row",
    marginBottom: 15,
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
    fontSize: 14,
  },
  tipText: {
    fontSize: 15,
    color: "#5D4037",
    flex: 1,
    lineHeight: 22,
  },
  tipSpeakerContainer: {
    alignSelf: "flex-end",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 242, 229, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
