import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, Animated } from 'react-native';
import InstructionScreen from '../../components/InstructionScreen';
import ScoreDisplay from '../../components/ScoreDisplay';
import QuestionContainer from '../../components/QuestionContainer';
import PointsRenderer from '../../components/PointsRenderer';
import FireworksRenderer from '../../components/FireworksRenderer';
import AnswersGrid from '../../components/AnswersGrid';
import ResultNotification from '../../components/ResultNotification';
import ResultModal from '../../components/ResultModal';
import ProgressDots from '../../components/ProgressDots';
import { useAnimations } from '../../hooks/useAnimations';
import questions from '../../constants/questions';
import characterImages from '../../constants/images';
import { AnswerKey } from '../../types';
import { styles } from '../../styles/styles';

const { height } = Dimensions.get('window');

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
  
  // Thêm state để lưu trữ kết quả của từng câu hỏi
  const [questionResults, setQuestionResults] = useState<{ [key: number]: boolean }>({});
  
  const {
    fadeAnim,
    bounceAnim,
    answerAnimations,
    fireworksAnim,
    modalAnim,
    animateFireworks,
    animateModal
  } = useAnimations(currentQuestionIndex, showInstructions);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (gameCompleted) {
      setShowResultModal(true);
      animateModal();
    }
  }, [gameCompleted]);

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setGameCompleted(true);
    }
  };

  const handleAnswerPress = (answer: AnswerKey) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setTotalQuestions(totalQuestions + 1);
    const correct = currentQuestion.correctAnswer === answer;
    setIsCorrect(correct);
    
    // Lưu kết quả câu hỏi hiện tại
    setQuestionResults(prev => ({
      ...prev,
      [currentQuestionIndex]: correct
    }));
    
    if (correct) {
      setScore(score + 1);
      setTimeout(() => {
        setShowFireworks(true);
        animateFireworks();
        setTimeout(() => {
          setShowFireworks(false);
          moveToNextQuestion();
        }, 2000);
      }, 500);
    } else {
      // Nếu sai, chờ một chút rồi chuyển câu tiếp theo
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
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
    setQuestionResults({});
    modalAnim.setValue(0);
  };

  const continueGame = () => {
    resetGame();
    // Add navigation logic here
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (showInstructions) {
    return (
      <InstructionScreen 
        fadeAnim={fadeAnim}
        onStartGame={startGame}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <FireworksRenderer 
          showFireworks={showFireworks}
          fireworksAnim={fireworksAnim}
        />
        
        <Image 
          source={isCorrect ? characterImages.celebrate : characterImages.happy} 
          style={styles.characterSmall}
        />
        
        <ScoreDisplay score={score} totalQuestions={totalQuestions} />
        
        <QuestionContainer question={currentQuestion.description} />
        
        <PointsRenderer 
          currentQuestion={currentQuestion}
          bounceAnim={bounceAnim}
        />
        <View style={styles.progressDotsContainer}>
              <ProgressDots
          totalQuestions={questions.length}
          currentQuestionIndex={currentQuestionIndex}
          questionResults={questionResults}
        />
        </View>
        
      </View>


      <View style={styles.bottomSection}>
        {/* Thêm ProgressDots ở đây, phía trên AnswersGrid */}
        
        <AnswersGrid 
          currentQuestion={currentQuestion}
          answerAnimations={answerAnimations}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          onAnswerPress={handleAnswerPress}
        />

        <ResultNotification 
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          fadeAnim={fadeAnim}
          onRetry={handleRetry}
        />
      </View>
      
      <ResultModal 
        showResultModal={showResultModal}
        score={score}
        totalQuestions={totalQuestions}
        modalAnim={modalAnim}
        onContinue={continueGame}
        onRetry={resetGame}
      />
    </View>
  );
};

export default Point;