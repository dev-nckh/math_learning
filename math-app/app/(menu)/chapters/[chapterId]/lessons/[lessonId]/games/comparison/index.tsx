import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { FontAwesome5 } from "@expo/vector-icons";

function asString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

// ✅ dùng lại background Toán Võ
const backgroundImg = require("../../../../../../../../assets/images/ToanVo/images/bg.jpg");

export default function ComparisonIndex() {
  const params = useLocalSearchParams<{
    chapterId?: string | string[];
    lessonId?: string | string[];
  }>();

  const chapterId = asString(params.chapterId);
  const lessonId = asString(params.lessonId);

  const goToMode = (modeId: string) => {
    if (!chapterId || !lessonId) return;

    router.push(
      `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/comparison/${modeId}`,
    );
  };

  const goToTheory = () => {
    if (!chapterId || !lessonId) return;

    router.push(
      `/(menu)/chapters/${chapterId}/lessons/${lessonId}/games/comparison/theory`,
    );
  };

  const goBack = () => router.back();

  const modes = [
    { id: "fixed", title: "🎯 10 câu cố định", sub: "Chơi theo số câu" },
    { id: "timed", title: "⏱ Tính giờ", sub: "Chạy đua với thời gian" },
    { id: "lives", title: "❤️ 3 mạng", sub: "Sai hết mạng là thua" },
    { id: "hybrid", title: "⚡ Kết hợp", sub: "Giờ + mạng" },
    { id: "choose-sign", title: "🔢 Chọn dấu đúng", sub: "Chọn < = >" },
  ];

  return (
    <ImageBackground source={backgroundImg} style={styles.bg}>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.85}>
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              style={styles.circleBtn}
            >
              <FontAwesome5 name="arrow-left" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.headerLabel}>Quay lại</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#2196F3", "#1565C0"]}
            style={styles.titlePill}
          >
            <Text style={styles.title}>Game so sánh</Text>
          </LinearGradient>

          <View style={{ width: 70 }} />
        </View>

        <View style={styles.container}>
          <Shadow
            distance={5}
            startColor="rgba(0,0,0,0.1)"
            style={styles.shadow}
          >
            <LinearGradient colors={["#FFFFFF", "#F8F8F8"]} style={styles.card}>
              <Text style={styles.subtitle}>Chọn chế độ chơi</Text>

              {/* Nút lý thuyết */}
              <TouchableOpacity
                style={styles.theoryBtnWrap}
                onPress={goToTheory}
                activeOpacity={0.85}
                disabled={!chapterId || !lessonId}
              >
                <LinearGradient
                  colors={["#2ecc71", "#27ae60"]}
                  style={styles.theoryBtn}
                >
                  <FontAwesome5
                    name="book"
                    size={16}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.theoryText}>📖 Lý thuyết</Text>
                </LinearGradient>
              </TouchableOpacity>

              {!chapterId || !lessonId ? (
                <Text style={styles.errorText}>
                  Thiếu chapterId/lessonId trong route!
                </Text>
              ) : (
                <View style={{ gap: 12, marginTop: 10 }}>
                  {modes.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => goToMode(m.id)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={["#2196F3", "#03A9F4"]}
                        style={styles.modeBtn}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modeTitle}>{m.title}</Text>
                          <Text style={styles.modeSub}>{m.sub}</Text>
                        </View>
                        <Text style={styles.playIcon}>🎮</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </LinearGradient>
          </Shadow>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safeArea: { flex: 1, paddingTop: StatusBar.currentHeight || 25 },

  header: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1565C0",
    textAlign: "center",
    marginTop: 4,
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  titlePill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 16,
    justifyContent: "center",
  },
  shadow: { width: "100%", borderRadius: 14 },
  card: { borderRadius: 14, padding: 16 },

  subtitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1565C0",
    textAlign: "center",
    marginBottom: 10,
  },

  theoryBtnWrap: { alignSelf: "center" },
  theoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  theoryText: { color: "white", fontWeight: "900", fontSize: 15 },

  modeBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  modeTitle: { color: "white", fontSize: 16, fontWeight: "900" },
  modeSub: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  playIcon: { fontSize: 20, marginLeft: 12 },

  errorText: {
    marginTop: 12,
    color: "red",
    fontWeight: "800",
    textAlign: "center",
  },
});
