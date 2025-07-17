import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';

interface QuestionContainerProps {
  question: string;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({ question }) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
};

export default QuestionContainer;