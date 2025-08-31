import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

type IoniconName = "add-circle" | "remove-circle";

const mathLessons: {
  id: string;
  title: string;
  description: string;
  icon: IoniconName;
  color: string;
  route: string;
}[] = [
  {
    id: "learn_add",
    title: "Học phép cộng",
    description: "Cùng học cách cộng hai số với nhau",
    icon: "add-circle",
    color: "#FF7043",
    route: "./Addition/AddTheoryScene",
  },
  {
    id: "learn_subtract",
    title: "Học phép trừ",
    description: "Khám phá phép trừ cùng bạn Cú",
    icon: "remove-circle",
    color: "#4DB6AC",
    route: "./Subtraction/SubtractionTheoryScene",
  },
];
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

  const navigateToPath = (path: string) => {
    router.replace(path as any); // Cast to 'any' to bypass type error
  };
  const navigateToHome = () => {
    router.replace("/"); // Điều hướng về trang chủ
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />

      <Animated.View
        style={[
          styles.titleContainer,
          { transform: [{ translateY: titlePosition }] },
        ]}
      >
        <Text style={styles.title}>Chapter 4</Text>
        <Text style={styles.subtitle}>Chọn phần để bắt đầu học</Text>
      </Animated.View>

      <View style={styles.buttonsContainer}>
        {mathLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={[styles.lessonButton, { backgroundColor: lesson.color }]}
            onPress={() => navigateToPath(lesson.route)}
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Icon name={lesson.icon} size={60} color="white" />
            <View style={styles.textContainer}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Icon Home ở góc phải */}
      <TouchableOpacity
        onPress={navigateToHome}
        style={styles.homeIconContainer}
        activeOpacity={0.7}
      >
        <Icon name="home" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 Math Learning App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667EEA",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 12,
  },
  button: {
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  homeIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  footer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  lessonButton: {
    width: width * 0.85,
    height: 150,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Coiny-Regular",
  },
  lessonDescription: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginTop: 8,
  },
});

export default MenuLayout;
