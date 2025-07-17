import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const MenuLayout = () => {
  const router = useRouter();
  
  // Animation values
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const titlePosition = React.useRef(new Animated.Value(height * 0.2)).current;

  React.useEffect(() => {
    // Animate title on mount
    Animated.timing(titlePosition, {
      toValue: height * 0.1,
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

const navigateToChapter = (chapterNumber: number) => {
  console.log(`🔍 Attempting to navigate to: /chapter${chapterNumber}`);
  
  Animated.sequence([
    Animated.timing(buttonScale, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // Thử absolute path
    router.replace(`../contents/chapter_${chapterNumber   }/chapter${chapterNumber}`);
    console.log(`✅ Navigation executed for Chapter ${chapterNumber}`);
    
    // Kiểm tra pathname sau khi navigate
    setTimeout(() => {
      // console.log(`🔍 New pathname:`, router.pathname); // Removed: Router has no 'pathname' property
    }, 100);
  });
};

  const ChapterButton = ({ chapterNumber }: { chapterNumber: number }) => (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => navigateToChapter(chapterNumber)}
      activeOpacity={0.7}
      style={styles.buttonContainer}
    >
      <Animated.View 
        style={[
          styles.button,
          { 
            backgroundColor: getChapterColor(chapterNumber),
            transform: [{ scale: buttonScale }]
          }
        ]}
      >
        <Text style={styles.buttonText}>Chapter {chapterNumber}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  const getChapterColor = (chapterNumber: number) => {
    const colors = [
      '#FF6B6B', // Chapter 1
      '#4ECDC4', // Chapter 2
      '#45B7D1', // Chapter 3
      '#F9CA24', // Chapter 4
    ];
    return colors[chapterNumber - 1] || colors[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />
      
      <Animated.View 
        style={[
          styles.titleContainer,
          { transform: [{ translateY: titlePosition }] }
        ]}
      >
        <Text style={styles.title}>Math Learning App</Text>
        <Text style={styles.subtitle}>Chọn chương để bắt đầu học</Text>
      </Animated.View>

      <View style={styles.menuContainer}>
        <ChapterButton chapterNumber={1} />
        <ChapterButton chapterNumber={2} />
        <ChapterButton chapterNumber={3} />
        <ChapterButton chapterNumber={4} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 Math Learning App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667EEA',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 12,
  },
  button: {
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default MenuLayout;