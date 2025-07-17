import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity,
  Image,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const cloud1Image = require('../../assets/images/cloud.png');
const cloud2Image = require('../../assets/images/cloud.png');
const sunImage = require('../../assets/images/sun.png');

const PointIntroduction = ({ onComplete }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  
  // New animations for clouds and sun
  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;
  const sunAnim = useRef(new Animated.Value(0)).current;
  const sunRotationAnim = useRef(new Animated.Value(0)).current;
  
  // Nội dung giới thiệu
  const introductionSteps = [
    {
      title: "Xin chào các bé! 👋",
      content: "Hôm nay chúng ta sẽ học về ĐIỂM nhé!",
      showDots: false,
      autoNext: 8000 as number
    },
    {
      title: "Điểm là gì? 🤔",
      content: "Điểm là một vị trí rất nhỏ trong không gian. Nó không có kích thước, chỉ có vị trí thôi!",
      showDots: false,
      autoNext: 8000 as number
    },
    {
      title: "Điểm trông như thế nào? 👀",
      content: "Điểm được vẽ bằng một chấm tròn nhỏ như thế này:",
      showDots: true,
      dotCount: 1,
      autoNext: 8000 as number
    },
    {
      title: "Có bao nhiêu điểm? 🌟",
      content: "Trong không gian có rất rất nhiều điểm! Chúng ta có thể vẽ điểm ở bất kỳ đâu!",
      showDots: true,
      dotCount: 8,
      autoNext: 8000 as number
    },
    {
      title: "Cách vẽ điểm 🎨",
      content: "Để vẽ một điểm, chúng ta chỉ cần chấm bút xuống giấy một cách nhẹ nhàng!",
      showDots: true,
      dotCount: 3,
      sequential: true,
      autoNext: 8000 as number
    },
    {
      title: "Bây giờ chúng ta hãy thực hành! 🚀",
      content: "Các bé đã sẵn sàng để làm bài tập về điểm chưa?",
      showDots: false,
      showStartButton: true,
      autoNext: null as null
    }
  ];

  const currentStepData = introductionSteps[currentStep];

  useEffect(() => {
    // Start background animations
    startCloudAnimations();
    startSunAnimation();
    animateStepEntry();
  }, [currentStep]);

  useEffect(() => {
    if (typeof currentStepData.autoNext === 'number') {
      const timer = setTimeout(() => {
        nextStep();
      }, currentStepData.autoNext);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const startCloudAnimations = () => {
    // Cloud 1 animation - floating left to right
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud1Anim, {
          toValue: 1,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cloud1Anim, {
          toValue: 0,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Cloud 2 animation - floating right to left
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloud2Anim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2Anim, {
          toValue: 0,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const startSunAnimation = () => {
    // Sun floating up and down slightly
    Animated.loop(
      Animated.sequence([
        Animated.timing(sunAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sunAnim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Sun rotation
    Animated.loop(
      Animated.timing(sunRotationAnim, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const animateStepEntry = () => {
    // Reset animations
    fadeAnim.setValue(0);
    textAnim.setValue(0);
    scaleAnim.setValue(0);
    dotAnimations.forEach(anim => anim.setValue(0));
    arrowAnim.setValue(0);

    // Animate text entry
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Animate dots if needed
    if (currentStepData.showDots) {
      setTimeout(() => {
        animateDots();
      }, 1000);
    }

    // Animate arrow
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }, 2000);
  };

  const animateDots = () => {
    const { dotCount = 1, sequential = false } = currentStepData;
    
    if (sequential) {
      // Animate dots one by one
      dotAnimations.slice(0, dotCount).forEach((anim, index) => {
        setTimeout(() => {
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, index * 800);
      });
    } else {
      // Animate all dots at once
      Animated.stagger(200, 
        dotAnimations.slice(0, dotCount).map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  };

  const nextStep = () => {
    if (currentStep < introductionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderDots = () => {
    if (!currentStepData.showDots) return null;

    const { dotCount = 1 } = currentStepData;
    const dots = [];
    
    // Định nghĩa vùng giữa màn hình cho việc hiển thị điểm
    const centerAreaWidth = width * 0.6;
    const centerAreaHeight = 180;
    const centerX = width * 0.2;
    const centerY = 50;
    
    for (let i = 0; i < dotCount; i++) {
      const randomX = Math.random() * centerAreaWidth + centerX;
      const randomY = Math.random() * centerAreaHeight + centerY;
      
      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              left: randomX,
              top: randomY,
              transform: [
                { 
                  scale: dotAnimations[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }
              ]
            }
          ]}
        />
      );
    }
    
    return <View style={styles.dotsContainer}>{dots}</View>;
  };

  const renderArrow = () => {
    if (currentStepData.showStartButton) return null;
    
    return (
      <Animated.View 
        style={[
          styles.arrowContainer,
          {
            opacity: arrowAnim,
            transform: [
              {
                translateY: arrowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={nextStep} style={styles.arrowButton}>
          <Ionicons name="arrow-forward" size={30} color="#4CAF50" />
          <Text style={styles.arrowText}>Tiếp tục</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background with animated elements */}
      <View style={styles.background}>
        {/* Animated Cloud 1 */}
        <Animated.Image 
          source={cloud1Image} 
          style={[
            styles.cloud1,
            {
              transform: [
                {
                  translateX: cloud1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, width - 250],
                  })
                }
              ]
            }
          ]} 
          resizeMode="contain"
        />
        
        {/* Animated Cloud 2 */}
        <Animated.Image 
          source={cloud2Image} 
          style={[
            styles.cloud2,
            {
              transform: [
                {
                  translateX: cloud2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width - 300, -50],
                  })
                }
              ]
            }
          ]} 
          resizeMode="contain"
        />
        
        {/* Animated Sun */}
        <Animated.Image 
          source={sunImage} 
          style={[
            styles.sun,
            {
              transform: [
                {
                  translateY: sunAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  })
                },
                {
                  rotate: sunRotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                },
                {
                  scale: sunAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.05, 1],
                  })
                }
              ]
            }
          ]} 
          resizeMode="contain"
        />
      </View>

      {/* Character */}
      <Animated.View 
        style={[
          styles.characterContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }
        ]}
      >
        <View style={styles.character}>
          <Text style={styles.characterFace}>😊</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.content}>{currentStepData.content}</Text>
      </Animated.View>

      {/* Dots demonstration */}
      {renderDots()}

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {introductionSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      {currentStepData.showStartButton ? (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onComplete}
        >
          <Text style={styles.startButtonText}>Bắt đầu làm bài! 🚀</Text>
        </TouchableOpacity>
      ) : (
        renderArrow()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloud1: {
    position: 'absolute',
    top: 120,
    width: 350,
    height: 180,
  },
  cloud2: {
    position: 'absolute',
    top: 70,
    width: 350,
    height: 180,
  },
  sun: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 80,
    height: 80,
  },
  characterContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
  },
  character: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DDD',
  },
  characterFace: {
    fontSize: 50,
  },
  contentContainer: {
    position: 'absolute',
    top: height * 0.35,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsContainer: {
    position: 'absolute',
    top: height * 0.55,
    left: 0,
    right: 0,
    height: 250,
  },
  dot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E91E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'white',
    transform: [{ scale: 1.5 }],
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  arrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrowText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  startButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PointIntroduction;