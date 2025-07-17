import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { styles } from '../styles/styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ResultNotificationProps {
  selectedAnswer: any;
  isCorrect: boolean | null;
  fadeAnim: Animated.Value;
  onRetry: () => void;
}

const ResultNotification: React.FC<ResultNotificationProps> = ({
  selectedAnswer,
  isCorrect,
  fadeAnim,
  onRetry
}) => {
  if (!selectedAnswer) return null;

  return (
    <View style={overlayStyles.overlay}>
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
            ],
            minWidth: 300,
          }
        ]}
      >
        <Text style={styles.resultText}>
          {isCorrect ? 'Chính xác! 👏' : 'Chưa đúng rồi! 😢'}
        </Text>
        {!isCorrect && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={onRetry}
          >
            <Text style={styles.resetButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.3)', // Nền mờ tùy chọn
  }
});

export default ResultNotification;