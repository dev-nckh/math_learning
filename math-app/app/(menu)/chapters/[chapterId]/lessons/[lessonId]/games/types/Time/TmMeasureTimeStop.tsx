import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import TmScoreHeader from './TmScoreHeader';

function pickTarget(): 5 | 7 | 10 {
  const arr: Array<5 | 7 | 10> = [5, 7, 10];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TmMeasureTimeStop() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1); // 1..5 per level
  const [target, setTarget] = useState<5 | 7 | 10>(pickTarget());
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState('');

  const startTimeRef = useRef<number | null>(null);
  const progress = useRef(new Animated.Value(0)).current; // 0..1 visual progress

  // Slightly speed up the indicator as level increases
  const timeScale = useMemo(() => 1 + (level - 1) * 0.05, [level]);

  const resetRound = () => {
    setTarget(pickTarget());
    setFeedback('');
    startTimeRef.current = null;
    setRunning(false);
    progress.setValue(0);
  };

  useEffect(() => {
    return () => { progress.stopAnimation(); };
  }, [progress]);

  // Use Animated.timing for smooth visual rotation; keep scoring by real elapsed time

  const start = () => {
    if (running) return;
    setRunning(true);
    startTimeRef.current = Date.now();
    progress.stopAnimation();
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 10000 / timeScale,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setRunning(false);
      }
    });
  };

  const stop = () => {
    if (!running || !startTimeRef.current) return;
    setRunning(false);
    progress.stopAnimation();
    const realElapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
    const err = Math.abs(target - realElapsed);

    let add = 0; let msg = '';
    if (err <= 0.3) { add = 120; msg = '🎉 Tuyệt vời!'; }
    else if (err <= 0.8) { add = 80; msg = '👍 Khá tốt!'; }
    else if (err <= 1.5) { add = 40; msg = '🙂 Được rồi!'; }
    else { add = 0; msg = '😅 Lệch rồi, thử lại nhé!'; }

    setScore((s) => s + add);
    setFeedback(`${msg} Sai số ${err.toFixed(2)}s`);
    try { Haptics.selectionAsync(); } catch {}

    setTimeout(() => {
      if (round >= 5) {
        setLevel((l) => l + 1);
        setRound(1);
      } else setRound((r) => r + 1);
      resetRound();
    }, 900);
  };

  // Visual needle rotation 0..360 based on progress
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <TmScoreHeader score={score} level={level} />

      <View style={styles.card}> 
        <Text style={styles.title}>Dừng đồng hồ đúng lúc</Text>
        <Text style={styles.subtitle}>Hãy dừng ở {target} giây</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.circle}>
          {/* ticks */}
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.ringSlot, { transform: [{ rotate: `${i * 18}deg` }] }]}> 
              <View style={styles.ringTick} />
            </View>
          ))}
          {/* needle pivoted at center */}
          <Animated.View style={[styles.needleWrapper, { transform: [{ rotate }] }]}>
            <View style={styles.needle} />
          </Animated.View>
          <View style={styles.inner}>
            <Text style={styles.elapsedText}>0 → 10s</Text>
            <View style={{ height: 6 }} />
            <View style={styles.actionsRow}>
              <TouchableOpacity
                disabled={running}
                style={[styles.ctrlBtn, { backgroundColor: running ? '#93c5fd' : '#3b82f6' }]}
                onPress={start}
                activeOpacity={0.9}
              >
                <Text style={styles.ctrlText}>Bắt đầu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!running}
                style={[styles.ctrlBtn, { backgroundColor: running ? '#10b981' : '#86efac' }]}
                onPress={stop}
                activeOpacity={0.9}
              >
                <Text style={styles.ctrlText}>Dừng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  card: { marginHorizontal: 16, marginTop: 8, padding: 16, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#374151' },
  progressWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  circle: { width: 240, height: 240, borderRadius: 120, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3 },
  ringSlot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' },
  ringTick: { marginTop: 10, width: 2, height: 10, backgroundColor: '#cbd5e1', borderRadius: 1 },
  needleWrapper: { position: 'absolute', top: '50%', left: '50%', width: 4, height: 200, marginLeft: -2, marginTop: -100, alignItems: 'center', justifyContent: 'flex-end' },
  needle: { width: 3, height: 100, backgroundColor: '#ef4444', borderRadius: 2 },
  inner: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  elapsedText: { color: '#64748b', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  ctrlBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  ctrlText: { color: '#fff', fontWeight: '800' },
  feedback: { textAlign: 'center', marginTop: 14, fontWeight: '700', color: '#0f766e' },
});
