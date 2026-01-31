import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

const imgMap: Record<string, any[]> = {
  circle: [
    require("../../../assets/images/B2111885/QuaBong2.png"),
    require("../../../assets/images/B2111885/BanhXe.png"),
    require("../../../assets/images/B2111885/MatTrang.png"),
  ],
  square: [
    require("../../../assets/images/B2111885/HopQua.png"),
    require("../../../assets/images/B2111885/KhanTay.jpg"),
    require("../../../assets/images/B2111885/VoOLy.png"),
  ],
  triangle: [
    require("../../../assets/images/B2111885/MaiNha.jpg"),
    require("../../../assets/images/B2111885/Pizza.png"),
    require("../../../assets/images/B2111885/CoHoi.jpg"),
  ],
  rectangle: [
    require("../../../assets/images/B2111885/CanhCua.png"),
    require("../../../assets/images/B2111885/QuyenSach.png"),
    require("../../../assets/images/B2111885/BangDen.png"),
  ],
};

const nameMap: Record<string, string[]> = {
  circle: ["Quả bóng", "Bánh xe", "Mặt trăng"],
  square: ["Hộp quà", "Khăn tay", "Vở ô ly"],
  triangle: ["Mái nhà", "Pizza", "Cờ hội"],
  rectangle: ["Cánh cửa", "Quyển sách", "Bảng đen"],
};

type Props = {
  type: string;
  visible: boolean;
  onHidden?: () => void;
};

export default function ViDuHinhHoc({ type, visible, onHidden }: Props) {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Hiệu ứng xuất hiện và biến mất
  useEffect(() => {
    if (visible) {
      anims.forEach(anim => anim.setValue(0));
      Animated.stagger(
        270,
        anims.map(anim =>
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 750,
              useNativeDriver: true,
            }),
          ])
        )
      ).start();
    } else {
      Animated.stagger(
        0,
        anims.map(anim =>
          Animated.timing(anim, {
            toValue: -1,
            duration: 900, // chậm hơn 3 lần
            useNativeDriver: true,
          })
        )
      ).start(({ finished }) => {
        if (finished && onHidden) onHidden();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, type]);

  const imgs = imgMap[type] || [];
  const names = nameMap[type] || [];

  return (
    <View style={styles.row}>
      {imgs.map((img, idx) => (
        <View key={idx} style={{ alignItems: "center" }}>
          <Animated.View
            style={{
              marginHorizontal: 10,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: "#fff",
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
              opacity: anims[idx].interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 1],
              }),
              transform: [
                {
                  translateY: anims[idx].interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [80, -80, 0],
                  }),
                },
                {
                  scale: anims[idx].interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0.3, 0.7, 1.15],
                  }),
                },
              ],
            }}
          >
            <Image source={img} style={styles.img} resizeMode="cover" />
          </Animated.View>
          {/* Hiệu ứng cho tên ví dụ */}
          <Animated.View
            style={{
              opacity: anims[idx].interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 1],
              }),
              transform: [
                {
                  translateY: anims[idx].interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [40, -40, 0],
                  }),
                },
                {
                  scale: anims[idx].interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0.7, 0.85, 1],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.imgLabel}>{names[idx] || ""}</Text>
          </Animated.View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end" },
  img: { width: 90, height: 90, borderRadius: 18 },
  imgLabel: {
    marginTop: 6,
    fontSize: 15,
    color: "#fff", // Đổi thành màu trắng
    fontWeight: "600",
    textAlign: "center",
    width: 90,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});