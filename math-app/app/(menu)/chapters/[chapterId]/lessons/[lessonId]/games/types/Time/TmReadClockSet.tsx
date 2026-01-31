import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import TmAnalogClock from './TmAnalogClock';
import TmScoreHeader from './TmScoreHeader';
import { randomFullOrHalf, toTimeLabel } from './TmTimeUtils';

export default function TmReadClockSet() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(randomFullOrHalf());
  const [h, setH] = useState(6);
  const [m, setM] = useState<0 | 30>(0);
  const [hint, setHint] = useState('');

  const label = useMemo(() => toTimeLabel(target.hour, target.minute), [target]);

  const randomDifferentFrom = (t: { hour: number; minute: 0 | 30 }) => {
    let r = randomFullOrHalf();
    let guard = 0;
    while (r.hour === t.hour && r.minute === t.minute && guard < 10) {
      r = randomFullOrHalf();
      guard++;
    }
    return r;
  };

  // Start from a time different from the target to ensure interaction
  useEffect(() => {
    const r = randomDifferentFrom(target);
    setH(r.hour);
    setM(r.minute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextRound = () => {
    if (round >= 10) {
      setLevel((l) => l + 1);
      setRound(1);
    } else setRound((r) => r + 1);
    const nt = randomFullOrHalf();
    setTarget(nt);
    const r = randomDifferentFrom(nt);
    setH(r.hour);
    setM(r.minute);
    setHint('');
  };

  const incH = () => setH((prev) => (prev % 12) + 1);
  const decH = () => setH((prev) => ((prev + 10) % 12) + 1);
  const incM = () => setM((prev) => (prev === 0 ? 30 : 0));
  const decM = () => setM((prev) => (prev === 0 ? 30 : 0));

  const onConfirm = () => {
    const ok = h === target.hour && m === target.minute;
    if (ok) {
      setScore((s) => s + 100);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      nextRound();
    } else {
      setHint('Kim giờ ngắn, kim phút dài. Thử lại nhé!');
      try { Haptics.selectionAsync(); } catch {}
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TmScoreHeader score={score} level={level} />

      <View style={styles.card}> 
        <Text style={styles.title}>Xoay/đặt kim đồng hồ</Text>
        <Text style={styles.subtitle}>Mục tiêu: Đặt {label}</Text>
      </View>

      <View style={styles.centerBox}>
        <TmAnalogClock hour={h} minute={m} size={220} />
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.controlGroup}>
          <Text style={styles.groupTitle}>Giờ</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.roundBtn} onPress={decH}><Text style={styles.btnText}>–</Text></TouchableOpacity>
            <View style={styles.valueBox}><Text style={styles.valueText}>{h}</Text></View>
            <TouchableOpacity style={styles.roundBtn} onPress={incH}><Text style={styles.btnText}>+</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.controlGroup}>
          <Text style={styles.groupTitle}>Phút</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.roundBtn} onPress={decM}><Text style={styles.btnText}>–</Text></TouchableOpacity>
            <View style={styles.valueBox}><Text style={styles.valueText}>{m.toString().padStart(2, '0')}</Text></View>
            <TouchableOpacity style={styles.roundBtn} onPress={incM}><Text style={styles.btnText}>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.9}>
        <Text style={styles.confirmText}>Xác nhận</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#374151' },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 8 },
  controlGroup: { backgroundColor: '#fff', padding: 12, borderRadius: 14, width: '44%', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  groupTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, fontWeight: '900', color: '#111827' },
  valueBox: { minWidth: 60, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center' },
  valueText: { fontSize: 18, fontWeight: '800', color: '#1e40af' },
  hint: { textAlign: 'center', color: '#6b7280', marginTop: 10 },
  confirmBtn: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
