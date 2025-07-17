import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Easing, Image, Modal } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Define the answer type
type AnswerKey = 'A' | 'B' | 'C' | 'D';

// Define the question type
interface Question {
  points: AnswerKey[];
  correctAnswer: AnswerKey;
  description: string;
  answers: Record<AnswerKey, string>;
  pointPositions: { x: number; y: number }[];
}

const Point = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const answerAnimations = useRef<Animated.Value[]>([]);
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Khởi tạo một lần trong useEffect
  useEffect(() => {
    if (answerAnimations.current.length === 0) {
      answerAnimations.current = Array.from({ length: 4 }, () => new Animated.Value(0));
    }
  }, []);

  const fireworksAnim = useRef([...Array(12)].map(() => new Animated.Value(0))).current;
  
  const characterHappy = require('../../../assets/images/chacracter_happy.png');
  const characterThinking = require('../../../assets/images/character_like.png');
  const characterCelebrate = require('../../../assets/images/character_celeb.png');
  
  // Question data with proper typing
  const questions: Question[] = [
    {
      points: ['A', 'B'],
      correctAnswer: 'B',
      description: 'Có bao nhiêu điểm trên màn hình?',
      answers: {
        'A': 'Chỉ có 1 điểm',
        'B': 'Có 2 điểm',
        'C': 'Có 3 điểm',
        'D': 'Có 4 điểm'
      },
      pointPositions: [
        { x: width * 0.3, y: height * 0.3 },
        { x: width * 0.7, y: height * 0.4 }
      ]
    },
    {
      points: ['A', 'B', 'C'],
      correctAnswer: 'C',
      description: 'Đếm xem có mấy điểm nhé!',
      answers: {
        'A': '1 điểm',
        'B': '2 điểm',
        'C': '3 điểm',
        'D': '4 điểm'
      },
      pointPositions: [
        { x: width * 0.2, y: height * 0.3 },
        { x: width * 0.5, y: height * 0.35 },
        { x: width * 0.8, y: height * 0.25 }
      ]
    },
    {
      points: ['A', 'B', 'C', 'D'],
      correctAnswer: 'D',
      description: 'Bé đếm được mấy điểm nào?',
      answers: {
        'A': '1 điểm',
        'B': '2 điểm',
        'C': '3 điểm',
        'D': '4 điểm'
      },
      pointPositions: [
        { x: width * 0.15, y: height * 0.25 },
        { x: width * 0.4, y: height * 0.4 },
        { x: width * 0.65, y: height * 0.3 },
        { x: width * 0.85, y: height * 0.25 }
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Initialize animations
  useEffect(() => {
    // Ensure answerAnimations are properly initialized
    if (answerAnimations.current.length === 0) {
      answerAnimations.current = (['A', 'B', 'C', 'D'] as AnswerKey[]).map(() => new Animated.Value(0));
    }
    
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

  // Check if game is completed and show result modal
  useEffect(() => {
    if (gameCompleted) {
      setShowResultModal(true);
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [gameCompleted]);

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
      // Ensure animation exists
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
    setShowFireworks(true);
    
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

    setTimeout(() => {
      setShowFireworks(false);
      moveToNextQuestion();
    }, 2000);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Game completed
      setGameCompleted(true);
    }
  };

  const handleAnswerPress = (answer: AnswerKey) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setTotalQuestions(totalQuestions + 1);
    const correct = currentQuestion.correctAnswer === answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      setTimeout(() => {
        animateFireworks();
      }, 500);
    }
  };

  const startGame = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowInstructions(false));
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setTotalQuestions(0);
    setGameCompleted(false);
    setShowResultModal(false);
    modalAnim.setValue(0);
  };

  const continueGame = () => {
    resetGame();
    // You can add logic here to navigate to next lesson or activity
  };

  const getScorePercentage = () => {
    if (totalQuestions === 0) return 0;
    return (score / totalQuestions) * 100;
  };

  const getPointColor = (point: AnswerKey): string => {
    const colors: Record<AnswerKey, string> = {
      'A': '#FF6B6B', // Red-orange
      'B': '#4ECDC4', // Teal
      'C': '#FFD166', // Yellow-orange
      'D': '#A78BFA', // Light purple
    };
    return colors[point];
  };

  const renderPoints = () => {
    return currentQuestion.points.map((point, index) => {
      const position = currentQuestion.pointPositions[index];
      const scaleValue = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
      });
      const dotScaleValue = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1]
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.pointContainer,
            {
              left: position.x - 35,
              top: position.y - 35,
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <View style={[styles.pointLabelContainer, { backgroundColor: getPointColor(point) }]}>
            <Text style={styles.pointLabel}>{point}</Text>
          </View>
          <Animated.View style={[styles.pointDot, { 
            backgroundColor: getPointColor(point),
            shadowColor: getPointColor(point),
            transform: [{ scale: dotScaleValue }]
          }]} />
        </Animated.View>
      );
    });
  };

  const renderFireworks = () => {
    if (!showFireworks) return null;
    
    return fireworksAnim.map((anim, index) => {
      const size = Math.random() * 50 + 30;
      const emojis = ['🎉', '✨', '🌟', '🎊', '🎈', '🎁', '💫', '⭐️'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      const scaleValue = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1.5]
      });
      
      const rotateValue = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.firework,
            {
              left: Math.random() * width,
              top: Math.random() * (height * 0.5),
              width: size,
              height: size,
              transform: [
                { scale: scaleValue },
                { rotate: rotateValue }
              ],
              opacity: anim
            }
          ]}
        >
          <Text style={[styles.fireworkText, { fontSize: size * 0.8 }]}>{randomEmoji}</Text>
        </Animated.View>
      );
    });
  };

  const renderAnswerButton = (answer: AnswerKey, index: number) => {
    if (!answerAnimations.current[index]) {
      console.warn(`Animation at index ${index} is undefined`);
      return null;
    }

    const animation = answerAnimations.current[index];
    const scaleValue = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Animated.View
        key={answer}
        style={[
          styles.answerButtonWrapper,
          {
            transform: [{ scale: scaleValue }],
            opacity: animation,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.answerButton,
            selectedAnswer === answer
              ? isCorrect
                ? styles.correctAnswer
                : styles.wrongAnswer
              : { backgroundColor: getPointColor(answer) },
            { borderColor: '#fff', borderWidth: 2 },
          ]}
          onPress={() => handleAnswerPress(answer)}
          disabled={selectedAnswer !== null}
        >
          <Text style={styles.answerLetter}>{answer}</Text>
          <Text style={styles.answerText} numberOfLines={2}>
            {currentQuestion.answers[answer]}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderResultModal = () => {
    const scorePercentage = getScorePercentage();
    const isHighScore = scorePercentage >= 75;
    
    return (
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [{
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            <Image 
              source={isHighScore ? characterCelebrate : characterThinking} 
              style={styles.modalCharacter}
            />
            
            <Text style={styles.modalTitle}>
              {isHighScore ? 'Bé làm tốt lắm!' : 'Bé hãy thử lại 1 lần nữa xem nào'}
            </Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Điểm số: {score}/{totalQuestions} ({Math.round(scorePercentage)}%)
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.modalButton,
                { backgroundColor: isHighScore ? '#4CAF50' : '#FF9800' }
              ]}
              onPress={isHighScore ? continueGame : resetGame}
            >
              <Text style={styles.modalButtonText}>
                {isHighScore ? 'Học tiếp' : 'Thử lại'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (showInstructions) {
    return (
      <Animated.View style={[styles.instructionContainer, { opacity: fadeAnim }]}>
        <Image 
          source={characterThinking} 
          style={styles.characterImage}
        />
        <Text style={styles.instructionTitle}>Cùng chơi đếm điểm nào!</Text>
        <Text style={styles.instructionText}>
          👉 Đầu tiên, bé hãy đọc câu hỏi ở trên màn hình
          {"\n"}
          👉 Sau đó, nhìn lên màn hình và đếm xem có bao nhiêu điểm
          {"\n"}
          👉 Cuối cùng, chọn đáp án đúng ở phía dưới
        </Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={startGame}
        >
          <Text style={styles.startButtonText}>Bắt đầu nào!</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top section: Question and points */}
      <View style={styles.topSection}>
        {/* Fireworks */}
        {renderFireworks()}
        
        {/* Character */}
        <Image 
          source={isCorrect ? characterCelebrate : characterHappy} 
          style={styles.characterSmall}
        />
        
        {/* Score display */}
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreDisplayText}>
            Điểm: {score}/{totalQuestions}
          </Text>
        </View>
        
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.description}</Text>
        </View>
        
        {/* Points */}
        {renderPoints()}
      </View>

      {/* Bottom section: Answers */}
      <View style={styles.bottomSection}>
        <View style={styles.answersGrid}>
          <View style={styles.answersRow}>
            {renderAnswerButton('A', 0)}
            {renderAnswerButton('B', 1)}
          </View>
          <View style={styles.answersRow}>
            {renderAnswerButton('C', 2)}
            {renderAnswerButton('D', 3)}
          </View>
        </View>

        {/* Result notification */}
        {selectedAnswer && (
          <Animated.View 
            style={[
              styles.resultContainer,
              { 
                backgroundColor: isCorrect ? '#4CAF50' : '#F44336',
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.resultText}>
              {isCorrect ? 'Chính xác! 👏' : 'Chưa đúng rồi! 😢'}
            </Text>
            {!isCorrect && (
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                }}
              >
                <Text style={styles.resetButtonText}>Thử lại</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
      
      {/* Result Modal */}
      {renderResultModal()}
    </View>
  );
};

export default Point;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  instructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#BBE6FF',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Arial Rounded MT Bold',
  },
  instructionText: {
    fontSize: 18,
    color: '#0D47A1',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
    fontFamily: 'Arial Rounded MT Bold',
  },
  startButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold',
  },
  topSection: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#E1F5FE',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  bottomSection: {
    height: height * 0.45,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreDisplay: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    fontFamily: 'Arial Rounded MT Bold',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    fontFamily: 'Arial Rounded MT Bold',
  },
  pointContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 70,
  },
  pointLabelContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pointLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Arial Rounded MT Bold',
  },
  pointDot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  answersGrid: {
    flex: 1,
    justifyContent: 'space-around',
  },
  answersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  answerButtonWrapper: {
    width: '45%',
    aspectRatio: 1,
  },
  answerButton: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  answerLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Arial Rounded MT Bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  answerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resultContainer: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Arial Rounded MT Bold',
  },
  resetButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold',
  },
  firework: {
    position: 'absolute',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireworkText: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  characterSmall: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: 20,
    top: 20,
    resizeMode: 'contain',
  },
  correctAnswer: {
    backgroundColor: '#4CAF50',
  },
  wrongAnswer: {
    backgroundColor: '#F44336',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalCharacter: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Arial Rounded MT Bold',
  },
  scoreContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 25,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    fontFamily: 'Arial Rounded MT Bold',
  },
  modalButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold',
  },
});