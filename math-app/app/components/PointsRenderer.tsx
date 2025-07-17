import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Question, AnswerKey } from '../types';
import  getPointColor  from '../constants/colors';
import { styles } from '../styles/styles';

interface PointsRendererProps {
  currentQuestion: Question;
  bounceAnim: Animated.Value;
}

const PointsRenderer: React.FC<PointsRendererProps> = ({ 
  currentQuestion, 
  bounceAnim 
}) => {
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

  return <>{renderPoints()}</>;
};

export default PointsRenderer;