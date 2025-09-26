import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_HEIGHT = SCREEN_WIDTH * 0.22;
const GIF_SIZE = SCREEN_WIDTH * 0.45;

// Text nhấp nháy vàng-cam cho kỷ lục
function FlashingScore({ children, style }: { children: React.ReactNode, style?: any }) {
  const colorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const color = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFD600', '#FF9800'], // vàng -> cam
  });
  const shadow = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFF59D', '#FFB300'],
  });
  return (
    <Animated.Text
      style={[
        style,
        {
          color,
          textShadowColor: shadow,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 16,
          fontWeight: 'bold',
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
}

export default function TroChoiHinhHoc() {
  const router = useRouter();
  const [highScore, setHighScore] = React.useState(0);

  useEffect(() => {
    AsyncStorage.getItem('mathgame_high_score').then(val => {
      if (val) setHighScore(Number(val));
    });
  }, []);

  // Animation lắc lư cho gif
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-10deg', '10deg', '-10deg'],
  });

  return (
    <ImageBackground
      source={require('../../../assets/images/B2111885/main_background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* div1: Bong bóng thoại trái, gif phải */}
      <View style={styles.div1}>
        <View style={styles.speechContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              Nào mình cùng nhau chơi trò chơi hình học nhé!
            </Text>
          </View>
        </View>
        <Animated.Image
          source={require('../../../assets/images/B2111885/character/dog_point.gif')}
          style={[styles.gif, { transform: [{ rotate }] }]}
        />
      </View>

      {/* div2: Các box trò chơi */}
      <View style={styles.div2}>
        {/* Box trò chơi 1 */}
        <TouchableOpacity style={styles.box}
          onPress={() => router.push('/(menu)/B2111885/GameHinh1')}
        >
          <Image
            source={require('../../../assets/images/B2111885/background_button3.jpg')}
            style={styles.boxBg}
            resizeMode="cover"
          />
          <View style={styles.boxItemLeft}>
            <Text style={styles.labelBig}>Rổ Hình Vui Nhộn</Text>
            <FlashingScore style={styles.highScoreText}>
              Kỷ lục: {highScore}
            </FlashingScore>
          </View>
          <View style={styles.boxItemRight}>
            {/* Để trống cho item khác */}
          </View>
        </TouchableOpacity>

        {/* Box trò chơi 2 */}
        <TouchableOpacity style={styles.box}
        onPress={() => router.push('/(menu)/B2111885/GameHinh2')}
        >
          <Image
            source={require('../../../assets/images/B2111885/background_button3.jpg')}
            style={styles.boxBg}
            resizeMode="cover"
          />
          <View style={styles.boxItemLeft}>
            <Text style={styles.labelBig}>Ghép Hình Vui Vui</Text>
            <Text style={styles.highScoreText}></Text>
          </View>
          <View style={styles.boxItemRight} />
        </TouchableOpacity>

        {/* Box trò chơi 3 */}
        <TouchableOpacity style={styles.box}>
          <Image
            source={require('../../../assets/images/B2111885/background_button3.jpg')}
            style={styles.boxBg}
            resizeMode="cover"
          />
          <View style={styles.boxItemLeft}>
            <Text style={styles.labelBig}>Game3</Text>
            <Text style={styles.highScoreText}></Text>
          </View>
          <View style={styles.boxItemRight} />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  div1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '28%',
    paddingHorizontal: '7%',
    marginTop: 10,
  },
  speechContainer: {
    flex: 1.2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  speechBubble: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
  },
  speechText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gif: {
    width: GIF_SIZE,
    height: GIF_SIZE,
    alignSelf: 'center',
    marginLeft: 10,
  },
  div2: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: "25%",
    width: '88%',
    backgroundColor: '#FFF9C4',
    borderRadius: 22,
    marginVertical: 16,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#F9A825',
    position: 'relative',
    overflow: 'hidden',
  },
  boxBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.65,
    zIndex: 0,
  },
  boxItemLeft: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: '7%',
    zIndex: 1,
  },
  boxItemRight: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    zIndex: 1,
  },
  labelBig: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
  },
  highScoreText: {
    fontSize: 22,
    marginTop: 2,
    fontWeight: 'bold',
    paddingBottom: "1%",
  },
});

