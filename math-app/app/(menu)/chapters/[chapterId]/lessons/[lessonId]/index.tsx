import {
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";

// Dữ liệu lessons và games
import { lessonsData } from "../../../data/lessons.data";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#7f8c8d",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: "#95a5a6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  overviewButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: "center",
  },
  overviewButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  gamesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: "white",
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    marginRight: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  gameFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  typeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  arrowText: {
    fontSize: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 50,
  },
});

export default function LessonScreen() {
  const { chapterId, lessonId } = useLocalSearchParams();
  const chapterNum = parseInt(chapterId as string);
  const lessonNum = parseInt(lessonId as string);

  const lessonData =
    lessonsData[chapterNum as keyof typeof lessonsData]?.[
      lessonNum as keyof (typeof lessonsData)[keyof typeof lessonsData]
    ];

  const navigateToGame = (gameId: number) => {
    console.log(
      `🎮 Navigating to Chapter ${chapterNum}, Lesson ${lessonNum}, Game ${gameId}`,
    );
    router.push(
      `/(menu)/chapters/${chapterNum}/lessons/${lessonNum}/games/${gameId}` as any,
    );
  };

  const navigateToGamesOverview = () => {
    router.push(
      `/(menu)/chapters/${chapterNum}/lessons/${lessonNum}/games` as any,
    );
  };

  const goBack = () => {
    router.back();
  };

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Bài học không tồn tại!</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.buttonText}>← Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getGameTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      counting: "#27ae60",
      matching: "#3498db",
      sorting: "#e67e22",
      puzzle: "#9b59b6",
      addition: "#e74c3c",
      calculation: "#f39c12",
      racing: "#1abc9c",

      addition100: "#e74c3c",
      subtraction100: "#27ae60",
      // Time lesson types
      "tm-time-choose-clock": "#3b82f6", // blue
      "tm-time-set-clock": "#8b5cf6", // indigo/purple
      "tm-time-stopwatch": "#14b8a6", // teal
    };
    return colors[type] || "#95a5a6";
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case "tm-time-choose-clock":
        return "Time choose clock";
      case "tm-time-set-clock":
        return "Time set clock";
      case "tm-time-stopwatch":
        return "Time stop clock";
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Dễ":
        return "#27ae60";
      case "Trung bình":
        return "#f39c12";
      case "Khó":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>
            ← Quay lại Chapter {chapterNum}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>{lessonData.title}</Text>
        <Text style={styles.description}>{lessonData.description}</Text>

        {/* Games Overview Button */}
        <TouchableOpacity
          style={styles.overviewButton}
          onPress={navigateToGamesOverview}
        >
          <Text style={styles.overviewButtonText}>🎯 Xem tất cả trò chơi</Text>
        </TouchableOpacity>

        {/* Games List */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Các bài học:</Text>

          {lessonData.games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                { borderLeftColor: getGameTypeColor(game.type) },
              ]}
              onPress={() => navigateToGame(game.id)}
            >
              <View style={styles.gameHeader}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(game.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>
              </View>

              <View style={styles.gameFooter}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getGameTypeColor(game.type) },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {getGameTypeLabel(game.type)}
                  </Text>
                </View>
                <Text style={styles.arrowText}>🎮</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
