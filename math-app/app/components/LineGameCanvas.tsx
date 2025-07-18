import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Line, Circle, Polygon, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Define specific types for different option structures
interface ShapeOption {
  id: number;
  type: string;
  isCorrect: boolean;
}

interface TextOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface LineGameCanvasProps {
  gameType: string;
  questionIndex: number;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
  showCelebration: boolean;
  bounceAnim: Animated.Value;
  fireworksAnim: Animated.Value[];
}

const LineGameCanvas: React.FC<LineGameCanvasProps> = ({
  gameType,
  questionIndex,
  onCorrectAnswer,
  onIncorrectAnswer,
  showCelebration,
  bounceAnim,
  fireworksAnim
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when game type or question changes
  useEffect(() => {
    setSelectedAnswers([]);
    setShowFeedback(false);
    setIsCorrect(false);
  }, [gameType, questionIndex]);

  // Game data for different types
  const getGameData = () => {
    switch (gameType) {
      case 'identify':
        return {
          question: 'Chọn những hình là đoạn thẳng',
          options: [
            { id: 0, type: 'line', isCorrect: true },
            { id: 1, type: 'curve', isCorrect: false },
            { id: 2, type: 'line', isCorrect: true },
            { id: 3, type: 'zigzag', isCorrect: false }
          ] as ShapeOption[],
          multiSelect: true
        };
      case 'connect':
        return {
          question: 'Kéo từ điểm A đến điểm B',
          options: [] as ShapeOption[],
          multiSelect: false
        };
      case 'shape':
        return {
          question: 'Nối các điểm tạo thành tam giác',
          options: [] as ShapeOption[],
          multiSelect: false
        };
      case 'name':
        return {
          question: 'Đoạn thẳng này có tên là gì?',
          options: [
            { id: 0, text: 'AB', isCorrect: true },
            { id: 1, text: 'CD', isCorrect: false },
            { id: 2, text: 'EF', isCorrect: false },
            { id: 3, text: 'GH', isCorrect: false }
          ] as TextOption[],
          multiSelect: false
        };
      default:
        return { question: '', options: [] as ShapeOption[], multiSelect: false };
    }
  };

  const gameData = getGameData();

  const handleAnswerSelect = (answerId: number) => {
    if (showFeedback) return;

    if (gameData.multiSelect) {
      const newSelected = selectedAnswers.includes(answerId)
        ? selectedAnswers.filter(id => id !== answerId)
        : [...selectedAnswers, answerId];
      setSelectedAnswers(newSelected);
    } else {
      setSelectedAnswers([answerId]);
      checkAnswer([answerId]);
    }
  };

  const checkAnswer = (answers: number[] = selectedAnswers) => {
    if (gameType === 'identify') {
      const correctAnswers = (gameData.options as ShapeOption[])
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
      const isCorrectAnswer = answers.length === correctAnswers.length && 
        answers.every(id => correctAnswers.includes(id));
      
      setIsCorrect(isCorrectAnswer);
      setShowFeedback(true);
      
      setTimeout(() => {
        if (isCorrectAnswer) {
          onCorrectAnswer();
        } else {
          onIncorrectAnswer();
        }
      }, 1500);
    } else if (gameType === 'name') {
      const selectedOption = (gameData.options as TextOption[])
        .find(opt => opt.id === answers[0]);
      const isCorrectAnswer = selectedOption?.isCorrect || false;
      
      setIsCorrect(isCorrectAnswer);
      setShowFeedback(true);
      
      setTimeout(() => {
        if (isCorrectAnswer) {
          onCorrectAnswer();
        } else {
          onIncorrectAnswer();
        }
      }, 1500);
    }
  };

  const renderShape = (option: ShapeOption, index: number) => {
    const isSelected = selectedAnswers.includes(option.id);
    const showResult = showFeedback && isSelected;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.shapeContainer,
          isSelected && styles.shapeSelected,
          showResult && (option.isCorrect ? styles.shapeCorrect : styles.shapeIncorrect)
        ]}
        onPress={() => handleAnswerSelect(option.id)}
      >
        <Svg height={80} width={120} viewBox="0 0 120 80">
          {option.type === 'line' && (
            <Line
              x1="20"
              y1="40"
              x2="100"
              y2="40"
              stroke="#2E7D32"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          {option.type === 'curve' && (
            <Svg height={80} width={120}>
              <Line
                x1="20"
                y1="40"
                x2="100"
                y2="40"
                stroke="#2E7D32"
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(15 60 40)"
              />
            </Svg>
          )}
          {option.type === 'zigzag' && (
            <>
              <Line x1="20" y1="40" x2="40" y2="20" stroke="#2E7D32" strokeWidth="3" />
              <Line x1="40" y1="20" x2="60" y2="60" stroke="#2E7D32" strokeWidth="3" />
              <Line x1="60" y1="60" x2="80" y2="20" stroke="#2E7D32" strokeWidth="3" />
              <Line x1="80" y1="20" x2="100" y2="40" stroke="#2E7D32" strokeWidth="3" />
            </>
          )}
        </Svg>
        
        {showResult && (
          <Text style={[
            styles.resultText,
            option.isCorrect ? styles.correctText : styles.incorrectText
          ]}>
            {option.isCorrect ? '✓' : '✗'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderConnectGame = () => {
    return (
      <View style={styles.connectContainer}>
        <Svg height={200} width={width - 40} viewBox={`0 0 ${width - 40} 200`}>
          <Circle cx="80" cy="100" r="15" fill="#FF6B6B" stroke="#fff" strokeWidth="3" />
          <SvgText x="80" y="130" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#FF6B6B">
            Điểm A
          </SvgText>
          
          <Circle cx={width - 120} cy="100" r="15" fill="#4ECDC4" stroke="#fff" strokeWidth="3" />
          <SvgText x={width - 120} y="130" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#4ECDC4">
            Điểm B
          </SvgText>
          
          <Line
            x1="80"
            y1="100"
            x2={width - 120}
            y2="100"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </Svg>
        
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={() => {
            setIsCorrect(true);
            setShowFeedback(true);
            setTimeout(() => onCorrectAnswer(), 1500);
          }}
        >
          <Text style={styles.connectButtonText}>Kéo để nối</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderShapeGame = () => {
    return (
      <View style={styles.shapeGameContainer}>
        <Svg height={200} width={width - 40} viewBox={`0 0 ${width - 40} 200`}>
          <Circle cx="100" cy="60" r="12" fill="#FF6B6B" stroke="#fff" strokeWidth="3" />
          <SvgText x="100" y="45" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#FF6B6B">
            A
          </SvgText>
          
          <Circle cx="200" cy="60" r="12" fill="#4ECDC4" stroke="#fff" strokeWidth="3" />
          <SvgText x="200" y="45" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#4ECDC4">
            B
          </SvgText>
          
          <Circle cx="150" cy="140" r="12" fill="#FFD93D" stroke="#fff" strokeWidth="3" />
          <SvgText x="150" y="160" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#FFD93D">
            C
          </SvgText>
          
          <Polygon
            points="100,60 200,60 150,140"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </Svg>
        
        <TouchableOpacity 
          style={styles.shapeButton}
          onPress={() => {
            setIsCorrect(true);
            setShowFeedback(true);
            setTimeout(() => onCorrectAnswer(), 1500);
          }}
        >
          <Text style={styles.shapeButtonText}>Tạo tam giác</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNameGame = () => {
    return (
      <View style={styles.nameGameContainer}>
        <Svg height={100} width={width - 40} viewBox={`0 0 ${width - 40} 100`}>
          <Line
            x1="80"
            y1="50"
            x2="200"
            y2="50"
            stroke="#2E7D32"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Circle cx="80" cy="50" r="8" fill="#FF6B6B" stroke="#fff" strokeWidth="2" />
          <SvgText x="80" y="30" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#FF6B6B">
            A
          </SvgText>
          
          <Circle cx="200" cy="50" r="8" fill="#4ECDC4" stroke="#fff" strokeWidth="2" />
          <SvgText x="200" y="30" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#4ECDC4">
            B
          </SvgText>
        </Svg>
        
        <View style={styles.optionsContainer}>
          {(gameData.options as TextOption[]).map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedAnswers.includes(option.id) && styles.optionSelected,
                showFeedback && selectedAnswers.includes(option.id) && (
                  option.isCorrect ? styles.optionCorrect : styles.optionIncorrect
                )
              ]}
              onPress={() => handleAnswerSelect(option.id)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswers.includes(option.id) && styles.optionTextSelected
              ]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFireworks = () => {
    if (!showCelebration) return null;

    return (
      <View style={styles.fireworksContainer}>
        {fireworksAnim.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.firework,
              {
                left: Math.random() * (width - 40),
                top: Math.random() * (height - 200),
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.5],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.fireworkText}>✨</Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{gameData.question}</Text>
      
      {gameType === 'identify' && (
        <View style={styles.shapesGrid}>
          {(gameData.options as ShapeOption[]).map((option, index) => renderShape(option, index))}
        </View>
      )}
      
      {gameType === 'connect' && renderConnectGame()}
      {gameType === 'shape' && renderShapeGame()}
      {gameType === 'name' && renderNameGame()}
      
      {gameType === 'identify' && gameData.multiSelect && (
        <TouchableOpacity 
          style={[styles.submitButton, selectedAnswers.length === 0 && styles.submitButtonDisabled]}
          onPress={() => checkAnswer()}
          disabled={selectedAnswers.length === 0}
        >
          <Text style={styles.submitButtonText}>Kiểm tra</Text>
        </TouchableOpacity>
      )}
      
      {showFeedback && (
        <Animated.View 
          style={[
            styles.feedbackContainer,
            {
              transform: [{
                scale: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                })
              }]
            }
          ]}
        >
          <Text style={[
            styles.feedbackText,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            {isCorrect ? '🎉 Đúng rồi!' : '❌ Chưa đúng, thử lại nhé!'}
          </Text>
        </Animated.View>
      )}
      
      {renderFireworks()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  shapeContainer: {
    width: 120,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  shapeSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  shapeCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  shapeIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  resultText: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 20,
    fontWeight: 'bold',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#F44336',
  },
  connectContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shapeGameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  shapeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameGameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionIncorrect: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  optionTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  incorrectFeedback: {
    color: '#F44336',
  },
  fireworksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  firework: {
    position: 'absolute',
  },
  fireworkText: {
    fontSize: 20,
  },
});

export default LineGameCanvas;