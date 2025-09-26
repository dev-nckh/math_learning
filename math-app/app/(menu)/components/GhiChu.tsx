import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

type GhiChuProps = {
  type: string;
  step?: number;
  style?: object;
};

const NOTE_LISTS: Record<string, string[]> = {
  circle: [
    "Không có cạnh nào cả",
    "Không có góc nào cả",
    "Bạn thường lăn đều trên mặt phẳng do không có gì ngăn cản bạn",
  ],
  square: [
    "Có 4 cạnh bằng nhau",
    "Có 4 góc vuông",
    "Các cạnh đối song song và bằng nhau giúp bạn đứng vững",
  ],
  rectangle: [
    "Có 2 cạnh dài, 2 cạnh ngắn",
    "Có 4 góc vuông",
    "Các cạnh đối song song và bằng nhau"
  ],
  triangle: [
    "Có 3 cạnh và 3 góc",
    "Bạn hình tam giác có các góc nhọn đôi khi vô ý làm bé bị thương, nên đừng cố tình chạm vào nhé!",
  ],
  solid: [
    "Hình có chiều dài, rộng và cao",
    "Không nằm phẳng trên mặt giấy",
    "Ví dụ: khối lập phương, hình cầu"
  ],
};

const NOTE_STEP1: Record<string, string> = {
  circle: "Bạn hình tròn rất thích lăn đều trên măt đất và vui chơi cùng các bạn nhỏ!",
  square: "Bạn hình vuông rất mạnh mẽ bạn đứng một cách rất vững vàn và chắc chắn!",
  rectangle: "Bạn hình chữ nhật thường biến thành cánh cửa chào đón ta khi đi học về đó!",
  triangle: "Bạn hình tam giác thường biến thành mái nhà giúp che mưa che năng cho mỗi gia đình!",
  solid: "Ghi chú step1: Đây là mô tả ngắn cho hình khối.",
};

const NOTE_STEP2: Record<string, string> = {
  circle: "Hãy kể tên các vật bé biết hoặc tìm kiếm các đồ vật có hình Tròn xung quanh bé nào!",
  square: "Hãy kể tên các vật bé biết hoặc tìm kiếm các đồ vật có hình Vuông xung quanh bé nào!",
  rectangle: "Hãy kể tên các vật bé biết hoặc tìm kiếm các đồ vật có hình Tam Giác xung quanh bé nào!",
  triangle: "Hãy kể tên các vật bé biết hoặc tìm kiếm các đồ vật có hình Chữ Nhật xung quanh bé nào!",
  solid: "Ghi chú step2: Hãy tìm các đồ vật có hình khối xung quanh bạn!",
};

const GhiChu: React.FC<GhiChuProps> = ({ type, step = 0, style }) => {
  let content;
  if (step === 2) {
    content = NOTE_STEP2[type] || "Hãy cùng đi tìm đồ vật!";
  } else if (step === 1) {
    content = NOTE_STEP1[type] || "Ghi chú step1: Mô tả ngắn.";
  } else {
    const notes = NOTE_LISTS[type] || ["Hãy chọn một loại hình để xem thông tin."];
    content = notes.map(line => `• ${line}`).join("\n");
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/B2111885/takenote.jpg")}
      style={[styles.background, style]}
      imageStyle={styles.image}
      resizeMode="contain"
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    width: "80%",
    height: "100%",
  },
  text: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 8,
    padding: 8,
    width: "100%",
    textAlignVertical: "center",
    lineHeight: 24,
  },
});

export default GhiChu;
