import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the paths to character images
const characterImages = {
  idle: require('../../../../../../../../assets/images/character/idle1.png'),
  run1: require('../../../../../../../../assets/images/character/run1.png'),
  run2: require('../../../../../../../../assets/images/character/run2.png'),
  run3: require('../../../../../../../../assets/images/character/run3.png'),
  run4: require('../../../../../../../../assets/images/character/run4.png'),
  run5: require('../../../../../../../../assets/images/character/run5.png'),
};

interface Platform {
  x: number;
  width: number;
}

interface GameState {
  platforms: Platform[];
  currentIndex: number;
  bridgeLength: number;
  characterPosition: number;
  cameraOffset: number;
  score: number;
  level: number;
  correctAnswer: number;
  answerOptions: number[];
  showQuestion: boolean;
  selectedAnswer: number | null;
  isAnimating: boolean;
  gameOver: boolean;
  // Add character animation state
  characterState: 'idle' | 'running';
}

const { width: screenWidth } = Dimensions.get("window");
const GROUND_HEIGHT = 100;
const CHARACTER_SIZE = 80; // Increased from 30 to 40
const PLATFORM_HEIGHT = 60;
const PIXELS_PER_CM = 15;

export default function StickHeroMeasurementGame({ gameData }: any) {
  const [gameState, setGameState] = useState<GameState>({
    platforms: [],
    currentIndex: 0,
    bridgeLength: 0,
    characterPosition: 0,
    cameraOffset: 0,
    score: 0,
    level: 1,
    correctAnswer: 5,
    answerOptions: [4, 5, 6, 7],
    showQuestion: true,
    selectedAnswer: null,
    isAnimating: false,
    gameOver: false,
    characterState: 'idle', // Initialize character state as idle
  });

  const characterAnim = useRef(new Animated.Value(0)).current;
  const bridgeAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const cameraAnim = useRef(new Animated.Value(0)).current;
  // Ref for character animation interval
  const characterAnimationRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for current running frame
  const runningFrameRef = useRef(0);

  useEffect(() => {
    initGame();
    return () => {
      // Clean up animation interval on unmount
      if (characterAnimationRef.current) {
        clearInterval(characterAnimationRef.current);
      }
    };
  }, []);

  // Function to start character running animation
  const startCharacterRunning = () => {
    setGameState(prev => ({ ...prev, characterState: 'running' }));
    
    // Reset frame counter
    runningFrameRef.current = 0;
    
    // Start animation loop
    if (characterAnimationRef.current) {
      clearInterval(characterAnimationRef.current);
    }
    
    characterAnimationRef.current = setInterval(() => {
      runningFrameRef.current = (runningFrameRef.current + 1) % 5; // Cycle through run1-run5
      // Force a re-render to update the character image
      setGameState(prev => ({ ...prev }));
    }, 100) as unknown as NodeJS.Timeout; // Type assertion to fix the type error
  };

  // Function to stop character running animation
  const stopCharacterRunning = () => {
    if (characterAnimationRef.current) {
      clearInterval(characterAnimationRef.current);
      characterAnimationRef.current = null;
    }
    setGameState(prev => ({ ...prev, characterState: 'idle' }));
  };

  const generatePlatforms = (): Platform[] => {
    const platforms = [];
    let currentX = 100;
    
    for (let i = 0; i < 10; i++) {
      const width = Math.random() * 60 + 60;
      platforms.push({ x: currentX, width });
      
      const gapCm = Math.floor(Math.random() * 8) + 2;
      currentX += width + gapCm * PIXELS_PER_CM;
    }
    return platforms;
  };

  const generateAnswerOptions = (correct: number): number[] => {
    const options = [correct];
    const possible = [];
    
    for (let i = 1; i <= 10; i++) {
      if (i !== correct && Math.abs(i - correct) <= 3) {
        possible.push(i);
      }
    }
    
    while (options.length < 4 && possible.length > 0) {
      const idx = Math.floor(Math.random() * possible.length);
      options.push(possible.splice(idx, 1)[0]);
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  const initGame = () => {
    // Stop any running animation
    stopCharacterRunning();
    
    const platforms = generatePlatforms();
    const leftPlatform = platforms[0];
    const rightPlatform = platforms[1];
    
    const gapPixels = rightPlatform.x - (leftPlatform.x + leftPlatform.width);
    const gapCm = Math.round(gapPixels / PIXELS_PER_CM);
    const answerOptions = generateAnswerOptions(gapCm);
    
    // Position character in the center of the platform instead of at the edge
    const charPos = leftPlatform.x + (leftPlatform.width / 2) - (CHARACTER_SIZE / 2);
    const camOffset = leftPlatform.x - 50;
    
    setGameState({
      platforms,
      currentIndex: 0,
      bridgeLength: 0,
      characterPosition: charPos,
      cameraOffset: camOffset,
      score: 0,
      level: 1,
      correctAnswer: gapCm,
      answerOptions,
      showQuestion: true,
      selectedAnswer: null,
      isAnimating: false,
      gameOver: false,
      characterState: 'idle', // Reset to idle state
    });
    
    bridgeAnim.setValue(0);
    characterAnim.setValue(charPos - camOffset);
    cameraAnim.setValue(camOffset);
    lineAnim.setValue(gapCm * 25);
  };

  const selectAnswer = (answer: number) => {
    setGameState(prev => ({ ...prev, selectedAnswer: answer, isAnimating: true }));
    
    const correctLength = gameState.correctAnswer * 25;
    const selectedLength = answer * 25;
    
    Animated.sequence([
      Animated.timing(lineAnim, {
        toValue: correctLength,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(lineAnim, {
        toValue: selectedLength,
        duration: 1200,
        useNativeDriver: false,
      })
    ]).start(() => {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showQuestion: false, isAnimating: false }));
        setTimeout(() => startGame(answer), 300);
      }, 300);
    });
  };

  const startGame = (lengthCm: number) => {
    const targetLength = lengthCm * PIXELS_PER_CM;
    const leftPlatform = gameState.platforms[gameState.currentIndex];
    const rightPlatform = gameState.platforms[gameState.currentIndex + 1];
    
    Animated.timing(bridgeAnim, {
      toValue: targetLength,
      duration: targetLength * 8,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => walkCharacter(targetLength, leftPlatform, rightPlatform), 500);
    });
  };

  const walkCharacter = (bridgeLength: number, leftPlatform: Platform, rightPlatform: Platform) => {
    // Start character running animation
    startCharacterRunning();
    
    const bridgeEnd = leftPlatform.x + leftPlatform.width + bridgeLength;
    const isSuccess = bridgeEnd >= rightPlatform.x && bridgeEnd <= rightPlatform.x + rightPlatform.width;
    
    // Position character in the center of the destination platform instead of at the edge
    const finalPos = isSuccess 
      ? rightPlatform.x + (rightPlatform.width / 2) - (CHARACTER_SIZE / 2)
      : bridgeEnd - CHARACTER_SIZE / 2;
    
    const walkDistance = Math.abs(finalPos - gameState.characterPosition);
    
    Animated.parallel([
      Animated.timing(characterAnim, {
        toValue: finalPos - gameState.cameraOffset,
        duration: walkDistance * 4,
        useNativeDriver: false,
      }),
      Animated.timing(cameraAnim, {
        toValue: gameState.cameraOffset + (finalPos - gameState.characterPosition) * 0.2,
        duration: walkDistance * 4,
        useNativeDriver: false,
      })
    ]).start(() => {
      // Stop character running animation
      stopCharacterRunning();
      
      if (isSuccess) {
        setGameState(prev => ({
          ...prev,
          score: prev.score + 100,
          characterPosition: finalPos,
        }));
        setTimeout(() => nextLevel(), 1000);
      } else {
        setGameState(prev => ({ ...prev, gameOver: true }));
        setTimeout(() => {
          Alert.alert(
            "Game Over!",
            `Cầu ${bridgeLength / PIXELS_PER_CM < gameState.correctAnswer ? 'quá ngắn' : 'quá dài'}! Đáp án: ${gameState.correctAnswer} cm`,
            [{ text: "Chơi lại", onPress: initGame }]
          );
        }, 300);
      }
    });
  };

  const nextLevel = () => {
    const nextIdx = gameState.currentIndex + 1;
    const currentPlatform = gameState.platforms[nextIdx];
    const nextPlatform = gameState.platforms[nextIdx + 1];
    
    if (!nextPlatform) {
      const newPlatforms = generatePlatforms();
      setGameState(prev => ({ ...prev, platforms: [...prev.platforms, ...newPlatforms] }));
      return;
    }
    
    const gapPixels = nextPlatform.x - (currentPlatform.x + currentPlatform.width);
    const gapCm = Math.round(gapPixels / PIXELS_PER_CM);
    const answerOptions = generateAnswerOptions(gapCm);
    
    // Position character in the center of the platform instead of at the edge
    const newCharPos = currentPlatform.x + (currentPlatform.width / 2) - (CHARACTER_SIZE / 2);
    const newCamOffset = currentPlatform.x - 50;
    
    Animated.timing(cameraAnim, {
      toValue: newCamOffset,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setGameState(prev => ({
        ...prev,
        currentIndex: nextIdx,
        bridgeLength: 0,
        characterPosition: newCharPos,
        cameraOffset: newCamOffset,
        correctAnswer: gapCm,
        answerOptions,
        showQuestion: true,
        selectedAnswer: null,
        level: prev.level + 1,
        characterState: 'idle', // Reset to idle state for next level
      }));
      
      characterAnim.setValue(newCharPos - newCamOffset);
      bridgeAnim.setValue(0);
      lineAnim.setValue(gapCm * 25);
    });
  };

  const renderRuler = () => {
    // Remove ruler rendering in game - only show bridge
    return null;
  };

  const renderModalRuler = () => {
    const marks = [];
    const maxWidth = screenWidth * 0.6;
    const lineLength = Math.min(gameState.correctAnswer * 25, maxWidth);
    const rulerColor = '#2c3e50';
    
    // Main ruler line
    marks.push(
      <View
        key="modal-ruler-line"
        style={[
          styles.modalRulerLine,
          {
            width: lineLength,
            backgroundColor: rulerColor,
            top: 5, // Position above the colored line
          }
        ]}
      />
    );
    
    // Arrow at the end
    marks.push(
      <View
        key="modal-arrow"
        style={[
          styles.modalRulerArrow,
          {
            left: lineLength - 8,
            top: -1, // Align with ruler line
            borderLeftColor: rulerColor,
          }
        ]}
      />
    );
    
    // Tick marks
    for (let i = 0; i <= gameState.correctAnswer; i++) {
      const xPos = (i * lineLength / gameState.correctAnswer);
      
      marks.push(
        <View
          key={`modal-tick-${i}`}
          style={[
            styles.modalRulerTick,
            {
              left: xPos - 1,
              top: -3, // Position to cross the ruler line
              backgroundColor: rulerColor,
              height: i === 0 || i === gameState.correctAnswer ? 16 : 12,
              width: i === 0 || i === gameState.correctAnswer ? 2.5 : 1.5,
            }
          ]}
        />
      );
    }
    
    return marks;
  };

  const renderQuestionModal = () => (
    <Modal visible={gameState.showQuestion || gameState.isAnimating} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>📏 Đo Độ Dài</Text>
          
          {gameState.isAnimating ? (
            <View>
              <Text style={styles.questionText}>
                {gameState.selectedAnswer === gameState.correctAnswer 
                  ? "✅ Chính xác!" 
                  : `❌ Bạn chọn ${gameState.selectedAnswer} cm`}
              </Text>
              
              <View style={styles.rulerContainer}>
                <Animated.View
                  style={[
                    styles.modalLine,
                    {
                      width: lineAnim,
                      backgroundColor: gameState.selectedAnswer === gameState.correctAnswer ? '#27ae60' : '#e74c3c'
                    }
                  ]}
                />
                
                {/* Animated ruler with arrow and ticks */}
                <View style={styles.rulerMarksContainer}>
                  {gameState.selectedAnswer && (
                    <>
                      {/* Main ruler line */}
                      <Animated.View
                        style={[
                          styles.modalRulerLine,
                          {
                            width: lineAnim,
                            backgroundColor: gameState.selectedAnswer === gameState.correctAnswer ? '#2c3e50' : '#e74c3c'
                          }
                        ]}
                      />
                      
                      {/* Arrow */}
                      <Animated.View
                        style={[
                          styles.modalRulerArrow,
                          {
                            left: lineAnim,
                            borderLeftColor: gameState.selectedAnswer === gameState.correctAnswer ? '#2c3e50' : '#e74c3c',
                            transform: [{ translateX: -8 }]
                          }
                        ]}
                      />
                      
                      {/* Tick marks */}
                      {Array.from({ length: gameState.selectedAnswer + 1 }, (_, i) => {
                        const currentLength = Math.min((gameState.selectedAnswer || 0) * 25, screenWidth * 0.6);
                        const tickColor = gameState.selectedAnswer === gameState.correctAnswer ? '#2c3e50' : '#e74c3c';
                        
                        return (
                          <View
                            key={`animated-tick-${i}`}
                            style={[
                              styles.modalRulerTick,
                              {
                                left: (i * currentLength / (gameState.selectedAnswer || 1)) - 1,
                                backgroundColor: tickColor,
                                height: i === 0 || i === gameState.selectedAnswer ? 16 : 12,
                                width: i === 0 || i === gameState.selectedAnswer ? 2.5 : 1.5,
                              }
                            ]}
                          />
                        );
                      })}
                    </>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.questionText}>Đo độ dài đoạn thẳng:</Text>
              
              <View style={styles.rulerContainer}>
                {/* Ruler with tick marks (black) - for measuring */}
                <View style={styles.rulerMarksContainer}>
                  {renderModalRuler()}
                </View>
                
                {/* Colored line (blue/green) - separate from ruler */}
                <View
                  style={[
                    styles.modalLine,
                    { 
                      width: Math.min(gameState.correctAnswer * 25, screenWidth * 0.6),
                      top: 25, // Position below the ruler
                    }
                  ]}
                />
              </View>
              
              <View style={styles.optionsContainer}>
                {gameState.answerOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => selectAnswer(option)}
                  >
                    <Text style={styles.optionText}>{option} cm</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Function to get the current character image based on state and animation frame
  const getCharacterImage = () => {
    if (gameState.characterState === 'idle') {
      return characterImages.idle;
    } else {
      // Running state - cycle through run1-run5
      switch (runningFrameRef.current) {
        case 0: return characterImages.run1;
        case 1: return characterImages.run2;
        case 2: return characterImages.run3;
        case 3: return characterImages.run4;
        case 4: return characterImages.run5;
        default: return characterImages.run1;
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Background GIF */}
      <Image 
        source={require('../../../../../../../../assets/images/character/bg_game.gif')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {renderQuestionModal()}
      
      <View style={styles.header}>
        <Text style={styles.gameTitle}>{gameData?.title || "Stick Hero - Đo Độ Dài"}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Điểm: {gameState.score}</Text>
          <Text style={styles.levelText}>Level {gameState.level}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.ground} />
        
        {gameState.platforms.slice(gameState.currentIndex, gameState.currentIndex + 3).map((platform, idx) => (
          <View
            key={gameState.currentIndex + idx}
            style={[
              styles.platform,
              {
                left: platform.x - gameState.cameraOffset,
                width: platform.width,
              }
            ]}
          />
        ))}
        
        {/* Bridge - single line only */}
        <Animated.View
          style={[
            styles.bridge,
            {
              left: (gameState.platforms[gameState.currentIndex]?.x || 0) + (gameState.platforms[gameState.currentIndex]?.width || 0) - gameState.cameraOffset,
              width: bridgeAnim,
            }
          ]}
        />
        
        {/* Remove ruler rendering - renderRuler() returns null */}
        
        <Animated.View
          style={[
            styles.character,
            { left: characterAnim }
          ]}
        >
          {/* Use the character image instead of a colored circle */}
          <Image 
            source={getCharacterImage()} 
            style={styles.characterImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // Changed from "#87CEEB" to transparent to show background image
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1, // Ensure background is behind all other components
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    alignItems: "center",
    elevation: 10,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 20,
    textAlign: "center",
  },
  rulerContainer: {
    width: "70%",
    height: 60, // Increased height to accommodate both lines
    marginVertical: 20,
    position: "relative",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
  },
  modalLine: {
    height: 6, // Slightly thicker colored line
    backgroundColor: "#3498db",
    borderRadius: 3,
    elevation: 2,
    position: "absolute",
  },
  rulerMarksContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalRulerMark: {
    position: "absolute",
    width: 3,
    height: 15,
    backgroundColor: "#2c3e50",
  },
  modalRulerLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    width: 16,
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  header: {
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreText: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "bold",
  },
  levelText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  gameArea: {
    flex: 1,
    position: "relative",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    backgroundColor: "#8B4513",
  },
  platform: {
    position: "absolute",
    height: PLATFORM_HEIGHT,
    bottom: GROUND_HEIGHT,
    backgroundColor: "#27ae60",
    borderRadius: 8,
    elevation: 3,
  },
  bridge: {
    position: "absolute",
    height: 6, // Slightly thicker for better visibility
    bottom: GROUND_HEIGHT + PLATFORM_HEIGHT,
    backgroundColor: "#f39812", // Orange color for the bridge
    borderRadius: 3,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  character: {
    position: "absolute",
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    // FIX: Position character to stand exactly on top of the platform
    bottom: GROUND_HEIGHT + PLATFORM_HEIGHT - 5, // Subtract a small value to make character touch the platform
    // Remove backgroundColor, borderWidth, and borderRadius since we're using an image
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  rulerLine: {
    position: "absolute",
    height: 3,
    borderRadius: 1.5,
  },
  rulerArrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: "#2c3e50",
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
  },
  rulerTick: {
    position: "absolute",
    borderRadius: 1,
  },
  modalRulerLine: {
    position: "absolute",
    height: 3,
    top: 16,
    borderRadius: 1.5,
  },
  modalRulerArrow: {
    position: "absolute",
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: "#2c3e50",
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
  },
  modalRulerTick: {
    position: "absolute",
    top: 8,
    borderRadius: 1,
  },
});