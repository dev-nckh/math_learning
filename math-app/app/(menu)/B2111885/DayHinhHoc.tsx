import { Audio } from "expo-av";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import ViDuHinhHoc from "../components/ViDuHinhHoc";
import BaiGiangHinhHoc, { BaiGiangHinhHocHandle } from "../components/BaiGiangHinhHoc";
import GhiChu from "../components/GhiChu";
import NhanVat from "../components/NhanVat";
import TapVe from "../components/TapVe";
import BackButton from '../components/backButton';

const TITLES: Record<string, string> = {
  circle: "Bài Học Về Hình Tròn",
  square: "Bài Học Về Hình Vuông",
  triangle: "Bài Học Về Hình Tam Giác",
  rectangle: "Bài Học Về Hình Chữ Nhật",
};

const SHAPE_BACKGROUNDS: Record<string, any> = {
  circle: require('../../../assets/images/B2111885/main_background2.jpg'),
  square: require('../../../assets/images/B2111885/main_background3.jpg'),
  triangle: require('../../../assets/images/B2111885/main_background4.jpg'),
  rectangle: require('../../../assets/images/B2111885/main_background5.jpg'),
  // Nếu sau này có hình riêng thì thay đường dẫn ở đây
};

function nameShape(type: string): string {
  switch (type) {
    case "circle":
      return "Hình Tròn";
    case "square":
      return "Hình Vuông";
    case "triangle":
      return "Hình Tam Giác";
    case "rectangle":
      return "Hình Chữ Nhật";
    default:
      return "Hình Học";
  }
}

function AnimatedShape({
  type,
  translateXAnim,
  showShadow = false,
  shapeKey,
}: {
  type: string,
  translateXAnim?: Animated.Value,
  showShadow?: boolean,
  shapeKey?: number,
}) {
  const scale = useRef(new Animated.Value(2)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [showOscillate, setShowOscillate] = useState(false);
  const [isSliding, setIsSliding] = useState(true);

  const colorMap = {
    circle: ["#FBC02D", "#FFF176"],
    square: ["#EF6C00", "#FF9800"],
    rectangle: ["#0288D1", "#4FC3F7"],
    triangle: ["#388E3C", "#81C784"],
  };
  const [colorNormal, colorLight] = colorMap[type as keyof typeof colorMap] || ["#888", "#ccc"];

  const appearAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (!translateXAnim) {
      appearAnim.setValue(-200);
      Animated.timing(appearAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowOscillate(true);
        setIsSliding(false);
      });
    }
  }, [translateXAnim, shapeKey]);

  useEffect(() => {
    if (!translateXAnim || showShadow) {
      setIsSliding(true);
    } else {
      setIsSliding(false);
    }
  }, [translateXAnim, showShadow]);

  useEffect(() => {
    if (!showOscillate) return;
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 2.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 2,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, [showOscillate]);

  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colorNormal, colorLight],
  });

  const renderShadow = () => {
    if (!isSliding && !showShadow) return null;
    switch (type) {
      case "circle":
        return (
          <>
            <View style={[styles.circleBig, styles.shadow, { left: -30, opacity: 0.3, backgroundColor: colorNormal }]} />
            <View style={[styles.circleBig, styles.shadow, { left: -60, opacity: 0.15, backgroundColor: colorNormal }]} />
          </>
        );
      case "square":
        return (
          <>
            <View style={[styles.squareBig, styles.shadow, { left: -30, opacity: 0.3, backgroundColor: colorNormal }]} />
            <View style={[styles.squareBig, styles.shadow, { left: -60, opacity: 0.15, backgroundColor: colorNormal }]} />
          </>
        );
      case "rectangle":
        return (
          <>
            <View style={[styles.rectangleBig, styles.shadow, { left: -30, opacity: 0.3, backgroundColor: colorNormal }]} />
            <View style={[styles.rectangleBig, styles.shadow, { left: -60, opacity: 0.15, backgroundColor: colorNormal }]} />
          </>
        );
      case "triangle":
        return (
          <>
            <View style={[styles.triangleWrap, styles.shadow, { left: -30, opacity: 0.3 }]}>
              <View style={[styles.triangleBorder, { borderBottomColor: "#2E7D32" }]} />
              <View style={[styles.triangleBig, { borderBottomColor: "#388E3C" }]} />
            </View>
            <View style={[styles.triangleWrap, styles.shadow, { left: -60, opacity: 0.15 }]}>
              <View style={[styles.triangleBorder, { borderBottomColor: "#2E7D32" }]} />
              <View style={[styles.triangleBig, { borderBottomColor: "#388E3C" }]} />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  let shape;
  switch (type) {
    case "circle":
      shape = (
        <Animated.View style={[styles.circleBig, { backgroundColor: animatedColor }]} />
      );
      break;
    case "square":
      shape = (
        <Animated.View style={[styles.squareBig, { backgroundColor: animatedColor }]} />
      );
      break;
    case "rectangle":
      shape = (
        <Animated.View style={[styles.rectangleBig, { backgroundColor: animatedColor }]} />
      );
      break;
    case "triangle":
      shape = (
        <View style={styles.triangleWrap}>
          <View style={styles.triangleBorder} />
          <Animated.View style={[styles.triangleBig, { borderBottomColor: animatedColor }]} />
        </View>
      );
      break;
    default:
      shape = null;
  }

  const translateX = translateXAnim ? translateXAnim : appearAnim;

  return (
    <Animated.View style={{ opacity: 1, transform: [{ scale }, { translateX }], alignItems: 'center', justifyContent: 'center' }}>
      {renderShadow()}
      {shape}
    </Animated.View>
  );
}

const DayHinhHoc = () => {
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [isHiding, setIsHiding] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showGif, setShowGif] = useState(true);
  const [shapeKey, setShapeKey] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const gifTranslateX = useRef(new Animated.Value(400)).current;
  const noteOpacity = useRef(new Animated.Value(0)).current;
  const noteTranslateY = useRef(new Animated.Value(-60)).current;
  const step2TextOpacity = useRef(new Animated.Value(0)).current;
  const step2TextTranslateY = useRef(new Animated.Value(-60)).current;
  const step2TextTranslateX = useRef(new Animated.Value(-80)).current;
  const [showStep2Text, setShowStep2Text] = useState(false);
  const step2TextScale = useRef(new Animated.Value(1)).current;
  const step3Box1TranslateY = useRef(new Animated.Value(-120)).current;
  const step3Box2TranslateY = useRef(new Animated.Value(120)).current;
  const [showTapVe, setShowTapVe] = useState(false);

  const colorAnimStep3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (step === 3) {
      colorAnimStep3.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnimStep3, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnimStep3, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      colorAnimStep3.setValue(0);
    }
  }, [step, restartKey]);
  const headerColor = colorAnimStep3.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff9800', '#fff176'],
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: TITLES[type as string] || "Bài Học Hình Học",
    });
  }, [type, navigation]);

  const audioRef = useRef<BaiGiangHinhHocHandle>(null);

  // Tắt toàn bộ audio khi thoát khỏi trang
  useEffect(() => {
    return () => {
      Audio.setIsEnabledAsync(false);
      Audio.setIsEnabledAsync(true);
    };
  }, []);

  // --- Xử lý nút Restart ---
  const handleRestart = async () => {
    await audioRef.current?.stopAudio();
    Audio.setIsEnabledAsync(false);
    Audio.setIsEnabledAsync(true);
    setRestartKey(prev => prev + 1);

    if (step === 0) {
      labelOpacity.setValue(1);
      slideAnim.setValue(0);
      setIsHiding(false);
      setShapeKey(prev => prev + 1);
    }
    audioRef.current?.playCurrentAudio();
  };

  const handleNext = async () => {
    await audioRef.current?.stopAudio();
    Audio.setIsEnabledAsync(false);
    Audio.setIsEnabledAsync(true);
    if (step === 0) {
      Animated.timing(labelOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsHiding(true);
        Animated.parallel([
          Animated.timing(noteOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(noteTranslateY, {
            toValue: 60,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(slideAnim, {
            toValue: 400,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            setIsHiding(false);
            slideAnim.setValue(0);
            labelOpacity.setValue(1);
          });
          Animated.timing(gifTranslateX, {
            toValue: -400,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            gifTranslateX.setValue(400);
          });
          setTimeout(() => {
            setStep(1);
            setShowExamples(true);
          }, 600);
        });
      });
    } else if (step === 1) {
      Animated.parallel([
        Animated.timing(noteOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(noteTranslateY, {
          toValue: 60,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(gifTranslateX, {
          toValue: -400,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          gifTranslateX.setValue(400);
          setShowExamples(false);
          setTimeout(() => {
            setStep(2);
          }, 400);
        });
      });
    } else if (step === 2) {
      Animated.parallel([
        Animated.timing(step2TextOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextScale, {
          toValue: 1.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextTranslateX, {
          toValue: -80,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStep2Text(false);
        Animated.parallel([
          Animated.timing(noteOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(noteTranslateY, {
            toValue: 60,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(gifTranslateX, {
            toValue: -400,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            gifTranslateX.setValue(400);
            setShowExamples(false);
            setStep(3);
          });
        });
      });
    }
  };

  const handleBack = async () => {
    await audioRef.current?.stopAudio();
    Audio.setIsEnabledAsync(false);
    Audio.setIsEnabledAsync(true);
    if (step === 1) {
      Animated.parallel([
        Animated.timing(noteOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(noteTranslateY, {
          toValue: 60,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(gifTranslateX, {
          toValue: -400,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          gifTranslateX.setValue(400);
          setShowExamples(false);
        });
      });
    } else if (step === 2) {
      Animated.parallel([
        Animated.timing(step2TextOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextScale, {
          toValue: 1.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextTranslateX, {
          toValue: -80,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(noteOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(noteTranslateY, {
            toValue: 60,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(gifTranslateX, {
            toValue: -400,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            gifTranslateX.setValue(400);
            setTimeout(() => {
              setStep(1);
              setShowExamples(true);
            }, 100);
          });
        });
      });
    } else if (step === 3) {
      Animated.timing(step3Box2TranslateY, {
        toValue: 120,
        duration: 600,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShowTapVe(false);
        Animated.timing(step3Box1TranslateY, {
          toValue: -120,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setStep(2);
        });
      });
    }
  };

  const handleExampleHidden = () => {
    setStep(0);
    setIsHiding(false);
    labelOpacity.setValue(1);
    slideAnim.setValue(0);
    setShapeKey(prev => prev + 1);
  };

  let box1Content = null;
  if (step === 0) {
    const shapeContent = (
      <AnimatedShape
        key={shapeKey + '-' + restartKey}
        type={type as string}
        translateXAnim={isHiding ? slideAnim : undefined}
        showShadow={isHiding}
        shapeKey={shapeKey + restartKey}
      />
    );
    box1Content = (
      <View style={{ alignItems: "center" }}>
        {shapeContent}
        <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
          {nameShape(type as string)}
        </Animated.Text>
      </View>
    );
  } else if (step === 1) {
    box1Content = (
      <View style={{ alignItems: "center" }}>
        <ViDuHinhHoc
          key={restartKey}
          type={type as string}
          visible={showExamples}
          onHidden={handleExampleHidden}
        />
      </View>
    );
  } else if (step === 2 || showStep2Text) {
    box1Content = (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Animated.Text
          style={[
            styles.label,
            {
              fontSize: 20,
              color: "#fff176",
              opacity: step2TextOpacity,
              textAlign: "center",
              fontFamily: "Comic Sans MS",
              textShadowColor: "orange",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
              letterSpacing: 2,
              transform: [
                { translateY: step2TextTranslateY },
                { translateX: step2TextTranslateX },
                { scale: step2TextScale },
              ],
            },
          ]}
        >
          Trò chơi đi tìm đồ vật!{"\n"}Hãy cùng chơi nào
        </Animated.Text>
      </View>
    );
  } else if (step === 3) {
    box1Content = (
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          transform: [{ translateY: step3Box1TranslateY }],
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "center", paddingLeft: 24 }}>
          <Animated.Text style={[styles.label, { fontSize: 26, color: headerColor, marginTop: 0, shadowColor: 'orange', shadowOffset: { width: 2, height: 2 }, shadowRadius: 4, textShadowColor: 'orange', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 }]}>
            Vẽ hình thôi
          </Animated.Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center", paddingRight: 24 }}>
          <NhanVat step={3} visible={true} />
        </View>
      </Animated.View>
    );
  }

  useEffect(() => {
    if (showGif) {
      gifTranslateX.setValue(400);
      Animated.spring(gifTranslateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 4,
      }).start();
    }
  }, [showGif, step, restartKey]);

  useEffect(() => {
    if (step === 0 || step === 1 || step === 2) {
      noteOpacity.setValue(0);
      noteTranslateY.setValue(-60);
      Animated.parallel([
        Animated.timing(noteOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(noteTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step, restartKey]);

  useEffect(() => {
    if (step === 2) {
      setShowStep2Text(true);
      step2TextOpacity.setValue(0);
      step2TextTranslateY.setValue(-60);
      step2TextTranslateX.setValue(-80);
      Animated.parallel([
        Animated.timing(step2TextOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextTranslateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step, restartKey]);

  useEffect(() => {
    if (showStep2Text && step !== 2) {
      Animated.parallel([
        Animated.timing(step2TextOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextTranslateX, {
          toValue: -80,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(step2TextScale, {
          toValue: 1.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStep2Text(false);
      });
    }
  }, [step, restartKey]);

  useEffect(() => {
    if (step === 3) {
      step3Box1TranslateY.setValue(-120);
      step3Box2TranslateY.setValue(120);
      setShowTapVe(false);

      Animated.timing(step3Box1TranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setShowTapVe(true);
        Animated.timing(step3Box2TranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, 200);
    } else {
      setShowTapVe(false);
    }
  }, [step, restartKey]);

  let box2Content = null;
  if (step === 2) {
    box2Content = (
      <View style={{ alignItems: "center" }}>
        <ViDuHinhHoc
          type={type as string}
          visible={showExamples}
          onHidden={handleExampleHidden}
        />
      </View>
    );
  } else if (step === 3) {
    box2Content = showTapVe ? (
      <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%", transform: [{ translateY: step3Box2TranslateY }] }}>
        <TapVe type={type as string} />
      </Animated.View>
    ) : null;
  }

  // Chỉ nhận 4 loại hình cơ bản
  const allowedTypes = ['circle', 'square', 'triangle', 'rectangle'];
  const shapeType = allowedTypes.includes(type as string) ? type : 'circle';

  return (
    <ImageBackground
      source={SHAPE_BACKGROUNDS[shapeType as string]}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 45, marginBottom: 0 }}>
        <BackButton />
      </View>
      <View style={styles.overlay}>
        <View style={styles.box1}>{box1Content}</View>
        <View style={styles.box2}>
          {step === 3 ? (
            showTapVe ? (
              <Animated.View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  transform: [{ translateY: step3Box2TranslateY }],
                }}
              >
                <TapVe type={type as string} />
              </Animated.View>
            ) : null
          ) : (
            <>
              <Animated.View
                style={{
                  width: "60%",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  marginLeft: "5%",
                  opacity: noteOpacity,
                  transform: [{ translateY: noteTranslateY }],
                }}
              >
                <GhiChu
                  type={type as string}
                  step={step}
                  style={{ width: "95%", height: "85%" }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  width: "40%",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  transform: [{ translateX: gifTranslateX }],
                  marginRight: "10%",
                  marginBottom: "10%",
                }}
              >
                <NhanVat key={step} step={step} visible={showGif} />
              </Animated.View>
            </>
          )}
        </View>
        <View style={styles.box3}>
          <TouchableOpacity onPress={handleBack}>
            <Image source={require('../../../assets/icons/back.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestart}>
            <Image source={require('../../../assets/icons/restart.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Image source={require('../../../assets/icons/next.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <BaiGiangHinhHoc
          ref={audioRef}
          type={shapeType as string}
          step={step}
          key={restartKey}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 12,
  },
  box1: {
    flex: 3.5,
    alignItems: "center",
    justifyContent: "center",
  },
  box2: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  box3: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 12,
    backgroundColor: "white",
  },
  label: {
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  gif: {
    width: 200,
    height: 200,
  },
  icon: {
    width: 60,
    height: 60,
    marginHorizontal: 12,
  },
  circleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FBC02D",
    borderWidth: 4,
    borderColor: "#F9A825",
  },
  squareBig: {
    width: 80,
    height: 80,
    backgroundColor: "#EF6C00",
    borderWidth: 4,
    borderColor: "#E65100",
    alignSelf: "center",
  },
  triangleWrap: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginRight: 12,
  },
  triangleBorder: {
    position: "absolute",
    borderLeftWidth: 44,
    borderRightWidth: 44,
    borderBottomWidth: 76,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2E7D32",
  },
  triangleBig: {
    borderLeftWidth: 36,
    borderRightWidth: 36,
    borderBottomWidth: 66,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#388E3C",
  },
  rectangleBig: {
    width: 90,
    height: 48,
    backgroundColor: "#0288D1",
    borderWidth: 4,
    borderColor: "#0277BD",
    alignSelf: "center",
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
  },
});

export default DayHinhHoc;