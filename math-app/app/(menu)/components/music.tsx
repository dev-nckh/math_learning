import React, { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

type MusicProps = {
  list?: "gameHinh1" | "gameHinh2";
  onReady?: (api: {
    toggleMusic: () => Promise<void>;
    stopMusic: () => Promise<void>;
    getIsPlaying: () => boolean;
    restartMusic: () => Promise<void>;
  }) => void;
};

export default function Music({ list = "gameHinh1", onReady }: MusicProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isMountedRef = useRef(true);

  // Danh sách nhạc theo list
  const tracks: Record<string, any[]> = {
    gameHinh1: [
      require("../../../assets/audios/B2111885/backgroundGame1.mp3"),
      require("../../../assets/audios/B2111885/backgroundGame1_2.mp3"),
    ],
    gameHinh2: [
      require("../../../assets/audios/B2111885/backgroundGame2.mp3"),
      require("../../../assets/audios/B2111885/backgroundGame2_2.mp3"),
    ],
  };

  // Hàm phát nhạc ngẫu nhiên
  const playRandomTrack = async () => {
    try {
      if (!tracks[list] || !isMountedRef.current) return;

      const randomIndex = Math.floor(Math.random() * tracks[list].length);

      // Dừng và unload nhạc cũ nếu có
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Tạo nhạc mới
      const { sound } = await Audio.Sound.createAsync(tracks[list][randomIndex], {
        shouldPlay: true,
        isLooping: true,
      });

      soundRef.current = sound;
      
      if (isMountedRef.current) {
        setIsPlaying(true);
      }
      
      // Thiết lập sự kiện khi phát xong (phòng trường hợp)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Nếu nhạc kết thúc (dù đã loop), phát lại bài mới
          playRandomTrack();
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("Lỗi phát nhạc:", error);
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    }
  };

  // Bật/tắt nhạc
  const toggleMusic = async () => {
    try {
      if (!soundRef.current) {
        // Nếu không có nhạc đang phát, bắt đầu phát
        await playRandomTrack();
        return;
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
        if (isMountedRef.current) {
          setIsPlaying(false);
        }
      } else {
        await soundRef.current.playAsync();
        if (isMountedRef.current) {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Lỗi toggle nhạc:", error);
    }
  };

  // Dừng nhạc hoàn toàn (dùng khi game over)
  const stopMusic = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Lỗi dừng nhạc:", error);
    }
  };

  // Khởi động lại nhạc (dùng khi chơi lại)
  const restartMusic = async () => {
    try {
      await stopMusic(); // Dừng hoàn toàn trước
      await new Promise(resolve => setTimeout(resolve, 100)); // Đợi một chút
      await playRandomTrack(); // Phát lại từ đầu
    } catch (error) {
      console.error("Lỗi khởi động lại nhạc:", error);
    }
  };

  // Khi component mount, phát nhạc
  useEffect(() => {
    isMountedRef.current = true;
    
    // Khởi tạo Audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    playRandomTrack();

    // Trả API cho component cha
    if (onReady && isMountedRef.current) {
      onReady({ 
        toggleMusic, 
        stopMusic, 
        getIsPlaying: () => isPlaying,
        restartMusic 
      });
    }

    // Cleanup khi unmount
    return () => {
      isMountedRef.current = false;
      stopMusic();
    };
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={toggleMusic}>
        <Image
          source={
            isPlaying
              ? require("../../../assets/icons/music_on.png")
              : require("../../../assets/icons/music_off.png")
          }
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
});