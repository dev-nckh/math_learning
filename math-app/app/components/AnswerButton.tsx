import React from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { AnswerKey } from '../types';
import  getPointColor  from '../constants/colors';
import { styles } from '../styles/styles';

interface AnswerButtonProps {
  answer: AnswerKey;
  answerText: string;
  animation: Animated.Value;
  selectedAnswer: AnswerKey | null;
  isCorrect: boolean | null;
  onPress: (answer: AnswerKey) => void;
  disabled: boolean;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({
  answer,
  answerText,
  animation,
  selectedAnswer,
  isCorrect,
  onPress,
  disabled
}) => {
  const scaleValue = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
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
        onPress={() => onPress(answer)}
        disabled={disabled}
      >
        <Text style={styles.answerLetter}>{answer}</Text>
        <Text style={styles.answerText} numberOfLines={2}>
          {answerText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnswerButton;