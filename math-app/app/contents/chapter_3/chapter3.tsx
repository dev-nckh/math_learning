import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import Point from './section_1';
import PointIntroduction from '../../components/PointIntroduction';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chapter3 = () => {
  const [showIntroduction, setShowIntroduction] = useState(true);

  const handleIntroductionComplete = () => {
    setShowIntroduction(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {showIntroduction ? (
        <PointIntroduction onComplete={handleIntroductionComplete} />
      ) : (
        <Point />
      )}
    </View>
  );
};

export default Chapter3;

const styles = StyleSheet.create({});