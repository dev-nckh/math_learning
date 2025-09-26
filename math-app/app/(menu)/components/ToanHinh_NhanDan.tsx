import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onSelect: (img: string) => void;
};

const stickers = [
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK1.png'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK2.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK3.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK4.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK5.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK6.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK7.jpg'),
  require('../../../assets/images/B2111885/Game2/Sticker/GameHinh2_SK8.jpg'),
];

const ToanHinh_NhanDan: React.FC<Props> = ({ onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {stickers.map((img, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.item}
          onPress={() => onSelect(img)}
        >
          <Image source={img} style={styles.image} resizeMode="contain" />
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
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: 40, height: 40 },
});

export default ToanHinh_NhanDan;