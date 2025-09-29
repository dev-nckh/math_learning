import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/backButton";
const images = [
  {
    source: require("../../../assets/images/B2111885/0.png"),
    audio: require("../../../assets/audios/B2111885/0.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/1.png"),
    audio: require("../../../assets/audios/B2111885/1.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/2.png"),
    audio: require("../../../assets/audios/B2111885/2.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/3.png"),
    audio: require("../../../assets/audios/B2111885/3.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/4.png"),
    audio: require("../../../assets/audios/B2111885/4.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/5.png"),
    audio: require("../../../assets/audios/B2111885/5.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/6.png"),
    audio: require("../../../assets/audios/B2111885/6.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/7.png"),
    audio: require("../../../assets/audios/B2111885/7.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/8.png"),
    audio: require("../../../assets/audios/B2111885/8.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/9.png"),
    audio: require("../../../assets/audios/B2111885/9.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/10.png"),
    audio: require("../../../assets/audios/B2111885/10.mp3"),
  },
  {
    source: require("../../../assets/images/B2111885/0_10.png"),
    audio: require("../../../assets/audios/B2111885/0_10.mp3"),
  },
];
const DemSo = () => {
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch((error) => {
          console.error("Error unloading sound:", error);
        });
      }
    };
  }, [sound]);

  const playSound = async (index: number) => {
    try {
      // delete the previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Create a new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        images[index].audio
      );
      setSound(newSound);

      // The loudness of sound
      await newSound.setVolumeAsync(1.0);

      // The speed of sound
      await newSound.setRateAsync(0.75, true);

      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return (
        <ImageBackground
          source={require("../../../assets/images/B2111885/background2.png")}
          style={styles.background}
        >
          <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ alignItems: "flex-start", backgroundColor: "black",borderRadius: 50, paddingVertical:5, paddingHorizontal:5,marginRight:10 }}>
                    <BackButton/>
                </View>
                <Text style={styles.title}>Đếm số 0-10</Text>
            </View>
            <View style={styles.subheader}>
              <Text style={styles.subtitle}>
                Nhấn vào hình để nghe phát âm của từng số nhé, Meow!
              </Text>
              <Image
                source={require("../../../assets/images/B2111885/Ami2.gif")}
                style={styles.gif}
                resizeMode="contain"
              />
            </View>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.grid}>
                {images.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.cell}
                    onPress={() => playSound(index)}
                  >
                    <Image source={item.source} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: "10%",
    marginBottom: "3%",
  },
  subheader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "3%",
    borderWidth: 4,
    borderColor: "black",
    borderStyle: "solid",
    borderRadius: 35,
    backgroundColor: "white",
  },
  back: {
    width: 50,
    height: 50,
    flex: 0.7,
    alignItems: "center",
  },
  title: {
    flex: 1,
    width: "80%",
    fontSize: 20,
    fontWeight: "bold",
    color: "#363636",
    textAlign: "center",
    backgroundColor: "#FFCC99",
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F4A460",
    borderStyle: "solid",
    marginEnd: 50,
  },
  gif: {
    width: 150,
    height: 150,
  },
  subtitle: {
    flex: 1,
    width: "100%",
    fontSize: 17,
    fontWeight: "bold",
    color: "#363636",
    textAlign: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F4A460",
    borderStyle: "solid",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    marginStart: "3%",
  },
  scrollContainer: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cell: {
    width: "45%",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 4,
    borderColor: "black",
    borderStyle: "dashed",
    borderRadius: 35,
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: 165,
    resizeMode: "contain",
    borderRadius: 35,
  },
});

export default DemSo;
