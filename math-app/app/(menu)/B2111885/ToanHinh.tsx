import { useRouter } from 'expo-router'; 
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_SIZE = SCREEN_WIDTH * 0.35; 
const GIF_SIZE = SCREEN_WIDTH * 0.65;   
const H_MARGIN = SCREEN_WIDTH * 0.05;   



export default function ToanHinh() {
  const router = useRouter(); 


  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];


  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anims.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -20,
            duration: 1200,
            delay: idx * 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 20,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

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

  // Animation nhấp nháy màu tiêu đề
  const colorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [colorAnim]);

  const headerColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff9800', '#fff176'],
  });

  return (
    <ImageBackground
      source={require('../../../assets/images/B2111885/main_background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Div 1: Tiêu đề */}
        <View style={styles.div1}>
          <Animated.Text style={[styles.header, { color: headerColor }]}>
            HÌNH HỌC LỚP 1
          </Animated.Text>
        </View>

        {/* Div 2: Các hình */}
        <View style={styles.div2}>
          <View style={styles.shapesRow}>
            <Animated.View style={[styles.square, { transform: [{ translateY: anims[0] }] }]} />
            <Animated.View style={[styles.rectangle, { transform: [{ translateY: anims[1] }] }]} />
            <Animated.View style={[styles.triangleWrap, { transform: [{ translateY: anims[2] }] }]}>
              <View style={styles.triangle} />
            </Animated.View>
            <Animated.View style={[styles.circle, { transform: [{ translateY: anims[3] }] }]} />
          </View>
        </View>

        {/* Div 3: Bong bóng thoại */}
        <View style={styles.div3}>
          <View style={styles.speechContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Nào mình cùng khám phá sự thú vị của thế giới hình học nhé!</Text>
              <View style={styles.arrowBorder}>
                <View style={styles.arrowFill} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.div4}>
          {/* Nút bắt đầu */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(menu)/B2111885/ToanHinh_LyThuyet')}
          >
            <Text style={styles.startButtonText}>Bắt đầu</Text>
          </TouchableOpacity>
          {/* Gif */}
          <Animated.Image
            source={require('../../../assets/images/B2111885/character/dog_point.gif')}
            style={[styles.gif, { transform: [{ rotate }] }]}
          />
        </View>

        {/* Div 5: Bottom trống */}
        <View style={styles.divBottom} />
        <View
          style={{
            width: "90%",
            height: "40%",
            alignSelf: 'center',
            marginLeft: H_MARGIN,
            marginBottom: H_MARGIN * 2,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ width: "100%", height: "100%" }}
            onPress={() => router.push('/B2111885/TroChoiHinhHoc')}
            activeOpacity={0.8}
          >
            <View style={{ width: "95%", height: "45%", alignSelf: 'center', position: 'relative' }}>
              <Image
                source={require('../../../assets/images/B2111885/Game.jpg')}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: '#fff',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                pointerEvents="none"
              >
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 24,
                    textAlign: 'center',
                    textShadowColor: '#000',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 6,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    marginTop: "8%",
                    paddingHorizontal: 10,
                    paddingVertical: 5, 
                    borderRadius: 50,
                  }}
                >
                  Trò Chơi Hình Học
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  div1: {
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  div2: {
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10%',
  },
  div3: {
    height: '20%',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  div4: {
    height: BUTTON_SIZE , 
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  startButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    marginLeft: H_MARGIN*3,
    marginBottom: H_MARGIN*1.5,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  divBottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff9800',
    textShadowColor: '#fff176',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
    textAlign: 'center',
  },
  shapesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: H_MARGIN,
  },
  square: {
    width: 64,
    height: 64,
    backgroundColor: '#4fc3f7',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#0288d1',
  },
  rectangle: {
    width: 96,
    height: 48,
    backgroundColor: '#81c784',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#388e3c',
  },
  triangleWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 32,
    borderRightWidth: 32,
    borderBottomWidth: 64,
    marginHorizontal: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffb74d',
  },
  circle: {
    width: 64,
    height: 64,
    backgroundColor: '#e57373',
    marginHorizontal: 12,
    borderWidth: 2,
    borderColor: '#b71c1c',
    borderRadius: 32,
  },
  speechContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginLeft: '10%',

  },
  speechBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    maxWidth: 180,
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
  arrowBorder: {
    position: 'absolute',
    right: 14,
    bottom: -16,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ccc',
  },
  arrowFill: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  gif: {
    width: GIF_SIZE,
    height: GIF_SIZE,
  },
  footer: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: H_MARGIN,
    marginBottom: H_MARGIN * 2,
    fontWeight: 'bold',
    position: 'absolute',
  },
});