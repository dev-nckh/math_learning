import React from 'react';
import { View } from 'react-native';
import  AnswerButton  from './AnswerButton';
import { Question, AnswerKey } from '../types';
import { styles } from '../styles/styles';

interface AnswersGridProps {
  currentQuestion: Question;
  answerAnimations: React.MutableRefObject<any[]>;
  selectedAnswer: AnswerKey | null;
  isCorrect: boolean | null;
  onAnswerPress: (answer: AnswerKey) => void;
}

 const AnswersGrid: React.FC<AnswersGridProps> = ({
  currentQuestion,
  answerAnimations,
  selectedAnswer,
  isCorrect,
  onAnswerPress
}) => {
  const renderAnswerButton = (answer: AnswerKey, index: number) => {
    if (!answerAnimations.current[index]) {
      console.warn(`Animation at index ${index} is undefined`);
      return null;
    }

    return (
      <AnswerButton
        key={answer}
        answer={answer}
        answerText={currentQuestion.answers[answer]}
        animation={answerAnimations.current[index]}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        onPress={onAnswerPress}
        disabled={selectedAnswer !== null}
      />
    );
  };

  return (
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
  );
};

export default AnswersGrid;