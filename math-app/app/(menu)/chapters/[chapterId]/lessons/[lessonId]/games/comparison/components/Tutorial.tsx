import { View, Text, StyleSheet } from "react-native";

export default function Tutorial() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Học dấu so sánh</Text>

      <Text style={styles.text}>
        👉 Nếu số đứng trước lớn hơn số đứng sau → dùng dấu {'">'}
      </Text>
      <Text style={styles.example}>Ví dụ: 3 {">"} 2</Text>

      <Text style={styles.text}>
        👉 Nếu số đứng trước bé hơn số đứng sau → dùng dấu {"<"}
      </Text>
      <Text style={styles.example}>Ví dụ: 2 {"<"} 5</Text>

      <Text style={styles.text}>👉 Nếu hai số bằng nhau → dùng dấu "="</Text>
      <Text style={styles.example}>Ví dụ: 4 = 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  text: { fontSize: 16, marginVertical: 5 },
  example: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#2c3e50",
  },
});
