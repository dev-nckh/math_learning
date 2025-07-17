import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Animated, Dimensions } from 'react-native';
import  characterImages  from '../constants/images';
import { styles } from '../styles/styles';

const { width } = Dimensions.get('window');

interface ResultModalProps {
  showResultModal: boolean;
  score: number;
  totalQuestions: number;
  modalAnim: Animated.Value;
  onContinue: () => void;
  onRetry: () => void;
}

 const ResultModal: React.FC<ResultModalProps> = ({
  showResultModal,
  score,
  totalQuestions,
  modalAnim,
  onContinue,
  onRetry
}) => {
  const getScorePercentage = () => {
    if (totalQuestions === 0) return 0;
    return (score / totalQuestions) * 100;
  };

  const scorePercentage = getScorePercentage();
  const isHighScore = scorePercentage >= 75;
  
  return (
    <Modal
      visible={showResultModal}
      transparent={true}
      animationType="none"
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: modalAnim,
              transform: [{
                scale: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }]
            }
          ]}
        >
          <Image 
            source={isHighScore ? characterImages.celebrate : characterImages.cry} 
            style={styles.modalCharacter}
          />
          
          <Text style={styles.modalTitle}>
            {isHighScore ? 'Bé làm tốt lắm!' : 'Bé hãy thử lại 1 lần nữa xem nào'}
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              Điểm số: {score}/{totalQuestions} ({Math.round(scorePercentage)}%)
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.modalButton,
              { backgroundColor: isHighScore ? '#4CAF50' : '#FF9800' }
            ]}
            onPress={isHighScore ? onContinue : onRetry}
          >
            <Text style={styles.modalButtonText}>
              {isHighScore ? 'Học tiếp' : 'Thử lại'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
export default ResultModal;