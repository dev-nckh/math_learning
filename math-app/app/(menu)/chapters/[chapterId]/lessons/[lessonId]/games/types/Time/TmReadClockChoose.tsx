import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import TmAnalogClock from './TmAnalogClock';
import TmScoreHeader from './TmScoreHeader';
import { generateOptions, randomFullOrHalf, toTimeLabel, TmTime } from './TmTimeUtils';

export default function TmReadClockChoose() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0); // 0..9 per level
  const [feedback, setFeedback] = useState<string>('');
  const [correct, setCorrect] = useState<TmTime>(randomFullOrHalf());

  const scaleAnims = [0, 1, 2, 3].map(() => useRef(new Animated.Value(1)).current);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const options = useMemo(() => generateOptions(correct, 4), [correct]);
  const label = useMemo(() => toTimeLabel(correct.hour, correct.minute), [correct]);

  const transitionDelay = Math.max(300, 800 - (level - 1) * 50);

  const nextQuestion = () => {
    if (questionIndex + 1 >= 10) {
      setLevel((l) => l + 1);
      setQuestionIndex(0);
    } else {
      setQuestionIndex((i) => i + 1);
    }
    setCorrect(randomFullOrHalf());
    setFeedback('');
  };

  const animateScale = (idx: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[idx], { toValue: 1.06, duration: 140, useNativeDriver: true }),
      Animated.spring(scaleAnims[idx], { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const onSelect = (choice: TmTime, idx: number) => {
    const isCorrect = choice.hour === correct.hour && choice.minute === correct.minute;
    if (isCorrect) {
      setScore((s) => s + 100);
      setFeedback('✅ Chính xác!');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      animateScale(idx);
      setTimeout(nextQuestion, transitionDelay);
    } else {
      setFeedback('❌ Chưa đúng, thử lại nhé!');
      try { Haptics.selectionAsync(); } catch {}
      animateShake();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TmScoreHeader score={score} level={level} />

      <View style={styles.card}> 
        <Text style={styles.title}>Chọn đồng hồ đúng</Text>
        <Text style={styles.subtitle}>Đồng hồ nào chỉ {label}?</Text>
      </View>

      <Animated.View style={{ width: '100%', transform: [{ translateX: shakeAnim }] }}>
        <View style={styles.grid}>
          {options.map((opt, idx) => (
            <Animated.View key={`${opt.hour}-${opt.minute}`} style={{ transform: [{ scale: scaleAnims[idx] }] }}>
              <TouchableOpacity style={styles.clockCard} activeOpacity={0.9} onPress={() => onSelect(opt, idx)}>
                <TmAnalogClock hour={opt.hour} minute={opt.minute as 0 | 30} size={150} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {feedback ? (
        <View style={styles.feedbackBar}><Text style={styles.feedbackText}>{feedback}</Text></View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#374151' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 16, marginTop: 4 },
  clockCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3,
    marginBottom: 12,
    marginHorizontal: 8,
  },
  feedbackBar: { alignSelf: 'center', backgroundColor: '#eef2ff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  feedbackText: { color: '#3730a3', fontSize: 16, fontWeight: '700' },
});

