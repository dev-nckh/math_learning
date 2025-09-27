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

const QUE_1 = require("../../../../../../../../../../../assets/images/ToanVo/images/1stick.png");
const APPLE = require("../../../../../../../../../../../assets/images/ToanVo/images/apple.png");
const backgroundImg = require("../../../../../../../../../../../assets/images/ToanVo/images/bg.jpg");
// Thêm hình ảnh chú cú
const OWL_TEACHER_IMAGE = require("../../../../../../../../../../../assets/images/ToanVo/images/owl.png");

// Các vị trí chú cú
const OWL_POSITIONS: Record<
  "top" | "middle" | "bottom" | "example" | "tips",
  { right: number; top: number; scrollTo?: number }
> = {
  top: { right: -20, top: 150 },
  middle: { right: -20, top: 270 },
  bottom: { right: -20, top: 420 },
  example: { right: -20, top: 150, scrollTo: 350 },
  tips: { right: -20, top: 420, scrollTo: 650 },
};

// Các thuật ngữ trong phép trừ (đã bỏ "Phép trừ là gì")
const SUBTRACTION_TERMS = [
  {
    title: "Số bị trừ",
    description: "Số bị trừ là số ban đầu, số lớn hơn trong phép trừ.",
    example: "Trong phép trừ 7 - 4 = 3, số bị trừ là 7",
  },
  {
    title: "Số trừ",
    description: "Số trừ là số lấy đi từ số bị trừ.",
    example: "Trong phép trừ 7 - 4 = 3, số trừ là 4",
  },
  {
    title: "Hiệu số",
    description: "Hiệu số là kết quả của phép trừ, là số còn lại.",
    example: "Trong phép trừ 7 - 4 = 3, hiệu số là 3",
  },
];

// Các ví dụ phép trừ trực quan
const SUBTRACTION_EXAMPLES = [
  { a: 9, b: 3, result: 6 },
  { a: 8, b: 5, result: 3 },
  { a: 10, b: 4, result: 6 },
];

interface SubtractionTheorySceneProps {
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
export default function SubtractionTheoryScene({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: SubtractionTheorySceneProps) {
  const [screenKey, setScreenKey] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [currentSection, setCurrentSection] = useState("intro"); // "intro", "term1", "term2", "term3", "example"
  const [owlPosition, setOwlPosition] = useState<
    "top" | "middle" | "bottom" | "example" | "tips"
  >("top");

  // Animated values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const reloadButtonScale = useRef(new Animated.Value(1)).current;
  const characterAnim = useRef(new Animated.Value(0)).current;

  // Animated values cho các hiệu ứng trực quan
  const appleOpacity = useRef(new Animated.Value(1)).current;
  const removedAppleOpacity = useRef(new Animated.Value(1)).current;
  const highlightColor = useRef(new Animated.Value(0)).current;

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
    pitch: 1.0,
    rate: 0.8, // Tốc độ chậm để trẻ hiểu rõ
    volume: 1.0,
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

  // Hàm di chuyển chú cú đến vị trí mới
  const moveOwlToPosition = (
    position: keyof typeof OWL_POSITIONS,
    yOffset: number = 200,
    duration: number = 1000,
    callback?: () => void
  ) => {
    // Cuộn màn hình nếu cần
    if (scrollViewRef.current && OWL_POSITIONS[position].scrollTo) {
      scrollViewRef.current.scrollTo({
        y: OWL_POSITIONS[position].scrollTo,
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

  // Hiệu ứng trực quan cho phép trừ
  const animateSubtraction = () => {
    const example = SUBTRACTION_EXAMPLES[currentExample];
    speak(
      `Hãy cùng xem ví dụ trừ ${example.a} trừ ${example.b} bằng ${example.result}. Ban đầu, chúng ta có ${example.a} quả táo.`
    );

    // Sau đó làm mờ dần các quả táo bị lấy đi
    setTimeout(() => {
      Animated.sequence([
        // Highlight phần bị lấy đi
        Animated.timing(highlightColor, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        // Làm mờ dần các quả táo bị lấy đi
        Animated.timing(removedAppleOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        speak(
          `Sau đó, chúng ta lấy đi ${example.b} quả táo. Kết quả còn lại là ${example.result} quả táo.`
        );
      });
    }, 5000);
  };

  // Animation khi load trang
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

    // Đọc giới thiệu sau khi trang được tải
    setTimeout(() => {
      if (mounted) {
        shakeOwl(
          "Hãy cùng tìm hiểu về phép trừ và các thuật ngữ trong phép trừ nhé!"
        );

        // Sau khi đọc xong giới thiệu, đọc lần lượt các phần
        setTimeout(() => {
          if (mounted) {
            setCurrentSection("term1");
            shakeOwl(
              "Số bị trừ là số ban đầu, số lớn hơn trong phép trừ. Trong phép trừ 7 trừ 4 bằng 3, số bị trừ là 7."
            );

            // Chuyển sang phần số trừ
            setTimeout(() => {
              if (mounted) {
                setCurrentSection("term2");
                moveOwlToPosition("middle", 150, 1500, () => {
                  shakeOwl(
                    "Số trừ là số lấy đi từ số bị trừ. Trong phép trừ 7 trừ 4 bằng 3, số trừ là 4."
                  );
                });

                // Chuyển sang phần hiệu số
                setTimeout(() => {
                  if (mounted) {
                    setCurrentSection("term3");
                    moveOwlToPosition("bottom", 270, 1500, () => {
                      shakeOwl(
                        "Hiệu số là kết quả của phép trừ, là số còn lại. Trong phép trừ 7 trừ 4 bằng 3, hiệu số là 3."
                      );
                    });

                    // Chuyển sang phần ví dụ trực quan
                    setTimeout(() => {
                      if (mounted) {
                        setCurrentSection("example");
                        moveOwlToPosition("example", 150, 1500, () => {
                          if (scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({
                              y: 500, // Điểm xấp xỉ để cuộn đến phần ví dụ
                              animated: true,
                            });
                          }

                          // Thực hiện hiệu ứng cho phần ví dụ
                          animateSubtraction();
                        });
                      }

                      // Chuyển sang phần mẹo học
                      setTimeout(() => {
                        if (mounted) {
                          setCurrentSection("tips");
                          moveOwlToPosition("tips", 420, 1500, () => {
                            shakeOwl(
                              "Hãy xem qua một số mẹo học phép trừ. Mẹo số 1: Luôn nhớ rằng số bị trừ luôn lớn hơn hoặc bằng số trừ. Mẹo số 2. Nếu số bị trừ và số trừ bằng nhau, hiệu số luôn bằng 0. Mẹo số 3, bất kỳ số nào trừ đi 0 thì kết quả vẫn là số đó."
                            );
                          });
                        }
                      }, 17000); // Sau khi đọc xong phần ví dụ
                    }, 10000); // Thời gian đợi để đọc xong phần hiệu số
                  }
                }, 10000); // Thời gian đợi để đọc xong phần số trừ
              }
            }, 10000); // Thời gian đợi để đọc xong phần số bị trừ
          }
        }, 6000); // Thời gian đợi để đọc xong phần giới thiệu
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

  // Hàm chuyển qua ví dụ mới
  const showNextExample = () => {
    // Reset các animation values
    removedAppleOpacity.setValue(1);
    highlightColor.setValue(0);

    // Thay đổi ví dụ hiện tại
    setCurrentExample((prev) => (prev + 1) % SUBTRACTION_EXAMPLES.length);

    // Sau một khoảng thời gian ngắn, thực hiện hiệu ứng mới
    setTimeout(() => {
      animateSubtraction();
    }, 500);
  };

  // Xử lý nút tải lại
  const handleReload = () => {
    animateButton(reloadButtonScale);

    // Dừng âm thanh hiện tại
    Speech.stop();
    setSpeaking(false);

    // Reset các animation values
    removedAppleOpacity.setValue(1);
    highlightColor.setValue(0);
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
      setCurrentExample(0);
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
        return "Số bị trừ là số ban đầu, số lớn hơn trong phép trừ. Trong phép trừ 7 trừ 4 bằng 3, số bị trừ là 7.";
      case "term2":
        return "Số trừ là số lấy đi từ số bị trừ. Trong phép trừ 7 trừ 4 bằng 3, số trừ là 4.";
      case "term3":
        return "Hiệu số là kết quả của phép trừ, là số còn lại. Trong phép trừ 7 trừ 4 bằng 3, hiệu số là 3.";
      case "example":
        const example = SUBTRACTION_EXAMPLES[currentExample];
        return `Phép trừ ${example.a} trừ ${example.b} bằng ${example.result}. Ban đầu có ${example.a} quả táo, lấy đi ${example.b} quả táo, còn lại ${example.result} quả táo.`;
      case "tips":
        return "Một số mẹo học phép trừ: Luôn nhớ rằng số bị trừ, tức là số đầu tiên, luôn lớn hơn hoặc bằng số trừ. Nếu số bị trừ và số trừ bằng nhau, hiệu số luôn bằng 0. Và bất kỳ số nào trừ đi 0 thì kết quả vẫn là số đó.";
      default:
        return "Hãy cùng tìm hiểu về phép trừ và các thuật ngữ trong phép trừ nhé!";
    }
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

  // Render ví dụ phép trừ trực quan
  const renderSubtractionExample = () => {
    const example = SUBTRACTION_EXAMPLES[currentExample];

    // Màu highlight dựa trên giá trị animation
    const highlightColorValue = highlightColor.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(33, 150, 243, 0)", "rgba(244, 67, 54, 0.2)"],
    });
    return (
      <Shadow
        distance={5}
        startColor="rgba(0,0,0,0.1)"
        style={styles.exampleCardShadow}
      >
        <View style={styles.exampleCard}>
          <LinearGradient
            colors={["#E3F2FD", "#BBDEFB"]}
            style={styles.exampleHeader}
          >
            <Text style={styles.exampleText}>
              {example.a} - {example.b} = {example.result}
            </Text>

            {/* Icon loa */}
            <TouchableOpacity
              style={styles.exampleSpeakerIcon}
              onPress={() =>
                speak(
                  `Phép trừ ${example.a} trừ ${example.b} bằng ${example.result}. Ban đầu có ${example.a} quả táo, lấy đi ${example.b} quả táo, còn lại ${example.result} quả táo.`
                )
              }
            >
              <FontAwesome5
                name="volume-up"
                size={18}
                color="#1565C0"
                style={speaking ? styles.speakingIcon : {}}
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.visualization}>
            {/* Số bị trừ */}
            <View style={styles.visualRow}>
              <Text style={styles.visualLabel}>Ban đầu:</Text>
              <View style={styles.sticksContainer}>
                {Array.from({ length: example.a }).map((_, i) => (
                  <Animated.Image
                    key={`original-${i}`}
                    source={APPLE}
                    style={[
                      styles.stickImage,
                      i >= example.a - example.b && {
                        opacity: removedAppleOpacity,
                      },
                    ]}
                    resizeMode="contain"
                  />
                ))}
              </View>
            </View>

            {/* Số trừ */}
            <View style={styles.visualRow}>
              <Text style={styles.visualLabel}>Lấy đi:</Text>
              <Animated.View
                style={[
                  styles.sticksContainer,
                  { backgroundColor: highlightColorValue },
                ]}
              >
                {Array.from({ length: example.b }).map((_, i) => (
                  <Animated.Image
                    key={`removed-${i}`}
                    source={APPLE}
                    style={[
                      styles.stickImage,
                      styles.stickRemoved,
                      { opacity: removedAppleOpacity },
                    ]}
                    resizeMode="contain"
                  />
                ))}
              </Animated.View>
            </View>

            {/* Hiệu số */}
            <View style={styles.visualRow}>
              <Text style={styles.visualLabel}>Còn lại:</Text>
              <View style={styles.sticksContainer}>
                {Array.from({ length: example.result }).map((_, i) => (
                  <Image
                    key={`result-${i}`}
                    source={APPLE}
                    style={styles.stickImage}
                    resizeMode="contain"
                  />
                ))}
              </View>
            </View>

            {/* Nút chuyển qua ví dụ tiếp theo */}
            <TouchableOpacity
              style={styles.nextExampleButton}
              onPress={showNextExample}
            >
              <Text style={styles.nextExampleButtonText}>Ví dụ tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Shadow>
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
        `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/components/theory/ToanVo1/Subtraction/SubtractionStepByStepScene`
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
              colors={["#2196F3", "#1565C0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.titleText}>Lý thuyết về phép trừ</Text>

              {/* Nút phát lại lời giới thiệu */}
              <TouchableOpacity
                style={styles.speakAgainButton}
                onPress={() =>
                  speak(
                    "Hãy cùng tìm hiểu về phép trừ và các thuật ngữ trong phép trừ nhé!"
                  )
                }
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name={speaking ? "volume-up" : "volume-up"}
                  size={16}
                  color={speaking ? "#FF6B95" : "white"}
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
              {/* Thuật ngữ trong phép trừ */}
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
                    Thuật ngữ trong phép trừ
                  </Text>

                  {SUBTRACTION_TERMS.map((term, index) => (
                    <View
                      key={index}
                      style={[
                        styles.termContainer,
                        currentSection === `term${index + 1}` &&
                          styles.activeTermContainer,
                      ]}
                    >
                      <LinearGradient
                        colors={["#E3F2FD", "#BBDEFB"]}
                        style={styles.termHeader}
                      >
                        <Text style={styles.termTitle}>{term.title}</Text>

                        {/* Icon loa */}
                        <TouchableOpacity
                          style={styles.speakerIconContainer}
                          onPress={() =>
                            speak(`${term.description} ${term.example}`)
                          }
                        >
                          <FontAwesome5
                            name="volume-up"
                            size={14}
                            color="#1565C0"
                            style={styles.speakerIcon}
                          />
                        </TouchableOpacity>
                      </LinearGradient>
                      <Text style={styles.termText}>{term.description}</Text>
                      <Text style={styles.termExample}>{term.example}</Text>
                    </View>
                  ))}
                </LinearGradient>
              </Shadow>

              {/* Ví dụ trực quan phép trừ */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={styles.sectionCard}
                >
                  <Text style={styles.sectionTitle}>Ví dụ trực quan</Text>

                  {/* Thêm lời giải thích */}
                  <Text style={styles.explanationText}>
                    Phép trừ giúp chúng ta tính số lượng còn lại khi lấy đi một
                    phần từ một nhóm:
                  </Text>

                  {/* Render ví dụ trực quan */}
                  {renderSubtractionExample()}
                </LinearGradient>
              </Shadow>

              {/* Mẹo học phép trừ */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={styles.sectionCard}
                >
                  <Text style={styles.sectionTitle}>Mẹo học phép trừ</Text>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#2196F3", "#1976D2"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>1</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Luôn nhớ rằng số bị trừ (số đầu tiên) luôn lớn hơn hoặc
                      bằng số trừ
                    </Text>
                  </View>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#2196F3", "#1976D2"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>2</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Nếu số bị trừ và số trừ bằng nhau, hiệu số luôn bằng 0
                    </Text>
                  </View>

                  <View style={styles.tipItem}>
                    <LinearGradient
                      colors={["#2196F3", "#1976D2"]}
                      style={styles.tipNumberContainer}
                    >
                      <Text style={styles.tipNumber}>3</Text>
                    </LinearGradient>
                    <Text style={styles.tipText}>
                      Bất kỳ số nào trừ đi 0 thì kết quả vẫn là số đó
                    </Text>
                  </View>

                  {/* Icon loa cho phần mẹo học */}
                  <TouchableOpacity
                    style={[styles.tipSpeakerContainer]}
                    onPress={() =>
                      speak(
                        "Một số mẹo học phép trừ: Luôn nhớ rằng số bị trừ, tức là số đầu tiên, luôn lớn hơn hoặc bằng số trừ. Nếu số bị trừ và số trừ bằng nhau, hiệu số luôn bằng 0. Và bất kỳ số nào trừ đi 0 thì kết quả vẫn là số đó."
                      )
                    }
                  >
                    <FontAwesome5
                      name="volume-up"
                      size={16}
                      color="#1565C0"
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
                  setTimeout(() => router.replace("../chapter4"), 300);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#2196F3", "#1976D2"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.buttonLabel}>Quay lại</Text>
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
                  colors={["#03A9F4", "#00BCD4"]}
                  style={styles.gradientMainButton}
                >
                  <FontAwesome5
                    name="sync-alt"
                    size={18}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.mainButtonText}>Tải lại</Text>
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
                  colors={["#2196F3", "#03A9F4"]}
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
    flexDirection: "row",
    justifyContent: "center",
  },
  titleGradient: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  speakingIcon: {
    color: "#FF6B95",
  },
  cardShadow: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 12,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 12,
    textAlign: "center",
  },
  explanationText: {
    fontSize: 15,
    color: "#424242",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  // Thuật ngữ
  termContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  activeTermContainer: {
    borderWidth: 2,
    borderColor: "#1976D2",
    transform: [{ scale: 1.02 }],
  },
  termHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  termTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1565C0",
    textAlign: "center",
  },
  termText: {
    fontSize: 15,
    color: "#424242",
    padding: 10,
    backgroundColor: "white",
  },
  termExample: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#1976D2",
    padding: 10,
    backgroundColor: "#E3F2FD",
    textAlign: "center",
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
    paddingLeft: 1,
  },
  // Ví dụ
  exampleCardShadow: {
    marginBottom: 12,
    borderRadius: 12,
    width: "100%",
  },
  exampleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  exampleHeader: {
    padding: 12,
    position: "relative",
  },
  exampleText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1565C0",
  },
  exampleSpeakerIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  visualization: {
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  visualRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  visualLabel: {
    width: 60,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  sticksContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
    borderRadius: 8,
  },
  stickImage: {
    width: 30,
    height: 30,
    marginHorizontal: 3,
    marginVertical: 2,
  },
  stickRemoved: {
    tintColor: "#F44336",
  },
  nextExampleButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nextExampleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Mẹo học
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
    fontSize: 14,
  },
  tipText: {
    fontSize: 15,
    color: "#424242",
    flex: 1,
    lineHeight: 22,
  },
  tipSpeakerContainer: {
    alignSelf: "flex-end",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(227, 242, 253, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  // Chú cú
  owlContainer: {
    zIndex: 100,
  },
  owlImage: {
    width: 100,
    height: 100,
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
    color: "#1565C0",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: "rgba(255,255,255,0.8)",
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
    marginRight: 6,
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
