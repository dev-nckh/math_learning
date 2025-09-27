import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  View,
  StyleSheet,
  StatusBar,
  Text,
  GestureResponderEvent,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Matter from "matter-js";
import { GameEngine } from "react-native-game-engine";
import Ball from "../components/entities/Ball";
import Wall from "../components/entities/Wall";
import Physics from "../systems/Physics";
import { createBall } from "../physics/BallPhysics";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const GAME_WIDTH = SCREEN_WIDTH * 0.9;
const GAME_HEIGHT = SCREEN_HEIGHT * 0.7;
interface BallMergeScreenProps {
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
export default function BallMergeScreen({
  chapterId,
  lessonId,
  gameId,
  gameData,
}: BallMergeScreenProps) {
  const engine = useRef(Matter.Engine.create()).current;
  const world = engine.world;
  const entities = useRef<any>({
    physics: { engine, world },
  });

  const [renderKey, setRenderKey] = useState(0);
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [nextBall, setNextBall] = useState<{
    color: string;
    number: number;
    size: number;
  } | null>(null);
  const [previewX, setPreviewX] = useState(GAME_WIDTH / 2);

  const [isGameWon, setIsGameWon] = useState(false); // Trạng thái chiến thắng
  const [score, setScore] = useState(0); // Điểm số

  const pendingMerge = useRef<{ ballA: any; ballB: any } | null>(null);

  const FRUIT_RULES = {
    apple: {
      nextFruit: "banana",
      size: 1,
      rarity: 50, // Độ hiếm thấp (xuất hiện nhiều)
      image: Image.resolveAssetSource(
        require("../../../../../../../../../../assets/images/ToanVo/images/apple.png")
      ),
    },
    banana: {
      nextFruit: "grape",
      size: 2,
      rarity: 30, // Độ hiếm trung bình
      image: Image.resolveAssetSource(
        require("../../../../../../../../../../assets/images/ToanVo/images/banana.png")
      ),
    },
    grape: {
      nextFruit: "orange",
      size: 3,
      rarity: 15, // Độ hiếm cao
      image: Image.resolveAssetSource(
        require("../../../../../../../../../../assets/images/ToanVo/images/grape.png")
      ),
    },
    orange: {
      nextFruit: "watermelon",
      size: 4,
      rarity: 5, // Độ hiếm rất cao
      image: Image.resolveAssetSource(
        require("../../../../../../../../../../assets/images/ToanVo/images/orange.png")
      ),
    },
    watermelon: {
      nextFruit: null,
      size: 5,
      rarity: 0, // Không xuất hiện
      image: Image.resolveAssetSource(
        require("../../../../../../../../../../assets/images/ToanVo/images/watermelon.png")
      ),
    },
  };

  const getRandomFruit = () => {
    const fruits = Object.keys(FRUIT_RULES).filter(
      (fruit) => FRUIT_RULES[fruit as keyof typeof FRUIT_RULES].rarity > 0
    );

    const weightedFruits: string[] = [];
    fruits.forEach((fruit) => {
      const rarity = FRUIT_RULES[fruit as keyof typeof FRUIT_RULES].rarity;
      for (let i = 0; i < rarity; i++) {
        weightedFruits.push(fruit);
      }
    });

    const randomIndex = Math.floor(Math.random() * weightedFruits.length);
    return weightedFruits[randomIndex];
  };

  const generatePreviewBall = () => {
    const randomFruit = getRandomFruit(); // Chọn loại bóng dựa trên độ hiếm
    const size = FRUIT_RULES[randomFruit as keyof typeof FRUIT_RULES].size;

    setNextBall({
      color: randomFruit, // Sử dụng tên trái cây thay vì màu sắc
      number: Math.floor(Math.random() * 10) + 1,
      size,
    });
    setPreviewX(GAME_WIDTH / 2);
  };

  const generateQuiz = (a: number, b: number) => {
    const question = `${a} + ${b} = ?`;
    const answer = a + b;

    setQuizQuestion(question);
    setCorrectAnswer(answer);
    setQuizVisible(true);
    setIsRunning(false);
  };

  useEffect(() => {
    const ground = Matter.Bodies.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 10,
      GAME_WIDTH,
      20,
      { isStatic: true }
    );

    const leftWall = Matter.Bodies.rectangle(
      -20,
      GAME_HEIGHT / 2,
      40,
      GAME_HEIGHT,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      GAME_WIDTH + 20,
      GAME_HEIGHT / 2,
      40,
      GAME_HEIGHT,
      { isStatic: true }
    );
    const topWall = Matter.Bodies.rectangle(
      GAME_WIDTH / 2,
      -20,
      GAME_WIDTH,
      20,
      { isStatic: true }
    );

    Matter.World.add(world, [ground, leftWall, rightWall, topWall]);

    entities.current["ground"] = { body: ground, renderer: Wall };
    entities.current["leftWall"] = { body: leftWall, renderer: Wall };
    entities.current["rightWall"] = { body: rightWall, renderer: Wall };
    entities.current["topWall"] = { body: topWall, renderer: Wall };
    entities.current["quizManager"] = {
      showQuiz: (
        question: string,
        correctAnswer: number,
        ballA: any,
        ballB: any
      ) => {
        pendingMerge.current = { ballA, ballB };
        setQuizQuestion(question);
        setCorrectAnswer(correctAnswer);
        setQuizVisible(true);
        setIsRunning(false);
        generatePreviewBall();
      },
    };

    generatePreviewBall();
    engine.timing.timeScale = 0.8; // Giảm tốc độ cập nhật vật lý (80% tốc độ gốc)
  }, []);

  // Hàm tính bán kính dựa trên size
  const getRadiusFromSize = (size: number) => size * 10; // Mỗi size tăng bán kính thêm 10

  const handlePress = (event: { locationX: number }) => {
    if (quizVisible || !nextBall) return;

    const clampedX = Math.max(40, Math.min(previewX, GAME_WIDTH - 40));
    const id = `ball-${Date.now()}`;
    const radius = getRadiusFromSize(nextBall.size); // Tính bán kính từ size
    const newBall = createBall(
      world,
      clampedX,
      50,
      radius,
      id,
      nextBall.color,
      nextBall.number
    );

    entities.current[id] = {
      ...newBall,
      size: nextBall.size, // Thêm thuộc tính size
      renderer: Ball, // Đảm bảo `renderer` được chỉ định đúng
    };

    generatePreviewBall();
    setRenderKey((prev) => prev + 1);
  };

  const onAnswerSubmit = (correct: boolean) => {
    if (correct && pendingMerge.current) {
      const { ballA, ballB } = pendingMerge.current;

      if (
        ballA.color === ballB.color &&
        ballA.size !== undefined &&
        ballB.size !== undefined &&
        ballA.size === ballB.size
      ) {
        const newSize = ballA.size + 1;
        const newFruit =
          FRUIT_RULES[ballA.color as keyof typeof FRUIT_RULES].nextFruit;

        if (newFruit) {
          const newX = (ballA.body.position.x + ballB.body.position.x) / 2;
          const newY = (ballA.body.position.y + ballB.body.position.y) / 2;
          const newId = `ball-${Date.now()}`;
          const newRadius = getRadiusFromSize(newSize);

          const newBody = Matter.Bodies.circle(newX, newY, newRadius, {
            restitution: 0.1,
            friction: 0.5,
            frictionAir: 0.05,
            density: 0.001,
            inertia: Infinity,
            label: newId,
          });

          Matter.World.add(world, [newBody]);
          Matter.World.remove(world, [ballA.body, ballB.body]);
          delete entities.current[ballA.body.label];
          delete entities.current[ballB.body.label];

          entities.current[newId] = {
            body: newBody,
            radius: newRadius,
            color: newFruit, // Cập nhật loại trái cây mới
            size: newSize,
            number: ballA.number + ballB.number,
            renderer: Ball,
          };

          pendingMerge.current = null;
          setQuizVisible(false);
          setUserAnswer("");
          setIsRunning(true);
          setRenderKey((prev) => prev + 1);
          setScore((prevScore) => prevScore + ballA.number + ballB.number);
        } else {
          setIsGameWon(true);
          setIsRunning(false);
        }
      } else {
        const a = pendingMerge.current.ballA.number;
        const b = pendingMerge.current.ballB.number;
        generateQuiz(a, b);
      }
    } else {
      console.log("Câu trả lời sai, vui lòng thử lại.");
    }
  };

  const resetGame = () => {
    // Xóa tất cả các thực thể cũ khỏi Matter.World
    Object.keys(entities.current).forEach((key) => {
      if (key.startsWith("ball-")) {
        const entity = entities.current[key];
        if (entity.body) {
          Matter.World.remove(world, entity.body);
        }
        delete entities.current[key];
      }
    });

    // Reset trạng thái trò chơi
    setIsGameWon(false);
    setScore(0);
    setUserAnswer("");
    setQuizVisible(false);
    setNextBall(null);
    setRenderKey((prev) => prev + 1); // Reset GameEngine
    generatePreviewBall();
    setIsRunning(true);
  };

  const NumberPad = ({ onPress }: { onPress: (key: string) => void }) => {
    const keys = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["⌫", "0", "Gửi"],
    ];

    return (
      <View style={{ marginTop: 20 }}>
        {keys.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginVertical: 5,
            }}
          >
            {row.map((key) => (
              <View
                key={key}
                style={{
                  backgroundColor: "#eee",
                  padding: 15,
                  margin: 5,
                  borderRadius: 10,
                  width: 65,
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                }}
                onTouchEnd={() => onPress(key)}
              >
                <Text style={{ fontSize: 20 }}>{key}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../../../../../../../../../../assets/images/ToanVo/images/bg1.jpg")} // Đường dẫn đến ảnh nền
      style={styles.background}
    >
      <View style={styles.container}>
        {/* 👇 Hiển thị điểm số */}
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>Điểm: {score}</Text>
        </View>

        {/* 👇 Preview Ball */}
        {nextBall && (
          <View
            style={{
              position: "absolute",
              top: 40,
              left: previewX - getRadiusFromSize(nextBall.size),
              width: getRadiusFromSize(nextBall.size) * 2,
              height: getRadiusFromSize(nextBall.size) * 2,
              borderRadius: getRadiusFromSize(nextBall.size),
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              borderWidth: 2,
              borderColor: "#fff",
              overflow: "hidden", // Đảm bảo hình ảnh không bị tràn ra ngoài
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={
                  FRUIT_RULES[nextBall.color as keyof typeof FRUIT_RULES].image
                }
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            </View>
            <Text
              style={{
                position: "absolute",
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {nextBall.number}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("../../chapter4")} // Điều hướng về trang chapter4
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        {/* 👇 Game Area */}
        <View
          style={styles.gameTouchArea}
          onTouchMove={(e) => {
            const x = e.nativeEvent.locationX;
            setPreviewX(Math.max(40, Math.min(x, GAME_WIDTH - 40)));
          }}
          onTouchEnd={(e) => handlePress(e.nativeEvent)}
        >
          <GameEngine
            style={styles.gameArea}
            systems={[Physics]}
            entities={entities.current}
            running={isRunning}
            key={renderKey}
          >
            <StatusBar hidden />
          </GameEngine>
        </View>

        {/* 👇 Quiz Popup */}
        {quizVisible && (
          <View style={styles.quizBox}>
            <Text style={styles.quizText}>{quizQuestion}</Text>

            <Text style={styles.quizInput}>{userAnswer}</Text>

            <NumberPad
              onPress={(key) => {
                if (key === "⌫") {
                  setUserAnswer((prev) => prev.slice(0, -1));
                } else if (key === "Gửi") {
                  const userAnsNum = parseInt(userAnswer, 10);
                  const correct = userAnsNum === correctAnswer;
                  onAnswerSubmit(correct);
                } else {
                  setUserAnswer((prev) => prev + key);
                }
              }}
            />
          </View>
        )}

        {/* 👇 Win Message */}
        {isGameWon && (
          <View style={styles.winBox}>
            <Text style={styles.winText}>
              🎉 Chúc mừng! Bạn đã chiến thắng! 🎉
            </Text>
            <Text style={styles.scoreText}>Điểm số: {score}</Text>
            <View style={styles.resetButton} onTouchEnd={() => resetGame()}>
              <Text style={styles.resetButtonText}>Chơi lại</Text>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Đảm bảo ảnh nền bao phủ toàn bộ màn hình
  },
  container: {
    flex: 1,
    backgroundColor: "transparent", // Đảm bảo nền trong suốt để hiển thị ảnh nền
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  scoreBox: {
    position: "absolute",
    top: 0,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền mờ để dễ nhìn
    padding: 10,
    borderRadius: 5,
  },
  scoreText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameTouchArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  gameArea: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  quizBox: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 10,
  },
  quizText: {
    fontSize: 25,
    marginBottom: 10,
    textAlign: "center",
  },
  quizInput: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 24,
    textAlign: "center",
    marginVertical: 10,
  },
  winBox: {
    position: "absolute",
    top: "40%",
    left: "10%",
    right: "10%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 10,
    alignItems: "center",
  },
  winText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
