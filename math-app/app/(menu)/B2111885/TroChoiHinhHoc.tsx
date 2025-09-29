import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../components/backButton';

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

// Component Box với hiệu ứng dao động
function GameBox({ 
  title, 
  backgroundImage, 
  highScore, 
  showReset = false, 
  onPress, 
  onReset 
}: { 
  title: string; 
  backgroundImage: any; 
  highScore?: number; 
  showReset?: boolean; 
  onPress: () => void; 
  onReset?: () => void; 
}) {
  // Hiệu ứng dao động nhẹ
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8], // Dao động lên xuống 8px
  });

  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02], // Phóng to nhẹ khi lên cao
  });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity style={styles.box} onPress={onPress}>
        <Image
          source={backgroundImage}
          style={styles.boxBg}
          resizeMode="cover"
        />
        {/* Tiêu đề nằm trên cùng */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.leftContent}>
            {showReset && highScore !== undefined && (
              <FlashingScore style={styles.highScoreText}>
                Kỷ lục: {highScore}
              </FlashingScore>
            )}
          </View>
          <View style={styles.rightContent}>
            {/* Để trống cho item khác */}
          </View>
        </View>

        {/* Nút reset điểm */}
        {showReset && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={(e) => {
              e.stopPropagation();
              onReset?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
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

  const handleResetScore = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đặt lại điểm kỷ lục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('mathgame_high_score', '0');
            setHighScore(0);
          },
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/B2111885/main_background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Thêm BackButton phía trên cùng */}
      <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 20, marginBottom: 0 }}>
        <BackButton />
      </View>

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
        <GameBox
          title="Rổ Hình Vui Nhộn"
          backgroundImage={require('../../../assets/images/B2111885/GameHungHinh.png')}
          highScore={highScore}
          showReset={true}
          onPress={() => router.push('/(menu)/B2111885/GameHinh1')}
          onReset={handleResetScore}
        />

        {/* Box trò chơi 2 */}
        <GameBox
          title="Ghép Hình"
          backgroundImage={require('../../../assets/images/B2111885/GameXepHinh.png')}
          onPress={() => router.push('/(menu)/B2111885/GameHinh2')}
        />
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
    alignItems: 'center',
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
    alignItems: 'center',
    height: 210, 
    width: SCREEN_WIDTH * 0.88,
    backgroundColor: '#FFF9C4',
    borderRadius: 22,
    marginVertical: 16,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 5,
    borderColor: '#F9A825',
    position: 'relative',
    overflow: 'hidden',
  },
  boxBg: {
    width: '100%',
    height: '100%',
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    resizeMode: 'cover',
  },
  titleContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF9C4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F9A825',
    zIndex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  leftContent: {
    flex: 7,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 10,
    paddingLeft: 10,
  },
  rightContent: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  highScoreText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  resetButton: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 2,
    elevation: 4,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});