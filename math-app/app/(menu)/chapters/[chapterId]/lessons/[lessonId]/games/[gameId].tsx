// games/[gameId].tsx - Game Dispatcher
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import các game components

// Shared data (nên move ra file riêng)
import { lessonsData } from "../../../../data/lessons.data";
import DrawPointGame from "./types/PointLineGame";

interface GameProps {
  chapterId: string;
  lessonId: string;
  gameId: string;
  gameData: {
    id: number;
    title: string;
    type: string;
    difficulty: string;
    description: string;
  };
}

export default function GameScreen() {
  const { chapterId, lessonId, gameId } = useLocalSearchParams<{
    chapterId: string;
    lessonId: string;
    gameId: string;
  }>();

  const chapterNum = parseInt(chapterId as string);
  const lessonNum = parseInt(lessonId as string);
  const gameNum = parseInt(gameId as string);

  const lessonData = lessonsData[chapterNum]?.[lessonNum];
  const gameData = lessonData?.games.find((game: any) => game.id === gameNum);

  // Error handling
  if (!lessonData || !gameData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Lỗi</Text>
          <Text style={styles.errorText}>
            {!lessonData ? "Bài học không tồn tại!" : "Trò chơi không tồn tại!"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Game type dispatcher
  const renderGame = () => {
    const gameProps: GameProps = {
      chapterId: chapterId as string,
      lessonId: lessonId as string,
      gameId: gameId as string,
      gameData: {
        ...gameData,
        description: gameData.description || "No description available",
      },
    };

    switch (gameData.type) {
      case "draw":
        return <DrawPointGame {...gameProps} />;

      default:
        return (
          <SafeAreaView style={styles.container}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>🚧</Text>
              <Text style={styles.errorText}>
                Game type &quot;{gameData.type}&quot; chưa được implement!
              </Text>
              <Text style={styles.errorSubtext}>
                Hãy thêm component cho loại game này
              </Text>
            </View>
          </SafeAreaView>
        );
    }
  };

  return renderGame();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
});
