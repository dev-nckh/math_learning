import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Image, ImageSourcePropType } from "react-native";

type Props = {
  source: ImageSourcePropType;
  size?: number;
};

const WobbleImage = ({ source, size = 40 }: Props) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(20, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <Animated.Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
      resizeMode="contain"
    />
  );
};

export default WobbleImage;
