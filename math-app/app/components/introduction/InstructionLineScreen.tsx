import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import  characterImages  from '../../constants/images';
import { styles } from '../../styles/styles';

interface InstructionScreenProps {
  fadeAnim: Animated.Value;
  onStartGame: () => void;
}

 const InstructionLineScreen: React.FC<InstructionScreenProps> = ({ 
  fadeAnim, 
  onStartGame 
}) => {
  return (
    <Animated.View style={[styles.instructionContainer, { opacity: fadeAnim }]}>
      <Image 
        source={characterImages.thinking} 
        style={styles.characterImage}
      />
      <Text style={styles.instructionTitle}>Cùng chơi đếm điểm nào!</Text>
      <Text style={styles.instructionText}>
        👉 Đầu tiên, bé hãy đọc câu hỏi ở trên màn hình
        {"\n"}
        👉 Sau đó, nhìn lên màn hình và đếm xem có bao nhiêu điểm
        {"\n"}
        👉 Cuối cùng, chọn đáp án đúng ở phía dưới
      </Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={onStartGame}
      >
        <Text style={styles.startButtonText}>Bắt đầu nào!</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default InstructionLineScreen;