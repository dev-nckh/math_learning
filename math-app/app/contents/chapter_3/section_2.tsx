import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InstructionLineScreen from '../../components/introduction/InstructionLineScreen';
import LineIntroduction from '../../components/LineIntroduction';
import { useAnimations } from '../../hooks/useAnimations';
import LineGameCanvas from '../../components/LineGameCanvas';
import ScoreDisplay from '../../components/ScoreDisplay';
import characterImages from '../../constants/images';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

// Constants
const GAME_TYPES = [
  {
    id: 'identify',
    title: 'Nhận biết đoạn thẳng',
    description: 'Chọn hình nào là đoạn thẳng?',
    instruction: 'Chọn những hình là đoạn thẳng nhé!'
  },
  {
    id: 'connect',
    title: 'Nối điểm thành đoạn thẳng',
    description: 'Nối 2 điểm A và B',
    instruction: 'Chạm vào điểm A, rồi kéo đến điểm B'
  },
  {
    id: 'shape',
    title: 'Tạo hình từ đoạn thẳng',
    description: 'Nối các điểm tạo thành tam giác',
    instruction: 'Nối các điểm theo thứ tự để tạo thành hình'
  },
  {
    id: 'name',
    title: 'Đọc tên đoạn thẳng',
    description: 'Đoạn thẳng này có tên là gì?',
    instruction: 'Nhìn vào đoạn thẳng và chọn tên đúng'
  }
];

const TOTAL_ROUNDS = 3;
const CELEBRATION_DURATION = 2000;
const INCORRECT_ANSWER_DELAY = 1500;

// Game state enum
const GAME_STATES = {
  LINE_INTRODUCTION: 'LINE_INTRODUCTION',
  INSTRUCTIONS: 'INSTRUCTIONS',
  PLAYING: 'PLAYING',
  COMPLETED: 'COMPLETED'
};

const Line = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LINE_INTRODUCTION);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentGameType, setCurrentGameType] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const router = useRouter();

  const {
    fadeAnim,
    bounceAnim,
    fireworksAnim,
    animateFireworks
  } = useAnimations(currentQuestionIndex, gameState === GAME_STATES.INSTRUCTIONS);

  // Memoized values
  const currentGame = useMemo(() => GAME_TYPES[currentGameType], [currentGameType]);
  const characterImage = useMemo(() => 
    showCelebration ? characterImages.celebrate : characterImages.happy, 
    [showCelebration]
  );

  // Event handlers
  const handleLineIntroductionComplete = useCallback(() => {
    setGameState(GAME_STATES.INSTRUCTIONS);
  }, []);

  const handleIntroductionComplete = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setGameState(GAME_STATES.PLAYING));
  }, [fadeAnim]);

  const moveToNextGame = useCallback(() => {
    if (currentGameType < GAME_TYPES.length - 1) {
      setCurrentGameType(prev => prev + 1);
    } else if (currentQuestionIndex < TOTAL_ROUNDS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentGameType(0);
    } else {
      setGameState(GAME_STATES.COMPLETED);
    }
  }, [currentGameType, currentQuestionIndex]);

  const handleCorrectAnswer = useCallback(() => {
    setScore(prev => prev + 1);
    setTotalQuestions(prev => prev + 1);
    setShowCelebration(true);
    animateFireworks();
    
    const timer = setTimeout(() => {
      setShowCelebration(false);
      moveToNextGame();
    }, CELEBRATION_DURATION);

    return () => clearTimeout(timer);
  }, [animateFireworks, moveToNextGame]);

  const handleIncorrectAnswer = useCallback(() => {
    setTotalQuestions(prev => prev + 1);
    
    const timer = setTimeout(() => {
      moveToNextGame();
    }, INCORRECT_ANSWER_DELAY);

    return () => clearTimeout(timer);
  }, [moveToNextGame]);

  const resetGame = useCallback(() => {
    setCurrentQuestionIndex(0);
    setCurrentGameType(0);
    setScore(0);
    setTotalQuestions(0);
    setGameState(GAME_STATES.LINE_INTRODUCTION);
    setShowCelebration(false);
  }, []);

  const continueToNextSection = useCallback(() => {
    router.push('./section_3');
  }, [router]);

  // Render methods
  const renderLineIntroduction = () => (
    <View style={styles.container}>
      <LineIntroduction onComplete={handleLineIntroductionComplete} />
    </View>
  );

  const renderInstructions = () => (
    <InstructionLineScreen 
      fadeAnim={fadeAnim}
      onStartGame={handleIntroductionComplete}
    />
  );

  const renderGameCompleted = () => (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Image 
            source={characterImages.celebrate} 
            style={styles.characterImage}
          />
          <Text style={styles.resultTitle}>Chúc mừng bé!</Text>
          <Text style={styles.resultText}>
            Bé đã hoàn thành bài học về đoạn thẳng!
          </Text>
          <ScoreDisplay score={score} totalQuestions={totalQuestions} />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={resetGame}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Chơi lại</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={continueToNextSection}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderGameplay = () => (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topSection}>
          <View style={styles.header}>
            <Image 
              source={characterImage} 
              style={styles.characterSmall}
            />
            <ScoreDisplay score={score} totalQuestions={totalQuestions} />
          </View>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{currentGame.title}</Text>
            <Text style={styles.gameDescription}>{currentGame.description}</Text>
            <Text style={styles.gameInstruction}>{currentGame.instruction}</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          <LineGameCanvas
            gameType={currentGame.id}
            questionIndex={currentQuestionIndex}
            onCorrectAnswer={handleCorrectAnswer}
            onIncorrectAnswer={handleIncorrectAnswer}
            showCelebration={showCelebration}
            bounceAnim={bounceAnim}
            fireworksAnim={fireworksAnim}
          />
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Bài {currentQuestionIndex + 1}/{TOTAL_ROUNDS} - Trò chơi {currentGameType + 1}/{GAME_TYPES.length}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );

  // Main render
  switch (gameState) {
    case GAME_STATES.LINE_INTRODUCTION:
      return renderLineIntroduction();
    case GAME_STATES.INSTRUCTIONS:
      return renderInstructions();
    case GAME_STATES.COMPLETED:
      return renderGameCompleted();
    case GAME_STATES.PLAYING:
    default:
      return renderGameplay();
  }
};

export default Line;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    flex: 0.3,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  characterSmall: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  characterImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  gameInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 18,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameInstruction: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 20,
  },
  gameArea: {
    flex: 0.6,
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressContainer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});