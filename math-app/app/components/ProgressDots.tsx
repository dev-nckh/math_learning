import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressDots = ({ 
  totalQuestions, 
  currentQuestionIndex, 
  questionResults 
} : any) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalQuestions }, (_, index) => {
        const isAnswered = questionResults[index] !== undefined;
        const isCorrect = questionResults[index] === true;
        const isCurrent = index === currentQuestionIndex;
        
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isAnswered && isCorrect && styles.correctDot,
              isAnswered && !isCorrect && styles.incorrectDot,
              isCurrent && !isAnswered && styles.currentDot,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  correctDot: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
  },
  incorrectDot: {
    backgroundColor: '#F44336',
    borderColor: '#D32F2F',
  },
  currentDot: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
    transform: [{ scale: 1.2 }],
  },
});

export default ProgressDots;