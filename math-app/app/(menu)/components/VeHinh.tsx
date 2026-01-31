import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

type ShapeProps = {
  type: 'circle' | 'square' | 'triangle' | 'rectangle';
};

export default function ShapeAnimation({ type }: ShapeProps) {
  const strokeDashoffset = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    Animated.timing(strokeDashoffset, {
      toValue: 0,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  const strokeProps = {
    strokeWidth: 5,
    stroke: 'blue',
    fill: 'none',
    strokeDasharray: 1000,
    strokeDashoffset,
  };

  switch (type) {
    case 'circle':
      return (
        <Svg width="250" height="250" viewBox="0 0 250 250">
          <AnimatedCircle cx="125" cy="125" r="100" {...strokeProps} />
        </Svg>
      );

    case 'square':
      return (
        <Svg width="250" height="250" viewBox="0 0 250 250">
          <AnimatedRect x="25" y="25" width="200" height="200" {...strokeProps} stroke="green" />
        </Svg>
      );

    case 'rectangle':
      return (
        <Svg width="300" height="200" viewBox="0 0 300 200">
          <AnimatedRect x="25" y="25" width="250" height="150" {...strokeProps} stroke="red" />
        </Svg>
      );

    case 'triangle':
      return (
        <Svg width="250" height="250" viewBox="0 0 250 250">
          <AnimatedPolygon
            points="125,20 20,230 230,230"
            {...strokeProps}
            stroke="orange"
          />
        </Svg>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  circleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBC02D',
    borderWidth: 4,
    borderColor: '#F9A825',
  },
  squareBig: {
    width: 80,
    height: 80,
    backgroundColor: '#EF6C00',
    borderWidth: 4,
    borderColor: '#E65100',
    alignSelf: 'center',
  },
  triangleWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  triangleBorder: {
    position: 'absolute',
    borderLeftWidth: 44,
    borderRightWidth: 44,
    borderBottomWidth: 76,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2E7D32',
  },
  triangleBig: {
    borderLeftWidth: 36,
    borderRightWidth: 36,
    borderBottomWidth: 66,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#388E3C',
  },
  rectangleBig: {
    width: 90,
    height: 48,
    backgroundColor: '#0288D1',
    borderWidth: 4,
    borderColor: '#0277BD',
    alignSelf: 'center',
  },
});
