import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LessonCompleteModal() {
  const { score, stars } = useLocalSearchParams<{
    score: string;
    stars: string;
  }>();

  const handleContinue = () => {
    router.dismiss(); // Đóng modal
    router.push('/(menu)'); // Về menu chính
  };

  const starCount = parseInt(stars || '1');

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>🎉 Chúc mừng!</Text>
          <Text style={styles.subtitle}>Bé đã hoàn thành xuất sắc!</Text>
          
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardText}>Phần thưởng:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Text key={star} style={styles.star}>
                  {star <= starCount ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={styles.badgeText}>🏆 Huy hiệu: Thần đồng toán học</Text>
          </View>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Tiếp tục khám phá</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: 400 },
  modal: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  rewardContainer: { alignItems: 'center', marginBottom: 30 },
  rewardText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', marginBottom: 15 },
  star: { fontSize: 40, marginHorizontal: 5 },
  badgeText: { fontSize: 16, color: '#FF9800', fontWeight: 'bold' },
  continueButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  continueButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});