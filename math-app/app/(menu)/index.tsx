import {
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function MenuScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [pressedCard, setPressedCard] = useState<number | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToChapter = (chapterNumber: number) => {
    console.log(`🚀 Navigating to Chapter ${chapterNumber}`);
    router.push(`/chapters/${chapterNumber}` as any);
  };

  const chapters = [
    {
      number: 1,
      title: "So Sánh Số",
      emoji: "🔢",
      bgColor: "#FF7A8A",
      subtitle: "0 - 10",
      difficulty: "⭐ Dễ",
    },
    {
      number: 2,
      title: "Phép Cộng và Trừ",
      emoji: "➕",
      bgColor: "#5FE3D0",
      subtitle: "trong phạm vi 100",
      difficulty: "⭐ Dễ",
    },
    {
      number: 3,
      title: "Điểm và đoạn thẳng",
      emoji: "📏",
      bgColor: "#FFE135",
      subtitle: "Và đo độ dài",
      difficulty: "⭐⭐ Vừa",
    },
    {
      number: 4,
      title: "Đo thời gian",
      emoji: "⏰",
      bgColor: "#52D4A0",
      subtitle: "Với đồng hồ",
      difficulty: "⭐⭐ Vừa",
    },
    {
      number: 5,
      title: "Hình Học",
      emoji: "🔷",
      bgColor: "#DA70D6",
      subtitle: "Hình khối",
      difficulty: "⭐⭐⭐ Khó",
      isSpecial: true,
    },
    {
      number: 6,
      title: "Luyện Tập",
      emoji: "🎯",
      bgColor: "#FF99C8",
      subtitle: "Đếm từ 0-10",
      difficulty: "⭐ Dễ",
      isSpecial: true,
    },
  ];

  const handlePress = (chapter: any) => {
    setPressedCard(chapter.number);
    setTimeout(() => setPressedCard(null), 300);

    if (chapter.number === 1) {
      // Chapter 1 - Direct to Lesson 3 (Ôn tập 1-10)
      router.push("/(menu)/chapters/1/lessons/3");
    } else if (chapter.number === 2) {
      // Chapter 2 - Direct to Lesson 1 (Phép cộng cơ bản)
      router.push("/(menu)/chapters/2/lessons/1");
    } else if (chapter.number === 3) {
      // Chapter 3 - Direct to Lesson 1 (Đo độ dài đoạn thẳng)
      router.push("/(menu)/chapters/3/lessons/1");
    } else if (chapter.number === 4) {
      // Chapter 4 - Direct to Lesson 1 (Đo thời gian)
      router.push("/(menu)/chapters/4/lessons/2");
    } else if (chapter.number === 5) {
      router.push("/(menu)/B2111885/ToanHinh");
    } else if (chapter.number === 6) {
      router.push("/(menu)/B2111885/DemSo");
    } else {
      navigateToChapter(chapter.number);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Header */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <Animated.Text
              style={[
                styles.headerEmoji,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              🎓
            </Animated.Text>
            <Text style={styles.appTitle}>TOÁN VUI</Text>
            <Text style={styles.appTitle2}>CÙNG BÉ</Text>
            <Text style={styles.appSubtitle}>
              🚀 Khám phá thế giới số lượng! 🚀
            </Text>
          </View>
        </Animated.View>

        {/* Stats Section with enhanced styling */}
        <View style={styles.statsSection}>
          <Animated.View
            style={[
              styles.statBox,
              {
                opacity: opacityAnim,
                transform: [
                  {
                    scale: opacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>bài học</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.statBox,
              {
                opacity: opacityAnim,
                transform: [
                  {
                    scale: opacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>thử thách</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.statBox,
              {
                opacity: opacityAnim,
                transform: [
                  {
                    scale: opacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>vui</Text>
          </Animated.View>
        </View>

        {/* Welcome Section with gradient background */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <Text style={styles.welcomeTitle}>Chào bé yêu!</Text>
          <Text style={styles.welcomeSubtitle}>
            Hôm nay chúng ta sẽ cùng chơi và học toán nhé
          </Text>
        </View>

        {/* Section Title with personality */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Chọn bài học</Text>
        </View>

        {/* Chapters Grid */}
        <View style={styles.chaptersGrid}>
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.number}
              activeOpacity={0.8}
              onPress={() => handlePress(chapter)}
              style={[
                styles.chapterWrapper,
                pressedCard === chapter.number && styles.chapterWrapperPressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.chapterCard,
                  {
                    backgroundColor: chapter.bgColor,
                    transform: [
                      {
                        scale: pressedCard === chapter.number ? 0.95 : 1,
                      },
                    ],
                  },
                ]}
              >
                {/* Emoji Circle with glow */}
                <View style={styles.emojiCircleGlow} />
                <View style={styles.emojiCircle}>
                  <Text style={styles.cardEmoji}>{chapter.emoji}</Text>
                </View>

                {/* Title */}
                <Text style={styles.cardTitle}>{chapter.title}</Text>

                {/* Subtitle */}
                <Text style={styles.cardSubtitle}>{chapter.subtitle}</Text>

                {/* Difficulty */}
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {chapter.difficulty}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer with enhanced styling */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bé là ngôi sao sáng của tương lai!
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: "#667EEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,
  },
  appTitle2: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFE6F0",
    letterSpacing: 1,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#E0D7FF",
    fontWeight: "700",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    marginTop: -18,
    marginBottom: 20,
    zIndex: 10,
  },
  statBox: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    width: (width - 40) / 3,
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
  },
  welcomeSection: {
    marginHorizontal: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: "white",
    borderRadius: 22,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFE66D",
    shadowColor: "#FFE66D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 10,
  },
  sectionHeader: {
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#333",
  },
  chaptersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  chapterWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  chapterWrapperPressed: {
    transform: [{ scale: 0.95 }],
  },
  chapterCard: {
    width: "100%",
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  emojiCircleGlow: {
    position: "absolute",
    top: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  emojiCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  difficultyText: {
    fontSize: 10,
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    marginHorizontal: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 20,
    borderTopWidth: 3,
    borderTopColor: "#667EEA",
    alignItems: "center",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#667EEA",
    textAlign: "center",
  },
});
