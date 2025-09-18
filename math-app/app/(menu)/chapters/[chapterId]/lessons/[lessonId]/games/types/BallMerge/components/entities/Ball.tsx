import React, { useMemo } from "react";
import { View, Image, StyleSheet } from "react-native";

const FRUIT_RULES = {
  apple: {
    nextFruit: "banana",
    size: 1,
    image: require("../../../../../../../../../../../assets/images/ToanVo/images/apple.png"),
  },
  banana: {
    nextFruit: "grape",
    size: 2,
    image: require("../../../../../../../../../../../assets/images/ToanVo/images/banana.png"),
  },
  grape: {
    nextFruit: "orange",
    size: 3,
    image: require("../../../../../../../../../../../assets/images/ToanVo/images/grape.png"),
  },
  orange: {
    nextFruit: "watermelon",
    size: 4,
    image: require("../../../../../../../../../../../assets/images/ToanVo/images/orange.png"),
  },
  watermelon: {
    nextFruit: null,
    size: 5,
    image: require("../../../../../../../../../../../assets/images/ToanVo/images/watermelon.png"),
  },
};

type FruitType = keyof typeof FRUIT_RULES;

interface BallProps {
  body: { position: { x: number; y: number } };
  radius: number;
  color: FruitType;
}

const Ball = (props: BallProps) => {
  const { body, radius, color } = props;
  const x = body.position.x - radius;
  const y = body.position.y - radius;

  // Sử dụng useMemo để tối ưu hóa hình ảnh
  const fruitImage = useMemo(() => FRUIT_RULES[color].image, [color]);

  return (
    <View
      style={[
        styles.ball,
        {
          left: x,
          top: y,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
        },
      ]}
    >
      <Image source={fruitImage} style={styles.image} />
    </View>
  );
};

export default Ball;

const styles = StyleSheet.create({
  ball: {
    position: "absolute",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
