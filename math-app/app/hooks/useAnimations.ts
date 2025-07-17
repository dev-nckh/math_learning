import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimations = (currentQuestionIndex: number, showInstructions: boolean) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const answerAnimations = useRef<Animated.Value[]>([]);
  const fireworksAnim = useRef([...Array(12)].map(() => new Animated.Value(0))).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (answerAnimations.current.length === 0) {
      answerAnimations.current = Array.from({ length: 4 }, () => new Animated.Value(0));
    }
  }, []);

  useEffect(() => {
    if (showInstructions) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      animateAnswers();
      animateBounce();
    }
  }, [currentQuestionIndex, showInstructions]);

  const animateBounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateAnswers = () => {
    answerAnimations.current.forEach((anim, index) => {
      if (!anim) {
        answerAnimations.current[index] = new Animated.Value(0);
        anim = answerAnimations.current[index];
      }
      
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(index * 150),
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const animateFireworks = () => {
    fireworksAnim.forEach((anim, index) => {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            delay: 600,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });
  };

  const animateModal = () => {
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return {
    fadeAnim,
    bounceAnim,
    answerAnimations,
    fireworksAnim,
    modalAnim,
    animateFireworks,
    animateModal
  };
};