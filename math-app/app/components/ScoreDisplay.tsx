import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
}

 const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, totalQuestions }) => {
  return (
    <View style={styles.scoreDisplay}>
      <Text style={styles.scoreDisplayText}>
        Điểm: {score}/{totalQuestions}
      </Text>
    </View>
  );
};

export default ScoreDisplay;