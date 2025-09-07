import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameResultScreen() {
  const { chapterId, lessonId, gameId, score, totalQuestions } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
    gameId: string;
    score: string;
    totalQuestions: string;
  }>();

  const finalScore = parseInt(score || '0');
  const total = parseInt(totalQuestions || '0');
  const percentage = Math.round((finalScore / (total * 10)) * 100);
  
  const getStars = () => {
    if (percentage >= 80) return 3;
    if (percentage >= 60) return 2;
    return 1;
  };

  const stars = getStars();

  const continueLesson = () => {
    router.push({
      pathname: `/(menu)/chapters/[chapterId]/lessons/[lessonId]` as any,
      params: { chapterId, lessonId }
    });
  };

  const showReward = () => {
    router.push({
      pathname: `/(menu)/(modals)/lesson-complete` as any,
      params: { score, stars: stars.toString() }
    });
  };

  const playAgain = () => {
    router.push({
      pathname: `/(menu)/chapters/[chapterId]/lessons/[lessonId]/games/[gameId]` as any,
      params: { chapterId, lessonId, gameId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.title}>🎉 Kết quả trò chơi</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Điểm số: {finalScore}</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3].map((star) => (
              <Text key={star} style={styles.star}>
                {star <= stars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            {percentage >= 80 ? 'Xuất sắc! Bé đã làm rất tốt!' : 
             percentage >= 60 ? 'Tốt lắm! Tiếp tục cố gắng nhé!' : 
             'Cố gắng lần sau nhé!'}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={continueLesson}>
            <Text style={styles.primaryButtonText}>Tiếp tục học</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={playAgain}>
            <Text style={styles.secondaryButtonText}>Chơi lại</Text>
          </TouchableOpacity>
          
          {stars >= 2 && (
            <TouchableOpacity style={styles.rewardButton} onPress={showReward}>
              <Text style={styles.rewardButtonText}>🏆 Nhận thưởng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff', justifyContent: 'center', padding: 20 },
  resultContainer: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  scoreContainer: { alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  percentageText: { fontSize: 16, color: '#666', marginTop: 5 },
  starsContainer: { flexDirection: 'row', marginTop: 10 },
  star: { fontSize: 30, marginHorizontal: 5 },
  feedback: { marginBottom: 30 },
  feedbackText: { fontSize: 16, textAlign: 'center', color: '#333' },
  buttonsContainer: { width: '100%' },
  primaryButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginBottom: 10 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, marginBottom: 10 },
  secondaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  rewardButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 10 },
  rewardButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});