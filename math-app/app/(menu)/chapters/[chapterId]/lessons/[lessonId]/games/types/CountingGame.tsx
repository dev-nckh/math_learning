// games/types/CountingGame.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface CountingGameProps {
  chapterId: string;
  lessonId: string;
  gameId: string;
  gameData: {
    id: number;
    title: string;
    type: string;
    difficulty: string;
    description: string;
  };
}

interface Question {
  items: string;
  count: number;
  options: number[];
}

export default function CountingGame({ chapterId, lessonId, gameId, gameData }: CountingGameProps) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Tạo câu hỏi dựa trên difficulty
  const generateQuestions = (): Question[] => {
    const emojis = ['🍎', '🐱', '⭐', '🍓', '🌸', '🚗', '📚', '🎈', '🍪', '🦋'];
    const maxCount = gameData.difficulty === 'Dễ' ? 5 : gameData.difficulty === 'Trung bình' ? 10 : 15;
    
    return Array.from({ length: 5 }, (_, i) => {
      const emoji = emojis[i % emojis.length];
      const count = Math.floor(Math.random() * maxCount) + 1;
      const items = emoji.repeat(count);
      
      // Tạo options với 1 đáp án đúng và 3 sai
      const correctAnswer = count;
      const wrongOptions : any = [];
      
      // Tạo các đáp án sai
      for (let j = 0; j < 3; j++) {
        let wrong;
        do {
          wrong = Math.max(1, correctAnswer + Math.floor(Math.random() * 6) - 3);
        } while (wrong === correctAnswer || wrongOptions.includes(wrong));
        wrongOptions.push(wrong);
      }
      
      const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return { items, count: correctAnswer, options };
    });
  };

  const [questions] = useState<Question[]>(generateQuestions());
  const currentQ = questions[currentQuestion];

  const handleAnswer = (answer: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    // Animation cho feedback
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      const isCorrect = answer === currentQ.count;
      const newScore = isCorrect ? score + 10 : score;
      setScore(newScore);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Game completed
        completeGame(newScore);
      }
    }, 1500);
  };

  const completeGame = (finalScore: number) => {
    router.push({
      pathname: `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/result` as any,
      params: { 
        chapterId, 
        lessonId, 
        gameId,
        score: finalScore.toString(),
        totalQuestions: questions.length.toString(),
        gameTitle: gameData.title
      }
    });
  };

  const getButtonStyle = (option: number) => {
    if (!isAnswered) return styles.optionButton;
    
    if (option === currentQ.count) return styles.correctAnswer;
    if (option === selectedAnswer) return styles.wrongAnswer;
    return styles.disabledButton;
  };

  if (!currentQ) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.gameTitle}>{gameData.title}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Điểm: {score}</Text>
          <Text style={styles.progressText}>
            Câu {currentQuestion + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>Đếm và chọn đáp án đúng:</Text>
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsText}>{currentQ.items}</Text>
        </View>
        <Text style={styles.questionSubtitle}>Có bao nhiêu?</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQ.options.map((option) => (
          <Animated.View
            key={option}
            style={[
              { transform: [{ scale: selectedAnswer === option ? animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1]
              }) : 1 }] }
            ]}
          >
            <TouchableOpacity
              style={getButtonStyle(option)}
              onPress={() => handleAnswer(option)}
              disabled={isAnswered}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Feedback */}
      {isAnswered && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {selectedAnswer === currentQ.count ? '🎉 Chính xác!' : '😅 Thử lại nhé!'}
          </Text>
          {selectedAnswer !== currentQ.count && (
            <Text style={styles.correctAnswerText}>
              Đáp án đúng là: {currentQ.count}
            </Text>
          )}
        </View>
      )}

      {/* Exit Button */}
      <TouchableOpacity 
        style={styles.exitButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.exitButtonText}>🚪 Thoát</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  scoreText: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  itemsContainer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemsText: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#3498db',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  correctAnswer: {
    backgroundColor: '#27ae60',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  wrongAnswer: {
    backgroundColor: '#e74c3c',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  optionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  exitButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 50,
  },
});