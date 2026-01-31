import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  score: number;
  level: number;
}

export default function TmScoreHeader({ score, level }: Props) {
  return (
    <View style={styles.hud}>
      <View style={[styles.badge, { backgroundColor: '#e5f3ff' }]}>
        <Text style={[styles.badgeLabel, { color: '#1e88e5' }]}>Điểm:</Text>
        <Text style={[styles.badgeValue, { color: '#1565c0' }]}>{score}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: '#eaf7e9' }]}>
        <Text style={[styles.badgeLabel, { color: '#2e7d32' }]}>Level</Text>
        <Text style={[styles.badgeValue, { color: '#1b5e20' }]}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  badgeLabel: { fontSize: 16, fontWeight: '600' },
  badgeValue: { fontSize: 16, fontWeight: '800' },
});

