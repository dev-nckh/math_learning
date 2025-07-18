import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Defs, LinearGradient, Stop, Text as SvgText, Path } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

// Constants - moved outside component to prevent recreation
const POINT_A_POSITION = { x: width * 0.3, y: height * 0.6 };
const POINT_B_POSITION = { x: width * 0.7, y: height * 0.6 };
const TOUCH_THRESHOLD = 50;
const SNAP_THRESHOLD = 80; // Threshold for snapping to target
const ANIMATION_DURATION = {
  FADE: 500,
  TEXT: 800,
  SUCCESS: 500,
  LINE: 1000,
  SPRING: { tension: 100, friction: 8 }
};

// Calculate the actual distance between A and B
const ACTUAL_DISTANCE = Math.sqrt(
  Math.pow(POINT_B_POSITION.x - POINT_A_POSITION.x, 2) + 
  Math.pow(POINT_B_POSITION.y - POINT_A_POSITION.y, 2)
);

// Memoized introduction steps
const INTRODUCTION_STEPS = [
  {
    title: "Chào mừng đến với bài học về ĐOẠN THẲNG! 📏",
    content: "Hôm nay chúng ta sẽ khám phá về đoạn thẳng - một khái niệm cơ bản trong hình học!",
    showPoints: false,
    autoNext: 3000
  },
  {
    title: "Đoạn thẳng là gì? 🤔",
    content: "Đoạn thẳng là đường nối ngắn nhất giữa hai điểm. Nó có điểm đầu và điểm cuối!",
    showPoints: false,
    autoNext: 4000
  },
  {
    title: "Hai điểm tạo nên đoạn thẳng 🎯",
    content: "Đây là hai điểm A và B. Khi chúng ta nối chúng lại, ta sẽ có một đoạn thẳng AB!",
    showPoints: true,
    autoNext: 4000
  },
  {
    title: "Đoạn thẳng có tính chất gì? 📐",
    content: "Đoạn thẳng luôn thẳng, có độ dài nhất định và là đường ngắn nhất nối hai điểm!",
    showPoints: true,
    autoNext: 4000
  },
  {
    title: "Cùng vẽ đoạn thẳng nào! ✏️",
    content: "Hãy chạm vào điểm A hoặc B và kéo về phía điểm còn lại để tạo ra đoạn thẳng AB!",
    showPoints: true,
    interactive: true,
    showGuide: true,
    autoNext: null
  },
  {
    title: "Tuyệt vời! 🎉",
    content: "Bạn đã tạo ra một đoạn thẳng AB rất đẹp! Hãy tiếp tục thực hành với các bài tập!",
    showPoints: true,
    showStartButton: true,
    autoNext: null
  }
];

interface LineIntroductionProps {
  onComplete: () => void;
}

const LineIntroduction: React.FC<LineIntroductionProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineDrawn, setLineDrawn] = useState(false);
  const [currentLineEnd, setCurrentLineEnd] = useState(POINT_A_POSITION);
  const [lineProgress, setLineProgress] = useState(0); // Progress of line drawing (0-1)
  
  // State for tracking which point is being dragged
  type DraggedPoint = 'A' | 'B' | null;
  const [draggedPoint, setDraggedPoint] = useState<DraggedPoint>(null);
  
  // Consolidated animation values
  const animations = useRef({
    fade: new Animated.Value(0),
    pointAScale: new Animated.Value(0),
    pointBScale: new Animated.Value(0),
    pointAPulse: new Animated.Value(0),
    pointBPulse: new Animated.Value(0),
    line: new Animated.Value(0),
    lineGlow: new Animated.Value(0),
    arrow: new Animated.Value(0),
    text: new Animated.Value(0),
    success: new Animated.Value(0),
    guideLine: new Animated.Value(0),
    arrowPulse: new Animated.Value(0),
    glow: new Animated.Value(0),
    sunRotation: new Animated.Value(0),
    sparkle: new Animated.Value(0),
    vibration: new Animated.Value(0),
  }).current;

  // Memoized current step data
  const currentStepData = useMemo(() => INTRODUCTION_STEPS[currentStep], [currentStep]);

  // Memoized utility functions
  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }, []);

  const getNearestPoint = useCallback((x: number, y: number) => {
    const distanceToA = calculateDistance(x, y, POINT_A_POSITION.x, POINT_A_POSITION.y);
    const distanceToB = calculateDistance(x, y, POINT_B_POSITION.x, POINT_B_POSITION.y);
    return distanceToA < distanceToB ? 'A' : 'B';
  }, [calculateDistance]);

  // Function to constrain line drawing within the actual distance
  const constrainLineEnd = useCallback((startPoint: {x: number, y: number}, touchX: number, touchY: number) => {
    const targetPoint = startPoint === POINT_A_POSITION ? POINT_B_POSITION : POINT_A_POSITION;
    
    // Calculate direction vector from start to target
    const dx = targetPoint.x - startPoint.x;
    const dy = targetPoint.y - startPoint.y;
    
    // Calculate direction vector from start to touch
    const touchDx = touchX - startPoint.x;
    const touchDy = touchY - startPoint.y;
    
    // Calculate the distance from start to touch
    const touchDistance = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
    
    // If touch is beyond the target, constrain it
    if (touchDistance > ACTUAL_DISTANCE) {
      // Normalize the direction to target and scale to actual distance
      const factor = ACTUAL_DISTANCE / touchDistance;
      return {
        x: startPoint.x + touchDx * factor,
        y: startPoint.y + touchDy * factor,
      };
    }
    
    // Also check if the touch is in the general direction of the target
    // Calculate dot product to check direction
    const dotProduct = (touchDx * dx + touchDy * dy) / (Math.sqrt(touchDx * touchDx + touchDy * touchDy) * Math.sqrt(dx * dx + dy * dy));
    
    if (dotProduct < 0) {
      // If moving in opposite direction, return start point
      return startPoint;
    }
    
    return { x: touchX, y: touchY };
  }, []);

  // Calculate line drawing progress (0-1)
  const calculateLineProgress = useCallback((startPoint: {x: number, y: number}, endPoint: {x: number, y: number}) => {
    const distance = calculateDistance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    return Math.min(distance / ACTUAL_DISTANCE, 1);
  }, [calculateDistance]);

  // Reset states when step changes
  useEffect(() => {
    setIsDrawing(false);
    setLineDrawn(false);
    setDraggedPoint(null);
    setCurrentLineEnd(POINT_A_POSITION);
    setLineProgress(0);
  }, [currentStep]);

  // Enhanced gesture handler with constraints
  const panGesture = useMemo(() => Gesture.Pan()
    .onStart((event) => {
      // Only handle gesture in interactive step
      if (!currentStepData.interactive) return;
      
      const touchX = event.x;
      const touchY = event.y;
      
      // Check if touch is near point A or B
      const distanceToA = calculateDistance(touchX, touchY, POINT_A_POSITION.x, POINT_A_POSITION.y);
      const distanceToB = calculateDistance(touchX, touchY, POINT_B_POSITION.x, POINT_B_POSITION.y);
      
      if (distanceToA < TOUCH_THRESHOLD) {
        setIsDrawing(true);
        setDraggedPoint('A');
        setCurrentLineEnd(POINT_A_POSITION);
        setLineProgress(0);
        
        // Start point pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations.pointAPulse, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animations.pointAPulse, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ])
        ).start();
        
      } else if (distanceToB < TOUCH_THRESHOLD) {
        setIsDrawing(true);
        setDraggedPoint('B');
        setCurrentLineEnd(POINT_B_POSITION);
        setLineProgress(0);
        
        // Start point pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations.pointBPulse, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animations.pointBPulse, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ])
        ).start();
      }
    })
    .onUpdate((event) => {
      if (!isDrawing || !draggedPoint || !currentStepData.interactive) return;
      
      const touchX = event.x;
      const touchY = event.y;
      
      const startPoint = draggedPoint === 'A' ? POINT_A_POSITION : POINT_B_POSITION;
      const constrainedEnd = constrainLineEnd(startPoint, touchX, touchY);
      
      setCurrentLineEnd(constrainedEnd);
      
      // Calculate and update progress
      const progress = calculateLineProgress(startPoint, constrainedEnd);
      setLineProgress(progress);
      
      // Animate line glow based on progress
      Animated.timing(animations.lineGlow, {
        toValue: progress,
        duration: 50,
        useNativeDriver: true,
      }).start();
      
      // Vibration effect when getting close to target
      const targetPoint = draggedPoint === 'A' ? POINT_B_POSITION : POINT_A_POSITION;
      const distance = calculateDistance(constrainedEnd.x, constrainedEnd.y, targetPoint.x, targetPoint.y);
      
      if (distance < SNAP_THRESHOLD && distance > 5) {
        Animated.timing(animations.vibration, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          animations.vibration.setValue(0);
        });
      }

      // Snap to target point if close enough
      if (distance < SNAP_THRESHOLD) {
        setCurrentLineEnd(targetPoint);
        setLineProgress(1);
        
        // Enhanced snap animation
        Animated.sequence([
          Animated.timing(animations.sparkle, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animations.sparkle, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    })
    .onEnd((event) => {
      if (!isDrawing || !draggedPoint || !currentStepData.interactive) return;
      
      const touchX = event.x;
      const touchY = event.y;
      
      const targetPoint = draggedPoint === 'A' ? POINT_B_POSITION : POINT_A_POSITION;
      const distance = calculateDistance(touchX, touchY, targetPoint.x, targetPoint.y);

      // Stop pulse animations
      animations.pointAPulse.stopAnimation();
      animations.pointBPulse.stopAnimation();
      animations.pointAPulse.setValue(0);
      animations.pointBPulse.setValue(0);

      if (distance < SNAP_THRESHOLD) {
        setLineDrawn(true);
        setCurrentLineEnd(targetPoint);
        setLineProgress(1);
        
        // Enhanced success animation with sparkles and glow
        Animated.parallel([
          Animated.sequence([
            Animated.timing(animations.success, {
              toValue: 1,
              duration: ANIMATION_DURATION.SUCCESS,
              useNativeDriver: true,
            }),
            Animated.timing(animations.line, {
              toValue: 1,
              duration: ANIMATION_DURATION.LINE,
              useNativeDriver: false,
            })
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(animations.sparkle, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(animations.sparkle, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              })
            ]),
            { iterations: 4 }
          )
        ]).start(() => {
          setTimeout(() => {
            nextStep();
          }, 2000);
        });
      } else {
        // Reset if not close enough
        setCurrentLineEnd(draggedPoint === 'A' ? POINT_A_POSITION : POINT_B_POSITION);
        setLineProgress(0);
        animations.lineGlow.setValue(0);
      }
      
      setIsDrawing(false);
      setDraggedPoint(null);
    })
    .runOnJS(true), [isDrawing, draggedPoint, calculateDistance, currentStepData.interactive, constrainLineEnd, calculateLineProgress]);

  // Optimized animation functions
  const startBackgroundAnimations = useCallback(() => {
    Animated.loop(
      Animated.timing(animations.sunRotation, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animations.sunRotation]);

  const resetAnimations = useCallback(() => {
    Object.values(animations).forEach(anim => anim.setValue(0));
  }, [animations]);

  const animateStepEntry = useCallback(() => {
    resetAnimations();

    // Main entry animation
    Animated.sequence([
      Animated.timing(animations.fade, {
        toValue: 1,
        duration: ANIMATION_DURATION.FADE,
        useNativeDriver: true,
      }),
      Animated.timing(animations.text, {
        toValue: 1,
        duration: ANIMATION_DURATION.TEXT,
        useNativeDriver: true,
      })
    ]).start();

    // Points animation
    if (currentStepData.showPoints) {
      setTimeout(() => {
        Animated.stagger(300, [
          Animated.spring(animations.pointAScale, {
            toValue: 1,
            ...ANIMATION_DURATION.SPRING,
            useNativeDriver: true,
          }),
          Animated.spring(animations.pointBScale, {
            toValue: 1,
            ...ANIMATION_DURATION.SPRING,
            useNativeDriver: true,
          })
        ]).start();

        if (currentStepData.interactive) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(animations.glow, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(animations.glow, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              })
            ])
          ).start();
        }
      }, 1000);
    }

    // Guide animation
    if (currentStepData.showGuide) {
      Animated.timing(animations.guideLine, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations.arrowPulse, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(animations.arrowPulse, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            })
          ])
        ).start();
      });
    }

    // Arrow animation for navigation
    if (!currentStepData.interactive && !currentStepData.showStartButton) {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations.arrow, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animations.arrow, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        ).start();
      }, 2000);
    }
  }, [currentStepData, resetAnimations, animations]);

  const nextStep = useCallback(() => {
    if (currentStep < INTRODUCTION_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  // Effects
  useEffect(() => {
    startBackgroundAnimations();
  }, [startBackgroundAnimations]);

  useEffect(() => {
    animateStepEntry();
  }, [currentStep, animateStepEntry]);

  useEffect(() => {
    if (typeof currentStepData.autoNext === 'number') {
      const timer = setTimeout(nextStep, currentStepData.autoNext);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentStepData.autoNext, nextStep]);

  // Memoized render functions
  const renderInteractiveArea = useCallback(() => {
    if (!currentStepData.showPoints) return null;

    const startPoint = isDrawing && draggedPoint ? 
      (draggedPoint === 'A' ? POINT_A_POSITION : POINT_B_POSITION) : 
      POINT_A_POSITION;

    return (
      <View style={styles.interactiveArea}>
        <Svg height={height} width={width} style={styles.svg}>
          <Defs>
            <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
              <Stop offset="50%" stopColor="#4ECDC4" stopOpacity="1" />
              <Stop offset="100%" stopColor="#45B7D1" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#FF69B4" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#00CED1" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          
          {/* Guide line */}
          {currentStepData.showGuide && (
            <Line
              x1={POINT_A_POSITION.x}
              y1={POINT_A_POSITION.y}
              x2={POINT_B_POSITION.x}
              y2={POINT_B_POSITION.y}
              stroke="rgba(0, 0, 0, 0.2)"
              strokeWidth="2"
              strokeDasharray="5, 5"
              strokeLinecap="round"
            />
          )}
          
          {/* Drawing line with glow effect */}
          {(isDrawing || lineDrawn) && (
            <>
              {/* Glow effect */}
              <Line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={currentLineEnd.x}
                y2={currentLineEnd.y}
                stroke="url(#glowGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                opacity={lineProgress * 0.5}
              />
              {/* Main line */}
              <Line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={currentLineEnd.x}
                y2={currentLineEnd.y}
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          )}
          
          {/* Points with enhanced styling */}
          <Circle
            cx={POINT_A_POSITION.x}
            cy={POINT_A_POSITION.y}
            r="15"
            fill="#FF6B6B"
            stroke="#fff"
            strokeWidth="4"
            opacity={0.9}
          />
          {/* Point A glow */}
          <Circle
            cx={POINT_A_POSITION.x}
            cy={POINT_A_POSITION.y}
            r="20"
            fill="rgba(255, 107, 107, 0.3)"
            opacity={isDrawing && draggedPoint === 'A' ? 1 : 0}
          />
          
          <SvgText
            x={POINT_A_POSITION.x}
            y={POINT_A_POSITION.y - 25}
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            fill="#FF6B6B"
          >
            Điểm A
          </SvgText>
          
          <Circle
            cx={POINT_B_POSITION.x}
            cy={POINT_B_POSITION.y}
            r="15"
            fill="#4ECDC4"
            stroke="#fff"
            strokeWidth="4"
            opacity={0.9}
          />
          {/* Point B glow */}
          <Circle
            cx={POINT_B_POSITION.x}
            cy={POINT_B_POSITION.y}
            r="20"
            fill="rgba(78, 205, 196, 0.3)"
            opacity={isDrawing && draggedPoint === 'B' ? 1 : 0}
          />
          
          <SvgText
            x={POINT_B_POSITION.x}
            y={POINT_B_POSITION.y - 25}
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            fill="#4ECDC4"
          >
            Điểm B
          </SvgText>
        </Svg>
        
        {/* Progress indicator */}
        {isDrawing && (
          <Animated.View
            style={[
              styles.progressIndicator,
              {
                opacity: animations.lineGlow,
                transform: [
                  {
                    scale: animations.lineGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.progressText}>
              {Math.round(lineProgress * 100)}%
            </Text>
          </Animated.View>
        )}
        
        {/* Guide arrow */}
        {currentStepData.showGuide && (
          <Animated.View
            style={[
              styles.guideArrow,
              {
                left: (POINT_A_POSITION.x + POINT_B_POSITION.x) / 2 - 15,
                top: (POINT_A_POSITION.y + POINT_B_POSITION.y) / 2 - 15,
                opacity: animations.arrowPulse,
                transform: [
                  {
                    scale: animations.arrowPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons name="arrow-forward" size={30} color="#4CAF50" />
          </Animated.View>
        )}
        
        {/* Sparkle effects */}
        {(isDrawing || lineDrawn) && (
          <Animated.View
            style={[
              styles.sparkleContainer,
              {
                opacity: animations.sparkle,
                transform: [
                  {
                    scale: animations.sparkle.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.sparkle}>⭐</Text>
            <Text style={styles.sparkle}>💫</Text>
          </Animated.View>
        )}
        
        {/* Success message */}
        {lineDrawn && (
          <Animated.View 
            style={[
              styles.successMessage,
              {
                opacity: animations.success,
                transform: [
                  {
                    scale: animations.success.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.successText}>🎉 Tuyệt vời! Bạn đã tạo ra đoạn thẳng AB!</Text>
          </Animated.View>
        )}
      </View>
    );
  }, [currentStepData, isDrawing, lineDrawn, currentLineEnd, draggedPoint, lineProgress, animations]);

  const renderProgressDots = useCallback(() => (
    <View style={styles.progressContainer}>
      {INTRODUCTION_STEPS.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === currentStep && styles.progressDotActive
          ]}
        />
      ))}
    </View>
  ), [currentStep]);

  const renderNavigation = useCallback(() => {
    if (currentStepData.showStartButton) {
      return (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onComplete}
        >
          <Text style={styles.startButtonText}>Bắt đầu làm bài! 🚀</Text>
        </TouchableOpacity>
      );
    }

    if (currentStepData.interactive) return null;
    
    return (
      <Animated.View 
        style={[
          styles.arrowContainer,
          {
            opacity: animations.arrow,
            transform: [
              {
                translateY: animations.arrow.interpolate({
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
  }, [currentStepData, nextStep, onComplete, animations]);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Character */}
      <Animated.View 
        style={[
          styles.characterContainer,
          {
            opacity: animations.fade,
            transform: [{ scale: animations.fade }]
          }
        ]}
      >
        <View style={styles.character}>
          <Text style={styles.characterFace}>📐</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: animations.text,
            transform: [
              {
                translateY: animations.text.interpolate({
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

      {/* Interactive area with gesture detector */}
      {currentStepData.interactive && (
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureArea}>
            {renderInteractiveArea()}
          </View>
        </GestureDetector>
      )}

      {/* Non-interactive area */}
      {!currentStepData.interactive && renderInteractiveArea()}

      {/* Progress dots */}
      {renderProgressDots()}

      {/* Navigation */}
      {renderNavigation()}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    position: 'absolute',
    top: height * 0.08,
    alignItems: 'center',
  },
  character: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DDD',
  },
  characterFace: {
    fontSize: 40,
  },
  contentContainer: {
    position: 'absolute',
    top: height * 0.2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 22,
  },
  interactiveArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressIndicator: {
    position: 'absolute',
    top: height * 0.45,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  guideArrow: {
    position: 'absolute',
  },
  sparkleContainer: {
    position: 'absolute',
    top: height * 0.5,
    left: width / 2 - 50,
    width: 100,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 24,
  },
  gestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  successMessage: {
    position: 'absolute',
    top: height * 0.4,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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

export default React.memo(LineIntroduction);