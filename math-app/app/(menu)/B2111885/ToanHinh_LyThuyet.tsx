import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import BackButton from '../components/backButton';

// Component chữ phát sáng nhấp nháy
function GlowingText({ children, style }: { children: React.ReactNode, style?: any }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const shadowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', 'yellow'],
  });
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 20],
  });

  return (
    <Animated.Text
      style={[
        style,
        {
          color: 'black',
          textShadowColor: shadowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: shadowRadius,
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
}

// Hook hiệu ứng nảy lên bằng translateY cho nội dung box
function useBounceYEffect() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const triggerBounce = () => {
    bounceAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -18,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [{ translateY: bounceAnim }],
  };

  return [animatedStyle, triggerBounce] as const;
}

export default function ToanHinh_LyThuyet() {
  const router = useRouter();

  // Tạo bounce effect cho từng box
  const [bounceStyle1, triggerBounce1] = useBounceYEffect();
  const [bounceStyle2, triggerBounce2] = useBounceYEffect();
  const [bounceStyle3, triggerBounce3] = useBounceYEffect();
  const [bounceStyle4, triggerBounce4] = useBounceYEffect();


  const handlePress = (type: string, triggerBounce: () => void) => {
    triggerBounce();
    setTimeout(() => {
      router.push({ pathname: '../../../B2111885/DayHinhHoc', params: { type } });
    }, 200);
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/B2111885/main_background3.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Thêm BackButton phía trên cùng */}
      <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 30 }}>
        <BackButton />
      </View>
      <View style={styles.overlay}>
        {/* Box Hình Tròn */}
        <TouchableOpacity style={styles.box1} onPress={() => handlePress('circle', triggerBounce1)}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row' }, bounceStyle1]}>
            <Image
              source={require('../../../assets/images/B2111885/background_button1.jpg')}
              style={styles.boxBg}
              resizeMode="cover"
            />
            <View style={styles.boxItemLeft}>
              <GlowingText style={styles.labelBig}>Hình Tròn</GlowingText>
            </View>
            <View style={styles.boxItemRight}>
              <View style={styles.circleBig} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Box Hình Vuông */}
        <TouchableOpacity style={styles.box2} onPress={() => handlePress('square', triggerBounce2)}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row' }, bounceStyle2]}>
            <Image
              source={require('../../../assets/images/B2111885/background_button2.jpg')}
              style={styles.boxBg}
              resizeMode="cover"
            />
            <View style={styles.boxItemLeft}>
              <GlowingText style={styles.labelBig}>Hình Vuông</GlowingText>
            </View>
            <View style={styles.boxItemRight}>
              <View style={styles.squareBig} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Box Hình Tam Giác */}
        <TouchableOpacity style={styles.box3} onPress={() => handlePress('triangle', triggerBounce3)}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row' }, bounceStyle3]}>
            <Image
              source={require('../../../assets/images/B2111885/background_button3.jpg')}
              style={styles.boxBg}
              resizeMode="cover"
            />
            <View style={styles.boxItemLeft}>
              <GlowingText style={styles.labelBig}>Hình Tam Giác</GlowingText>
            </View>
            <View style={styles.boxItemRight}>
              <View style={styles.triangleWrap}>
                <View style={styles.triangleBorder} />
                <View style={styles.triangleBig} />
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Box Hình Chữ Nhật */}
        <TouchableOpacity style={styles.box4} onPress={() => handlePress('rectangle', triggerBounce4)}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row' }, bounceStyle4]}>
            <Image
              source={require('../../../assets/images/B2111885/background_button5.jpg')}
              style={styles.boxBg}
              resizeMode="cover"
            />
            <View style={styles.boxItemLeft}>
              <GlowingText style={styles.labelBig}>Hình Chữ Nhật</GlowingText>
            </View>
            <View style={styles.boxItemRight}>
              <View style={styles.rectangleBig} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Box Hình Khối */}
        <TouchableOpacity style={styles.box5}  onPress={() => router.push('/(menu)/B2111885/DayHinhKhoi')}>
          <Animated.View style={[{ flex: 1, flexDirection: 'row' }]}>
            <Image
              source={require('../../../assets/images/B2111885/background_button4.jpg')}
              style={styles.boxBg}
              resizeMode="cover"
            />
            <View style={styles.boxItemLeft}>
              <GlowingText style={styles.labelBig}>Hình Khối</GlowingText>
            </View>
            <View style={styles.boxItemRight} />
            <Image source={require('../../../assets/images/B2111885/hinhkhoi.jpg')}
            style={{ width: 80, height: 80, alignSelf: 'center',right: 16 }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'stretch',
    paddingTop: 20,            
    paddingBottom: 0,             
  },
  labelBig: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#444',
  },
  box1: {
    flexDirection: 'row',
    height: '14%',
    backgroundColor: '#FFF9C4',
    borderRadius: 18,
    marginVertical: 10,
    marginHorizontal: '8%',
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
  box2: {
    flexDirection: 'row',
    height: '14%',
    backgroundColor: '#FFD1B3',
    borderRadius: 18,
    marginVertical: 10,
    marginHorizontal: '8%',
    shadowColor: '#BF360C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#FF9800',
    position: 'relative',
    overflow: 'hidden',
  },
  box3: {
    flexDirection: 'row',
    height: '14%',
    backgroundColor: '#B2EBCA',
    borderRadius: 18,
    marginVertical: 10,
    marginHorizontal: '8%',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#388E3C',
    position: 'relative',
    overflow: 'hidden',
  },
  box4: {
    flexDirection: 'row',
    height: '14%',
    backgroundColor: '#B3E5FC',
    borderRadius: 18,
    marginVertical: 10,
    marginHorizontal: '8%',
    shadowColor: '#01579B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#0288D1',
    position: 'relative',
    overflow: 'hidden',
  },
  box5: {
    flexDirection: 'row',
    height: '14%',
    backgroundColor: '#E1BEE7',
    borderRadius: 18,
    marginVertical: 10,
    marginHorizontal: '8%',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 32,
    borderWidth: 2,
    borderColor: '#8E24AA',
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
    paddingLeft: '5%',
    zIndex: 1,
  },
  boxItemRight: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    zIndex: 1,
  },
  circleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBC02D',
    borderWidth: 4,
    borderColor: '#F9A825',
  },
  squareBig: {
    width: 80,
    height: 80,
    backgroundColor: '#EF6C00',
    borderWidth: 4,
    borderColor: '#E65100',
    alignSelf: 'center',
  },
  triangleWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  triangleBorder: {
    position: 'absolute',
    borderLeftWidth: 44,
    borderRightWidth: 44,
    borderBottomWidth: 76,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2E7D32',
  },
  triangleBig: {
    borderLeftWidth: 36,
    borderRightWidth: 36,
    borderBottomWidth: 66,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#388E3C',
  },
  rectangleBig: {
    width: 90,
    height: 48,
    backgroundColor: '#0288D1',
    borderWidth: 4,
    borderColor: '#0277BD',
    alignSelf: 'center',
  },
});

