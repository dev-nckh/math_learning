import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onSelect: (img: string) => void;
  selected?: string;
};

const backgrounds = [
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG1.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG2.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG3.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG4.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG5.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG6.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG7.jpg'),
  require('../../../assets/images/B2111885/Game2/BackGround/GameHinh2_BG8.jpg'),
];

const ToanHinh_HinhNen: React.FC<Props> = ({ onSelect, selected }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {backgrounds.map((img, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.item,
            selected === img && { borderColor: '#ff9800', borderWidth: 3 }
          ]}
          onPress={() => onSelect(img)}
        >
          <Image source={img} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 4, // giảm padding trên/dưới
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  item: {
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 2,
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: 54, height: 54, borderRadius: 12 },
});

export default ToanHinh_HinhNen;