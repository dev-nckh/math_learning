import React, { useRef, useState } from "react";
import { Dimensions, Image, PanResponder, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

// Giữ nguyên phần khai báo BG_IMAGES, DOTS, COLORS như cũ
const BG_IMAGES: Record<string, any> = {
  circle: require("../../../assets/images/B2111885/VeHinhTron.jpg"),
  square: require("../../../assets/images/B2111885/VeHinhVuong.jpg"),
  rectangle: require("../../../assets/images/B2111885/VeHinhChuNhat.jpg"),
  triangle: require("../../../assets/images/B2111885/VeHinhTamGiac.jpg"),
};

const DOTS: Record<string, Array<{ x: number; y: number }>> = {
  circle: Array.from({ length: 16 }).map((_, i) => {
    const angle = (2 * Math.PI * i) / 16;
    return {
      x: 0.5 + 0.383 * Math.cos(angle),
      y: 0.4633 + 0.383 * Math.sin(angle),
    };
  }),
  square: [
    { x: 0.21, y: 0.163 },
    { x: 0.79, y: 0.163 },
    { x: 0.79, y: 0.742 },
    { x: 0.21, y: 0.742 },
  ],
  rectangle: [
    { x: 0.145, y: 0.247 },
    { x: 0.859, y: 0.247 },
    { x: 0.859, y: 0.6325 },
    { x: 0.145, y: 0.6325 },
  ],
  triangle: [
    { x: 0.49, y: 0.098 },
    { x: 0.875, y: 0.798 },
    { x: 0.129, y: 0.798 },
  ],
};

const COLORS: Record<string, { dot: string; dotActive: string; line: string }> = {
  circle:   { dot: "#fffde7", dotActive: "#fbc02d", line: "#fbc02d" },
  square:   { dot: "#e3f2fd", dotActive: "#1976d2", line: "#1976d2" },
  rectangle:{ dot: "#fce4ec", dotActive: "#d81b60", line: "#d81b60" },
  triangle: { dot: "#e8f5e9", dotActive: "#388e3c", line: "#388e3c" },
};

// Thêm thứ tự các điểm chuẩn
const CORRECT_ORDERS: Record<string, number[]> = {
  circle: Array.from({ length: 16 }, (_, i) => i),
  square: [0, 1, 2, 3, 0],
  rectangle: [0, 1, 2, 3, 0],
  triangle: [0, 1, 2, 0],
};

export default function TapVe({ type }: { type: string }) {
  const [connected, setConnected] = useState<number[]>([]);
  const dots = DOTS[type] || [];
  const boxWidth = screenWidth *1;
  const boxHeight = boxWidth;
  const color = COLORS[type] || COLORS.circle;

  // Lấy điểm tiếp theo gợi ý
  const nextDotIndex = CORRECT_ORDERS[type]?.find(
    (idx) => !connected.includes(idx)
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const idx = dots.findIndex(
          (dot) =>
            Math.hypot(dot.x * boxWidth - locationX, dot.y * boxHeight - locationY) < 28
        );
        if (idx !== -1 && !connected.includes(idx)) {
          setConnected((prev) => [...prev, idx]);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const idx = dots.findIndex(
          (dot) =>
            Math.hypot(dot.x * boxWidth - locationX, dot.y * boxHeight - locationY) < 28
        );
        if (idx !== -1 && !connected.includes(idx)) {
          setConnected((prev) => [...prev, idx]);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image
        source={BG_IMAGES[type] || BG_IMAGES.circle}
        style={styles.bg}
        resizeMode="contain"
      />
      <Svg width={boxWidth} height={boxHeight} style={StyleSheet.absoluteFill}>
        {/* Đường nối các điểm */}
        {connected.length > 1 && (
          <Path
            d={
              "M" +
              connected
                .map((idx) => `${dots[idx].x * boxWidth},${dots[idx].y * boxHeight}`)
                .join(" L")
            }
            stroke={color.line}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Gợi ý điểm tiếp theo */}
        {nextDotIndex !== undefined && (
          <Circle
            cx={dots[nextDotIndex].x * boxWidth}
            cy={dots[nextDotIndex].y * boxHeight}
            r={15}
            fill="transparent"
            stroke="#FF9800"
            strokeWidth={4}
            strokeDasharray="5,5"
          />
        )}

        {/* Các điểm */}
        {dots.map((dot, idx) => (
          <Circle
            key={idx}
            cx={dot.x * boxWidth}
            cy={dot.y * boxHeight}
            r={10}
            fill={connected.includes(idx) ? color.dotActive : color.dot}
            stroke={color.line}
            strokeWidth={3}
          />
        ))}
      </Svg>
    </View>
  );
}

// Thêm style cho thông báo hoàn thành
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "contain",
  },
  completionContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
  },
  completionText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});