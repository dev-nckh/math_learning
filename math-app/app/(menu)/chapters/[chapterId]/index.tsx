import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { chapterData } from "../data/lessons.data";

// Định nghĩa data cho từng chapter

export default function ChapterDetailScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();

  const currentChapter = chapterData[chapterId as keyof typeof chapterData];

  if (!currentChapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Không tìm thấy nội dung cho Chapter {chapterId}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const navigateToLesson = (lessonId: string) => {
    console.log(`📚 Opening Lesson ${lessonId} of Chapter ${chapterId}`);
    router.push(`/(menu)/chapters/${chapterId}/lessons/${lessonId}` as any);
  };

  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => navigateToLesson(item.id)}
    >
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonDescription}>{item.description}</Text>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: item.completed ? "#4CAF50" : "#FF9800" },
        ]}
      >
        <Text style={styles.statusText}>
          {item.completed ? "Hoàn thành" : "Chưa học"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.chapterTitle}>
        Chapter {chapterId}: {currentChapter.title}
      </Text>
      <Text style={styles.chapterSubtitle}>Chọn bài học để bắt đầu</Text>

      <FlatList
        data={currentChapter.lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        style={styles.lessonList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f8ff" },
  chapterTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  chapterSubtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  lessonList: { flex: 1 },
  lessonCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  lessonTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  lessonDescription: { fontSize: 14, color: "#666", marginBottom: 10 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: { color: "white", fontSize: 12, fontWeight: "bold" },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 50 },
  backButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
