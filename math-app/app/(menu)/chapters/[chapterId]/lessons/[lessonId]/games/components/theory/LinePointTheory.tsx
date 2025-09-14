
import { TUTORIAL_STEPS } from 'app/(menu)/chapters/data/tutorialData/PointLine.data';
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  PanResponder,
  ImageBackground,
  Image,
  AppState
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Line, Circle, G } from 'react-native-svg';
import { useSpeech } from './useSpeechHook';

interface Point {
  x: number;
  y: number;
  id: number;
  animation: Animated.Value;
}

interface LineSegment {
  start: Point;
  end: Point;
  id: number;
  animation: Animated.Value;
}



interface GeometryTutorialProps {
  onComplete: () => void;
  onExit?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const drawAreaWidth = screenWidth - 40;

// Grid constants
const GRID_SIZE = 25;
const GRID_PADDING = 20;

// Animation constants
const POINT_RADIUS = 8; // Reduced from 12 to 8
const LINE_WIDTH = POINT_RADIUS ; // Line width equals point diameter



export default function GeometryTutorial({ onComplete, onExit }: GeometryTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoPoints, setDemoPoints] = useState<Point[]>([]);
  const [demoLines, setDemoLines] = useState<LineSegment[]>([]);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  
  // Initialize speech hook with page management
  const {
    speak,
    stopSpeech,
    isPageActive
  } = useSpeech({
    pageId: 'geometry-tutorial',
    autoCleanupOnUnmount: true,
    autoStopOnBlur: true
  });
  
  // Drawing state for interactive demo
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStart, setCurrentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  
  // Animation state for line demo
  const [animatedLineProgress] = useState(new Animated.Value(0));
  const [currentAnimatedLineX, setCurrentAnimatedLineX] = useState(0);
  const [currentAnimatedLineY, setCurrentAnimatedLineY] = useState(0);
  const [showAnimatedLine, setShowAnimatedLine] = useState(false);
  
  // Ref to store current demo points for animation
  const demoPointsRef = useRef<Point[]>([]);
  const animationActiveRef = useRef(false);

  // Helper function to update demo points and ref together
  const updateDemoPoints = React.useCallback((newPoints: Point[] | ((prev: Point[]) => Point[])) => {
    if (typeof newPoints === 'function') {
      setDemoPoints(prev => {
        const updated = newPoints(prev);
        demoPointsRef.current = updated;
        return updated;
      });
    } else {
      setDemoPoints(newPoints);
      demoPointsRef.current = newPoints;
    }
  }, []);

  const currentTutorial = TUTORIAL_STEPS[currentStep];

  // Text-to-speech function using the speech hook
  const speakTutorialContent = React.useCallback(async (step: number) => {
    // Check if page is still active before speaking
    if (!isPageActive) {
      console.log('🛑 Page not active - canceling speech');
      return;
    }
    
    if (step < TUTORIAL_STEPS.length) {
      const tutorial = TUTORIAL_STEPS[step];
      const textToSpeak = `${tutorial.title}. ${tutorial.content}`;
      
      try {
        console.log('🎤 Speaking tutorial step:', tutorial.title);
        await speak(textToSpeak);
      } catch (error) {
        console.warn('Failed to speak tutorial content:', error);
        // Continue without crashing the app
      }
    }
  }, [speak, isPageActive]);

  // Create animated point with pulsing effect
  const createAnimatedPoint = (x: number, y: number): Point => {
    const animationValue = new Animated.Value(0);
    
    // Start pulsing animation immediately
    const pulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    // Initial scale-in animation
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(pulseAnimation);

    return {
      x,
      y,
      id: Date.now() + Math.random(),
      animation: animationValue
    };
  };

  // Create animated line with drawing effect
  const createAnimatedLine = (start: Point, end: Point): LineSegment => {
    const animationValue = new Animated.Value(0);
    
    // Draw-in animation
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return {
      start,
      end,
      id: Date.now() + Math.random(),
      animation: animationValue
    };
  };

  // Start continuous line animation for "Đoạn thẳng là gì?" demo
  const startContinuousLineAnimation = React.useCallback(() => {
    if (animationActiveRef.current) return; // Prevent multiple animations
    animationActiveRef.current = true;
    
    const animateSequence = () => {
      if (!animationActiveRef.current) return; // Check if animation should continue
      
      // Reset animation
      animatedLineProgress.setValue(0);
      
      // Set up listener to update current position
      const listenerId = animatedLineProgress.addListener(({ value }) => {
        const currentPoints = demoPointsRef.current;
        if (currentPoints.length >= 2) {
          // Always animate from left point to right point
          const leftPoint = currentPoints[0]; // Left point
          const rightPoint = currentPoints[1]; // Right point
          
          const interpolatedX = leftPoint.x + (rightPoint.x - leftPoint.x) * value;
          const interpolatedY = leftPoint.y + (rightPoint.y - leftPoint.y) * value;
          
          setCurrentAnimatedLineX(interpolatedX);
          setCurrentAnimatedLineY(interpolatedY);
        }
      });
      
      // Animate line from left to right
      Animated.timing(animatedLineProgress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        // Remove listener
        animatedLineProgress.removeListener(listenerId);
        
        if (!animationActiveRef.current) return;
        
        // Wait a bit, then restart the animation
        setTimeout(() => {
          if (!animationActiveRef.current) return;
          animateSequence(); // Restart the same animation
        }, 1000);
      });
    };
    
    animateSequence();
  }, [animatedLineProgress]);

  // Function to snap point to nearest grid intersection
  const snapToGrid = React.useCallback((x: number, y: number): Point => {
    const gridX = Math.round((x - GRID_PADDING) / GRID_SIZE) * GRID_SIZE + GRID_PADDING;
    const gridY = Math.round((y - GRID_PADDING) / GRID_SIZE) * GRID_SIZE + GRID_PADDING;
    
    const clampedX = Math.max(GRID_PADDING, Math.min(drawAreaWidth - GRID_PADDING, gridX));
    const clampedY = Math.max(GRID_PADDING, Math.min(180, gridY));
    
    return createAnimatedPoint(clampedX, clampedY);
  }, []);

  // Generate grid lines for rendering
  const generateGridLines = () => {
    const lines = [];
    
    // Vertical lines
    for (let x = GRID_PADDING; x <= drawAreaWidth - GRID_PADDING; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          x1={x}
          y1={GRID_PADDING}
          x2={x}
          y2={200 - GRID_PADDING}
          stroke="#bdc3c7"
          strokeWidth="0.5"
          opacity="0.4"
        />
      );
    }
    
    // Horizontal lines
    for (let y = GRID_PADDING; y <= 200 - GRID_PADDING; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          x1={GRID_PADDING}
          y1={y}
          x2={drawAreaWidth - GRID_PADDING}
          y2={y}
          stroke="#bdc3c7"
          strokeWidth="0.5"
          opacity="0.4"
        />
      );
    }
    
    return lines;
  };

  // Generate sample points for line drawing demo
  const generateSamplePoints = React.useCallback(() => {
    const points: Point[] = [];
    
    // Create 4 points at grid intersections
    const positions = [
      { x: GRID_PADDING + GRID_SIZE * 2, y: GRID_PADDING + GRID_SIZE * 2 },
      { x: drawAreaWidth - GRID_PADDING - GRID_SIZE * 2, y: GRID_PADDING + GRID_SIZE * 2 },
      { x: GRID_PADDING + GRID_SIZE * 2, y: 200 - GRID_PADDING - GRID_SIZE * 2 },
      { x: drawAreaWidth - GRID_PADDING - GRID_SIZE * 2, y: 200 - GRID_PADDING - GRID_SIZE * 2 }
    ];
    
    positions.forEach((pos, index) => {
      setTimeout(() => {
        // Ensure points are exactly on grid intersections
        const point = createAnimatedPoint(pos.x, pos.y);
        updateDemoPoints(prev => [...prev, point]);
      }, index * 200); // Stagger point creation
    });
    
    return points;
  }, [updateDemoPoints]);

  // Smooth step transition
  const transitionToStep = async (newStep: number) => {
    // Stop any ongoing speech before transition
    try {
      await stopSpeech();
      console.log('🛑 Speech stopped before step transition');
    } catch (error) {
      console.warn('Error stopping speech before transition:', error);
    }
    
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: newStep > currentStep ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(newStep);
      
      // Reset and animate in new content
      slideAnimation.setValue(newStep > currentStep ? 100 : -100);
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Speak the new tutorial step content after transition completes
        setTimeout(async () => {
          // Double-check page is still active before speaking
          if (!isPageActive) {
            console.log('🛑 Page not active during transition - canceling speech');
            return;
          }
          try {
            await speakTutorialContent(newStep);
          } catch (error) {
            console.warn('Failed to speak tutorial content during transition:', error);
          }
        }, 500); // Small delay to let the content settle
      });
    });
  };

  // Demo effects when step changes
  useEffect(() => {
    // Initialize improved speech utils configuration (optional - you can configure this globally)
    // ImprovedSpeechUtils.setZaloConfig({
    //   apiKey: 'YOUR_ZALO_AI_API_KEY',
    //   voice: 'female', // or 'male', 'southernfemale', 'southernmale'
    //   speed: 1.0
    // });
    
    // Stop any ongoing animation
    animationActiveRef.current = false;
    
    // Reset demo state
    updateDemoPoints([]);
    setDemoLines([]);
    setIsDrawing(false);
    setCurrentStart(null);
    setCurrentEnd(null);
    
    // Reset animated line
    animatedLineProgress.setValue(0);
    animatedLineProgress.removeAllListeners(); // Clean up any existing listeners
    setShowAnimatedLine(false); // Hide animated line initially
    setCurrentAnimatedLineX(0);
    setCurrentAnimatedLineY(0);
    
    if (currentTutorial.demo) {
      if (currentTutorial.demo === 'point') {
        setTimeout(() => {
          const demoPoint = snapToGrid(drawAreaWidth / 2, 100);
          updateDemoPoints([demoPoint]);
        }, 500);
      } else if (currentTutorial.demo === 'line') {
        setTimeout(() => {
          // Create points for the animated line demo - ensure they are positioned exactly where needed
          const startPoint = snapToGrid(GRID_PADDING + GRID_SIZE * 3, 100); // Move points a bit more inward
          const endPoint = snapToGrid(drawAreaWidth - GRID_PADDING - GRID_SIZE * 3, 100);
          updateDemoPoints([startPoint, endPoint]);
          
          // Wait for points to be visible, then initialize animated line properly
          setTimeout(() => {
            // Initialize animated line position to exactly match the start point
            setCurrentAnimatedLineX(startPoint.x);
            setCurrentAnimatedLineY(startPoint.y);
            
            // Show the animated line now that points are ready
            setShowAnimatedLine(true);
            
            // Start continuous line animation with a small delay
            setTimeout(() => {
              startContinuousLineAnimation();
            }, 300);
          }, 300); // Wait for points to appear
        }, 500);
      } else if (currentTutorial.demo === 'draw-line') {
        setTimeout(() => {
          generateSamplePoints();
        }, 500);
      }
    }
    
    // Cleanup function
    return () => {
      animationActiveRef.current = false;
      animatedLineProgress.removeAllListeners();
      setShowAnimatedLine(false);
    };
  }, [currentStep, currentTutorial.demo, snapToGrid, generateSamplePoints, startContinuousLineAnimation, animatedLineProgress, updateDemoPoints, stopSpeech]);

  // Handle app state changes to stop speech when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 App going to background/inactive - stopping speech');
        stopSpeech().then(() => {
          console.log('🛑 Speech stopped due to app state change');
        }).catch((error) => {
          console.warn('Error stopping speech on app state change:', error);
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [stopSpeech]);

  // Speak the tutorial content when component mounts (first step)
  useEffect(() => {
    // Speak the initial tutorial step with a delay to let the component render
    const timer = setTimeout(async () => {
      try {
        await speakTutorialContent(0);
      } catch (error) {
        console.warn('Failed to speak initial tutorial content:', error);
      }
    }, 1000); // 1 second delay for initial speech

    return () => {
      clearTimeout(timer);
      // Speech cleanup is handled by the useSpeech hook
    };
  }, [speakTutorialContent]); // Include speakTutorialContent dependency

  // Handle tutorial demo interactions
  const handleDemoPointTap = (event: any) => {
    if (currentTutorial.demo !== 'draw-point') return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    // For "Thử vẽ điểm nào!" section, place points exactly where user touches
    // For other sections, snap to grid
    const newPoint = currentTutorial.demo === 'draw-point' 
      ? createAnimatedPoint(locationX, locationY) 
      : snapToGrid(locationX, locationY);
    
    // Check if point already exists at this position
    const existingPoint = demoPoints.find((point: Point) => 
      Math.abs(point.x - newPoint.x) < 5 && Math.abs(point.y - newPoint.y) < 5
    );
    
    if (!existingPoint) {
      updateDemoPoints(prev => [...prev, newPoint]);
    }
  };

  // Pan responder for line drawing demo
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      return currentTutorial.demo === 'draw-line';
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return currentTutorial.demo === 'draw-line' && Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderTerminationRequest: () => false,
    
    onPanResponderGrant: (event, gestureState) => {
      if (currentTutorial.demo !== 'draw-line') return;
      
      const { locationX, locationY } = event.nativeEvent;
      
      let closestPoint: Point | null = null;
      let minDistance = Infinity;
      
      demoPoints.forEach((point: Point) => {
        const distance = Math.sqrt(
          Math.pow(locationX - point.x, 2) + Math.pow(locationY - point.y, 2)
        );
        
        if (distance < minDistance && distance < 40) { // Increased touch radius
          minDistance = distance;
          closestPoint = point;
        }
      });
      
      if (closestPoint) {
        setCurrentStart(closestPoint);
        setCurrentEnd(closestPoint);
        setIsDrawing(true);
        
        // Highlight selected point
        const selectedPoint = closestPoint as Point;
        Animated.sequence([
          Animated.timing(selectedPoint.animation, {
            toValue: 1.5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(selectedPoint.animation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
      }
    },
    
    onPanResponderMove: (event, gestureState) => {
      if (!isDrawing || !currentStart) return;
      
      const { locationX, locationY } = event.nativeEvent;
      setCurrentEnd({ 
        x: locationX, 
        y: locationY, 
        id: Date.now(),
        animation: new Animated.Value(1)
      });
    },
    
    onPanResponderRelease: (event, gestureState) => {
      if (!isDrawing || !currentStart || !currentEnd) return;
      
      const { locationX, locationY } = event.nativeEvent;
      
      let targetPoint: Point | null = null;
      let minDistance = Infinity;
      
      demoPoints.forEach((point: Point) => {
        if (point.id === currentStart.id) return;
        
        const distance = Math.sqrt(
          Math.pow(locationX - point.x, 2) + Math.pow(locationY - point.y, 2)
        );
        
        if (distance < minDistance && distance < 40) { // Increased touch radius
          minDistance = distance;
          targetPoint = point;
        }
      });
      
      if (targetPoint) {
        const existingLine = demoLines.find((line: LineSegment) => 
          (line.start.id === currentStart.id && line.end.id === targetPoint!.id) ||
          (line.start.id === targetPoint!.id && line.end.id === currentStart.id)
        );
        
        if (!existingLine) {
          const newLine = createAnimatedLine(currentStart, targetPoint);
          setDemoLines([...demoLines, newLine]);
          
          // Highlight target point
          const highlightPoint = targetPoint as Point;
          Animated.sequence([
            Animated.timing(highlightPoint.animation, {
              toValue: 1.5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(highlightPoint.animation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            })
          ]).start();
        }
      }
      
      setIsDrawing(false);
      setCurrentStart(null);
      setCurrentEnd(null);
    },
    
    onPanResponderTerminate: () => {
      setIsDrawing(false);
      setCurrentStart(null);
      setCurrentEnd(null);
    }
  }), [currentTutorial.demo, demoPoints, demoLines, isDrawing, currentStart, currentEnd]);

  const handleNext = async () => {
    try {
      // Stop current speech immediately before transitioning
      await stopSpeech();
      console.log('🛑 Speech stopped before next transition');
    } catch (error) {
      console.warn('Error stopping speech in handleNext:', error);
    }
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      await transitionToStep(currentStep + 1);
    } else {
      // Ensure speech is stopped when completing tutorial
      try {
        await stopSpeech();
        console.log('🛑 Speech stopped before tutorial completion');
      } catch (error) {
        console.warn('Error stopping speech before completion:', error);
      }
      onComplete();
    }
  };

  const handlePrevious = async () => {
    try {
      // Stop current speech immediately before going back
      await stopSpeech();
      console.log('🛑 Speech stopped before previous transition');
    } catch (error) {
      console.warn('Error stopping speech in handlePrevious:', error);
    }
    
    if (currentStep > 0) {
      await transitionToStep(currentStep - 1);
    }
  };

  const clearDemo = () => {
    if (currentTutorial.demo === 'draw-point') {
      updateDemoPoints([]);
    } else if (currentTutorial.demo === 'draw-line') {
      setDemoLines([]);
      updateDemoPoints([]);
      setTimeout(() => generateSamplePoints(), 200);
    }
  };

  // Render animated point component
  const renderAnimatedPoint = (point: Point) => {
    return (
      <Animated.View
        key={point.id}
        style={[
          styles.animatedPoint,
          {
            left: point.x - POINT_RADIUS,
            top: point.y - POINT_RADIUS,
            transform: [
              {
                scale: point.animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
            opacity: point.animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          },
        ]}
      >
        <View style={styles.pointInner} />
        <Animated.View
          style={[
            styles.pointGlow,
            {
              opacity: point.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../../../../../../../../assets/images/portada.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Exit button */}
        {onExit && (
          <TouchableOpacity 
            style={styles.exitButton} 
            onPress={async () => {
              try {
                // Stop speech immediately when exiting
                await stopSpeech();
                console.log('🛑 Speech stopped before exit');
              } catch (error) {
                console.warn('Error stopping speech before exit:', error);
              }
              onExit();
            }}
          >
            <Text style={styles.exitButtonText}>←</Text>
          </TouchableOpacity>
        )}

        {/* Tutorial content with smooth transitions */}
        <Animated.View 
          style={[
            styles.tutorialContent,
            {
              opacity: fadeAnimation,
              transform: [{ translateX: slideAnimation }],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.tutorialTitle}>{currentTutorial.title}</Text>
            {/* Speech button to repeat current step with improved TTS */}
            <TouchableOpacity 
              style={styles.speechButton}
              onPress={async () => {
                if (!isPageActive) {
                  console.log('🛑 Page not active - canceling manual speech');
                  return;
                }
                try {
                  console.log('🔊 Manual speech button pressed');
                  await speakTutorialContent(currentStep);
                } catch (error) {
                  console.warn('Failed to speak tutorial content from button:', error);
                }
              }}
            >
              <Text style={styles.speechButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tutorialText}>{currentTutorial.content}</Text>
          
          {currentStep === 0 && (
            <View style={styles.gifContainer}>
              <Image
                source={require('../../../../../../../../../assets/images/playful1.gif')}
                style={styles.welcomeGif}
                resizeMode="contain"
              />
            </View>
          )}
        </Animated.View>

        {/* Interactive demo area */}
        {currentTutorial.interactive && (
          <Animated.View 
            style={[styles.demoContainer, { opacity: fadeAnimation }]}
          >
            {currentTutorial.demo === 'draw-point' ? (
              <TouchableOpacity
                style={styles.demoCanvas}
                onPress={handleDemoPointTap}
                activeOpacity={1}
              >
                <Svg width={drawAreaWidth} height={200}>
                  <G opacity={0.3}>
                    {generateGridLines()}
                  </G>
                  
                  {/* SVG points for reference (invisible) */}
                  {demoPoints.map((point) => (
                    <Circle
                      key={`svg-${point.id}`}
                      cx={point.x}
                      cy={point.y}
                      r={POINT_RADIUS}
                      fill="transparent"
                    />
                  ))}
                </Svg>

                {/* Animated points overlay */}
                {demoPoints.map(renderAnimatedPoint)}

                {demoPoints.length === 0 && currentStep >= 2 && (
                  <Text style={styles.demoHint}>Chạm vào lưới để tạo điểm!</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View 
                style={styles.demoCanvas}
                {...(currentTutorial.demo === 'draw-line' ? panResponder.panHandlers : {})}
              >
                <Svg 
                  width={drawAreaWidth} 
                  height={200}
                  style={{ position: 'absolute' }}
                  pointerEvents="none"
                >
                  <G opacity={0.3}>
                    {generateGridLines()}
                  </G>
                  
                  {/* Animated lines */}
                  {demoLines.map((line) => (
                    <G key={line.id}>
                      <Line
                        x1={line.start.x}
                        y1={line.start.y}
                        x2={line.end.x}
                        y2={line.end.y}
                        stroke="#27ae60"
                        strokeWidth={LINE_WIDTH}
                        strokeLinecap="round"
                      />
                    </G>
                  ))}
                  
                  {/* Continuous animated line for "Đoạn thẳng là gì?" demo */}
                  {currentTutorial.demo === 'line' && demoPoints.length >= 2 && showAnimatedLine && (
                    <G>
                      {/* Draw the line with rounded caps that perfectly align with points */}
                      <Line
                        x1={demoPoints[0].x} // Exact center of left point
                        y1={demoPoints[0].y} // Exact center of left point
                        x2={currentAnimatedLineX} // Animated end position
                        y2={currentAnimatedLineY} // Animated end position
                        stroke="#27ae60"
                        strokeWidth={LINE_WIDTH}
                        strokeLinecap="round" // Rounded caps like points
                        opacity={0.9}
                      />
                    </G>
                  )}
                  
                  {/* Current line being drawn */}
                  {isDrawing && currentStart && currentEnd && (
                    <Line
                      x1={currentStart.x}
                      y1={currentStart.y}
                      x2={currentEnd.x}
                      y2={currentEnd.y}
                      stroke="#e74c3c"
                      strokeWidth={LINE_WIDTH}
                      strokeLinecap="round"
                      strokeDasharray="10,5"
                      opacity={0.8}
                    />
                  )}
                </Svg>

                {/* Animated points overlay */}
                <View style={{ position: 'absolute', width: '100%', height: '100%' }} pointerEvents="none">
                  {demoPoints.map(renderAnimatedPoint)}
                </View>

                {demoLines.length === 0 && currentStep >= 2 && currentStep !== 3 && (
                  <Text style={styles.demoHint}>Kéo từ điểm này sang điểm khác!</Text>
                )}
              </View>
            )}

            {(currentTutorial.demo === 'draw-point' || currentTutorial.demo === 'draw-line') && 
             (demoPoints.length > 0 || demoLines.length > 0) && (
              <TouchableOpacity style={styles.clearDemoButton} onPress={clearDemo}>
                <Text style={styles.clearDemoText}>🗑️ Xóa để thử lại</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
              <Text style={styles.prevButtonText}>←</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === TUTORIAL_STEPS.length - 1 ? '🎮' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exitButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tutorialContent: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 15,
  },
  speechButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  speechButtonText: {
    fontSize: 20,
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    flex: 1, // Take available space in the container
  },
  tutorialText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gifContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -100,
  },
  welcomeGif: {
    width: 400,
    height: 400,
  },
  demoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  demoCanvas: {
    width: drawAreaWidth,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  animatedPoint: {
    position: 'absolute',
    width: POINT_RADIUS * 2,
    height: POINT_RADIUS * 2,
    borderRadius: POINT_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pointInner: {
    width: POINT_RADIUS * 2,
    height: POINT_RADIUS * 2,
    borderRadius: POINT_RADIUS,
    backgroundColor: '#e74c3c',
    borderWidth: 2,
    borderColor: '#c0392b',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  pointGlow: {
    position: 'absolute',
    width: POINT_RADIUS * 3,
    height: POINT_RADIUS * 3,
    borderRadius: POINT_RADIUS * 1.5,
    backgroundColor: '#e74c3c',
    top: -POINT_RADIUS * 0.5,
    left: -POINT_RADIUS * 0.5,
    zIndex: -1,
  },
  demoHint: {
    position: 'absolute',
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  clearDemoButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearDemoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  prevButton: {
    backgroundColor: 'rgba(149, 165, 166, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});