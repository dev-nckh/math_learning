import React from 'react';
import { View, StyleSheet } from 'react-native';

type TmMinute = 0 | 30;

export interface TmAnalogClockProps {
  hour: number; // 1..12
  minute: TmMinute; // 0 | 30
  size?: number; // default 160
  showTicks?: boolean; // default true
  centerDot?: boolean; // default true
  interactive?: boolean; // visual hint only, not draggable
}

// Lightweight analog clock built with Views + transform
export default function TmAnalogClock({
  hour,
  minute,
  size = 160,
  showTicks = true,
  centerDot = true,
  interactive = false,
}: TmAnalogClockProps) {
  const radius = size / 2;
  const minuteAngle = minute === 0 ? 0 : 180; // 0 => at 12; 30 => at 6
  // Hour advances 30deg per hour + 15deg when minute is 30
  const hourAngle = ((hour % 12) + (minute === 30 ? 0.5 : 0)) * 30;

  return (
    <View style={[styles.container, { width: size, height: size }]}> 
      <View
        style={[
          styles.face,
          { width: size, height: size, borderRadius: radius, borderColor: '#d0d7de' },
          interactive && { shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
        ]}
      >
        {showTicks && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <View key={i} style={[styles.tickWrapper, { transform: [{ rotate: `${i * 30}deg` }] }]}> 
                <View
                  style={[
                    styles.tick,
                    {
                      height: i % 3 === 0 ? 14 : 8,
                      backgroundColor: i % 3 === 0 ? '#6b7280' : '#9ca3af',
                      left: radius - 1,
                    },
                  ]}
                />
              </View>
            ))}
          </>
        )}

        {/* Minute hand */}
        <View style={[styles.handWrapper, { transform: [{ rotate: `${minuteAngle}deg` }] }]}> 
          <View style={{ width: 3, height: radius - 20, backgroundColor: '#111827', borderRadius: 2, transform: [{ translateY: -((radius - 20) / 2) }] }} />
        </View>

        {/* Hour hand */}
        <View style={[styles.handWrapper, { transform: [{ rotate: `${hourAngle}deg` }] }]}> 
          <View style={{ width: 4, height: radius - 44, backgroundColor: '#374151', borderRadius: 2, transform: [{ translateY: -((radius - 44) / 2) }] }} />
        </View>

        {centerDot && <View style={styles.centerDot} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  face: {
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  tick: { position: 'absolute', top: 8, width: 2, borderRadius: 1 },
  handWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
});
