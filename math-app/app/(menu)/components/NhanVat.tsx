import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type NhanVatProps = {
  step: number;
  visible?: boolean;
};

const nhanVatByStep = [
  [
    require("../../../assets/images/B2111885/character/dog_teach.gif"),
    require("../../../assets/images/B2111885/character/dog_understand.gif"),
  ],
  [
    require("../../../assets/images/B2111885/character/dog_point.gif"),
    require("../../../assets/images/B2111885/character/dog_surprised.gif"),
  ],
  [
    require("../../../assets/images/B2111885/character/dog_attention.gif"),
    require("../../../assets/images/B2111885/character/dog_cheers.gif"),
  ],
  [
    require("../../../assets/images/B2111885/character/dog_correct.gif"),
    require("../../../assets/images/B2111885/character/dog_happy.gif"),
  ],
];

export default function NhanVat({ step, visible = true }: NhanVatProps) {
  const [index, setIndex] = useState(0);
  const oscillateAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(400)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const running = useRef(false);

  // Hiệu ứng xuất hiện và biến mất
  useEffect(() => {
    if (visible) {
      translateXAnim.setValue(400);
      translateYAnim.setValue(0);
      Animated.spring(translateXAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 4,
      }).start();
    } else {
      Animated.timing(translateYAnim, {
        toValue: -500, // nảy lên trên
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [visible]);

  // Reset animation logic khi step đổi
  useEffect(() => {
    running.current = true;
    setIndex(0);
    oscillateAnim.setValue(0);
    spinAnim.setValue(0);

    const runSequence = async () => {
      while (running.current) {
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => {
            Animated.sequence([
              Animated.timing(oscillateAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
              Animated.timing(oscillateAnim, {
                toValue: -1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
            ]).start(() => resolve(null));
          });
        }
        oscillateAnim.setValue(0);

        // Xoay 1 vòng (360 độ), đổi gif ở 3/5 thời gian xoay
        const spinDuration = 900;
        const changeGifAt = (spinDuration * 3) / 5;

        spinAnim.setValue(0);

        await new Promise((resolve) => {
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: spinDuration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }).start(() => {
            spinAnim.setValue(0);
            resolve(null);
          });

          setTimeout(() => {
            setIndex((prev) => 1 - prev);
          }, changeGifAt);
        });
      }
    };
    runSequence();

    return () => {
      running.current = false;
    };
  }, [step]);

  // Góc lắc lư (theo Z)
  const rotateZ = oscillateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  // Góc xoay vòng (theo Y)
  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const nvArr = nhanVatByStep[step] || nhanVatByStep[0];
  const nvSource = nvArr[index];

  return (
    <View style={styles.container}>
      <Animated.Image
        source={nvSource}
        style={[
          styles.gif,
          {
            opacity: fadeAnim,
            transform: [
              { rotateY },
              { rotateZ },
            ],
            backfaceVisibility: "hidden",
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  gif: {
    width: 200,
    height: 200,
  },
});