import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Image,
  Animated,
  Easing,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";

// ✅ dùng lại hook speech theo hệ Toán Võ
import { useSpeech } from "../components/theory/useSpeechHook";

// ✅ dùng lại assets Toán Võ
const backgroundImg = require("../../../../../../../../assets/images/ToanVo/images/bg.jpg");
const OWL_TEACHER_IMAGE = require("../../../../../../../../assets/images/ToanVo/images/owl.png");

// ----- Nội dung lý thuyết So sánh -----
const COMPARISON_SECTIONS = [
  {
    key: "intro",
    title: "Giới thiệu",
    description:
      "Hôm nay chúng ta học so sánh số nhé! Khi so sánh hai số, ta dùng dấu bé hơn, lớn hơn hoặc bằng.",
    speak:
      "Hôm nay chúng ta học so sánh số nhé! Khi so sánh hai số, ta dùng dấu bé hơn, lớn hơn hoặc bằng.",
  },
  {
    key: "less",
    title: "Dấu bé hơn <",
    description: "Nếu số bên trái nhỏ hơn số bên phải thì dùng dấu bé hơn <.",
    example: "Ví dụ: 3 < 5",
    speak:
      "Nếu số bên trái nhỏ hơn số bên phải thì dùng dấu bé hơn. Ví dụ: 3 bé hơn 5.",
  },
  {
    key: "greater",
    title: "Dấu lớn hơn >",
    description: "Nếu số bên trái lớn hơn số bên phải thì dùng dấu lớn hơn >.",
    example: "Ví dụ: 9 > 2",
    speak:
      "Nếu số bên trái lớn hơn số bên phải thì dùng dấu lớn hơn. Ví dụ: 9 lớn hơn 2.",
  },
  {
    key: "equal",
    title: "Dấu bằng =",
    description: "Nếu hai số giống nhau thì dùng dấu bằng =.",
    example: "Ví dụ: 7 = 7",
    speak: "Nếu hai số giống nhau thì dùng dấu bằng. Ví dụ: 7 bằng 7.",
  },
  {
    key: "tips",
    title: "Mẹo so sánh nhanh",
    description:
      "Với số 2 chữ số: so sánh hàng chục trước. Nếu hàng chục bằng nhau thì so sánh hàng đơn vị.",
    example: "Ví dụ: 34 và 29 → 34 > 29",
    speak:
      "Mẹo so sánh nhanh: với số hai chữ số, so sánh hàng chục trước. Nếu hàng chục bằng nhau thì so sánh hàng đơn vị. Ví dụ: 34 lớn hơn 29.",
  },
];

// ----- Ví dụ trực quan -----
const VISUAL_EXAMPLES = [
  { a: 4, b: 7 },
  { a: 9, b: 2 },
  { a: 6, b: 6 },
];

function getAns(a: number, b: number): "<" | ">" | "=" {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

type OwlPosKey = "top" | "middle" | "bottom" | "example" | "tips";

const OWL_POSITIONS: Record<
  OwlPosKey,
  { right: number; top: number; scrollTo?: number }
> = {
  top: { right: -20, top: 140 },
  middle: { right: -20, top: 260 },
  bottom: { right: -20, top: 420 },
  example: { right: -20, top: 170, scrollTo: 420 },
  tips: { right: -20, top: 520, scrollTo: 860 },
};

export default function ComparisonTheoryScreen() {
  const { chapterId, lessonId } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
  }>();

  const [screenKey, setScreenKey] = useState(0);

  const sectionKeyMap = {
    intro: 0,
    less: 1,
    greater: 2,
    equal: 3,
    tips: 4,
  } as const;

  const [currentSection, setCurrentSection] =
    useState<keyof typeof sectionKeyMap>("intro");

  const [owlPosition, setOwlPosition] = useState<OwlPosKey>("top");
  const [currentExample, setCurrentExample] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  // ✅ speech: hook của bạn speak() nhận 1 tham số
  const { speak, stopSpeech, isSpeechActive } = useSpeech({
    pageId: "ComparisonTheoryScreen",
    autoCleanupOnUnmount: true,
    autoStopOnBlur: true,
  });

  // ----- Animated values -----
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const characterAnim = useRef(new Animated.Value(0)).current;

  const backButtonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const reloadButtonScale = useRef(new Animated.Value(1)).current;

  // owl animation
  const owlSwayX = useRef(new Animated.Value(0)).current;
  const owlRotate = useRef(new Animated.Value(0)).current;
  const owlBounceY = useRef(new Animated.Value(0)).current;
  const owlScaleX = useRef(new Animated.Value(1)).current;
  const owlScaleY = useRef(new Animated.Value(1)).current;
  const owlPositionY = useRef(new Animated.Value(0)).current;

  // highlight cho ví dụ
  const highlight = useRef(new Animated.Value(0)).current;

  // ----- wobble owl (giống Toán Võ) -----
  const startOwlWobble = () => {
    const randomFactor = Math.random() * 0.3 + 0.85;

    const create = () => {
      owlBounceY.setValue(0);

      const animations = [
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: 3 * randomFactor,
            duration: 900 + Math.random() * 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0.03 * randomFactor,
            duration: 900 + Math.random() * 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1.02,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: -2 * randomFactor,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: -3 * randomFactor,
            duration: 900 + Math.random() * 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: -0.03 * randomFactor,
            duration: 900 + Math.random() * 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 0.98,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 2 * randomFactor,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(owlSwayX, {
            toValue: 0,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlRotate, {
            toValue: 0,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlScaleX, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(owlBounceY, {
            toValue: 0,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ];

      Animated.sequence(animations).start(() => {
        setTimeout(() => create(), Math.random() * 500 + 200);
      });
    };

    create();
  };

  const shakeOwlAndSpeak = async (message: string) => {
    try {
      await stopSpeech();
    } catch {}

    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);

    Animated.sequence([
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
      setTimeout(() => {
        // ✅ FIX: speak chỉ nhận 1 tham số
        speak(message);
      }, 250);
    });
  };

  const moveOwlToPosition = (
    position: OwlPosKey,
    yOffset = 200,
    duration = 1000,
    callback?: () => void,
  ) => {
    if (scrollViewRef.current && OWL_POSITIONS[position].scrollTo != null) {
      scrollViewRef.current.scrollTo({
        y: OWL_POSITIONS[position].scrollTo!,
        animated: true,
      });
    }

    Animated.timing(owlPositionY, {
      toValue: yOffset,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOwlPosition(position);
      owlPositionY.setValue(0);
      callback?.();
    });
  };

  // ----- load animation & auto narration (giống Toán Võ) -----
  useEffect(() => {
    let mounted = true;

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

    startOwlWobble();

    setTimeout(() => {
      if (!mounted) return;

      setCurrentSection("intro");
      setOwlPosition("top");
      shakeOwlAndSpeak(COMPARISON_SECTIONS[0].speak);

      setTimeout(() => {
        if (!mounted) return;

        setCurrentSection("less");
        moveOwlToPosition("middle", 160, 1100, () => {
          shakeOwlAndSpeak(COMPARISON_SECTIONS[1].speak);
        });

        setTimeout(() => {
          if (!mounted) return;

          setCurrentSection("greater");
          moveOwlToPosition("middle", 160, 1100, () => {
            shakeOwlAndSpeak(COMPARISON_SECTIONS[2].speak);
          });

          setTimeout(() => {
            if (!mounted) return;

            setCurrentSection("equal");
            moveOwlToPosition("bottom", 260, 1100, () => {
              shakeOwlAndSpeak(COMPARISON_SECTIONS[3].speak);
            });

            setTimeout(() => {
              if (!mounted) return;

              setCurrentSection("tips");
              moveOwlToPosition("tips", 420, 1200, () => {
                shakeOwlAndSpeak(COMPARISON_SECTIONS[4].speak);
              });
            }, 8500);
          }, 8500);
        }, 8500);
      }, 6500);
    }, 1200);

    return () => {
      mounted = false;
      stopSpeech();
    };
  }, [screenKey]);

  const animateButton = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReload = async () => {
    animateButton(reloadButtonScale);
    try {
      await stopSpeech();
    } catch {}

    highlight.setValue(0);
    owlSwayX.setValue(0);
    owlRotate.setValue(0);
    owlBounceY.setValue(0);
    owlScaleX.setValue(1);
    owlScaleY.setValue(1);
    owlPositionY.setValue(0);

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      setScreenKey((k) => k + 1);
      setCurrentExample(0);
      setCurrentSection("intro");
      setOwlPosition("top");
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      setTimeout(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }).start();
      }, 100);
    });
  };

  const handleBack = async () => {
    animateButton(backButtonScale);
    try {
      await stopSpeech();
    } catch {}
    setTimeout(() => router.back(), 200);
  };

  const handleStartGame = async () => {
    animateButton(nextButtonScale);
    try {
      await stopSpeech();
    } catch {}
    setTimeout(() => {
      router.push(
        `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/comparison`,
      );
    }, 200);
  };

  const getCurrentMessage = () => {
    const idx = sectionKeyMap[currentSection];
    return COMPARISON_SECTIONS[idx]?.speak || COMPARISON_SECTIONS[0].speak;
  };

  const renderOwl = () => {
    const pos = OWL_POSITIONS[owlPosition] || OWL_POSITIONS.top;

    return (
      <Animated.View
        style={[
          styles.owlContainer,
          {
            position: "absolute",
            right: pos.right,
            top: pos.top,
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
          onPress={() => shakeOwlAndSpeak(getCurrentMessage())}
          activeOpacity={0.85}
        >
          <Image source={OWL_TEACHER_IMAGE} style={styles.owlImage} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const animateExample = () => {
    highlight.setValue(0);
    Animated.sequence([
      Animated.timing(highlight, {
        toValue: 1,
        duration: 900,
        useNativeDriver: false,
      }),
      Animated.timing(highlight, {
        toValue: 0,
        duration: 900,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const showNextExample = () => {
    const next = (currentExample + 1) % VISUAL_EXAMPLES.length;
    setCurrentExample(next);

    setTimeout(() => {
      const ex = VISUAL_EXAMPLES[next];
      const ans = getAns(ex.a, ex.b);
      animateExample();

      // ✅ FIX: speak chỉ nhận 1 tham số
      speak(
        `Ví dụ tiếp theo: ${ex.a} so với ${ex.b}. Đáp án là ${
          ans === "<" ? "bé hơn" : ans === ">" ? "lớn hơn" : "bằng"
        }.`,
      );
    }, 200);
  };

  const renderExampleCard = () => {
    const ex = VISUAL_EXAMPLES[currentExample];
    const ans = getAns(ex.a, ex.b);

    const highlightColor = highlight.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(33, 150, 243, 0)", "rgba(255, 107, 149, 0.18)"],
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
              {ex.a} ? {ex.b}
            </Text>

            <TouchableOpacity
              style={styles.exampleSpeakerIcon}
              onPress={() =>
                speak(`Ví dụ: ${ex.a} so với ${ex.b}. Đáp án là ${ans}.`)
              }
            >
              <FontAwesome5
                name="volume-up"
                size={18}
                color="#1565C0"
                style={isSpeechActive() ? styles.speakingIcon : {}}
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.visualization}>
            <Text style={styles.visualHint}>
              Chọn dấu đúng: <Text style={styles.bold}>{ex.a}</Text> ?{" "}
              <Text style={styles.bold}>{ex.b}</Text>
            </Text>

            <Animated.View
              style={[styles.ansBox, { backgroundColor: highlightColor }]}
            >
              <Text style={styles.ansText}>Đáp án: {ans}</Text>
            </Animated.View>

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

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View key={screenKey} style={styles.container}>
          {/* Title */}
          <Animated.View
            style={[styles.titleContainer, { opacity: titleOpacity }]}
          >
            <LinearGradient
              colors={["#2196F3", "#1565C0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.titleText}>Lý thuyết so sánh</Text>

              <TouchableOpacity
                style={styles.speakAgainButton}
                onPress={() => shakeOwlAndSpeak(COMPARISON_SECTIONS[0].speak)}
                activeOpacity={0.85}
              >
                <FontAwesome5
                  name="volume-up"
                  size={16}
                  color={isSpeechActive() ? "#FF6B95" : "white"}
                  style={isSpeechActive() ? styles.speakingIcon : {}}
                />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Content */}
          <Animated.View
            style={[styles.contentWrapper, { opacity: contentOpacity }]}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Terms/Sections */}
              <Shadow
                distance={5}
                startColor="rgba(0,0,0,0.1)"
                style={styles.cardShadow}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F8F8F8"]}
                  style={styles.sectionCard}
                >
                  <Text style={styles.sectionTitle}>Kiến thức cần nhớ</Text>

                  {COMPARISON_SECTIONS.slice(1).map((s, idx) => {
                    const key = (["less", "greater", "equal", "tips"] as const)[
                      idx
                    ];
                    const active = currentSection === key;

                    return (
                      <View
                        key={s.key}
                        style={[
                          styles.termContainer,
                          active && styles.activeTermContainer,
                        ]}
                      >
                        <LinearGradient
                          colors={["#E3F2FD", "#BBDEFB"]}
                          style={styles.termHeader}
                        >
                          <Text style={styles.termTitle}>{s.title}</Text>

                          <TouchableOpacity
                            style={styles.speakerIconContainer}
                            onPress={() => shakeOwlAndSpeak(s.speak)}
                          >
                            <FontAwesome5
                              name="volume-up"
                              size={14}
                              color="#1565C0"
                            />
                          </TouchableOpacity>
                        </LinearGradient>

                        <Text style={styles.termText}>{s.description}</Text>
                        {s.example ? (
                          <Text style={styles.termExample}>{s.example}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </LinearGradient>
              </Shadow>

              {/* Visual Example */}
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
                  <Text style={styles.explanationText}>
                    Nhìn ví dụ và nhớ: so sánh để chọn dấu đúng nhé!
                  </Text>

                  {renderExampleCard()}
                </LinearGradient>
              </Shadow>
            </ScrollView>
          </Animated.View>

          {/* Owl */}
          {renderOwl()}

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Back */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: backButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleBack}
                activeOpacity={0.85}
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

            {/* Reload */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: reloadButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleReload}
                activeOpacity={0.85}
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

            {/* Start */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonScale }] },
              ]}
            >
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleStartGame}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#2196F3", "#03A9F4"]}
                  style={styles.gradientButton}
                >
                  <FontAwesome5 name="arrow-right" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.buttonLabel}>Bắt đầu</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ----- styles (đúng vibe Toán Võ) -----
const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safeArea: { flex: 1, paddingTop: StatusBar.currentHeight || 25 },
  container: { flex: 1, padding: 12, justifyContent: "space-between" },

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
  speakingIcon: { color: "#FF6B95" },

  contentWrapper: { flex: 1 },
  scrollContent: { paddingBottom: 20, position: "relative", minHeight: 1000 },

  cardShadow: { width: "100%", marginBottom: 15, borderRadius: 12 },
  sectionCard: { borderRadius: 12, padding: 16 },
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

  // Example card
  exampleCardShadow: { marginBottom: 12, borderRadius: 12, width: "100%" },
  exampleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  exampleHeader: { padding: 12, position: "relative" },
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
  visualization: { padding: 12, backgroundColor: "#FFFFFF" },
  visualHint: {
    fontSize: 15,
    color: "#0D47A1",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bold: { fontWeight: "900", fontSize: 18 },
  ansBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  ansText: { fontSize: 18, fontWeight: "bold", color: "#1565C0" },
  nextExampleButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nextExampleButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  // Owl
  owlContainer: { zIndex: 100 },
  owlImage: { width: 100, height: 100 },

  // Bottom controls
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  buttonContainer: { flex: 1, alignItems: "center", marginHorizontal: 5 },
  circleButton: { alignItems: "center", justifyContent: "center" },
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
  buttonIcon: { marginRight: 6 },
  mainButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
