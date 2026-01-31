import { Audio } from "expo-av";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type BaiGiangHinhHocProps = {
  type: string;
  step: number;
};

export type BaiGiangHinhHocHandle = {
  playCurrentAudio: () => void;
  stopAudio: () => void;
};

const audioMap: Record<string, Record<number, any>> = {
  circle: {
    0: require("../../../assets/audios/B2111885/HinhTronStep0.mp3"),
    1: require("../../../assets/audios/B2111885/HinhTronStep1.mp3"),
    2: require("../../../assets/audios/B2111885/HinhTronStep2.mp3"),
    3: require("../../../assets/audios/B2111885/HinhTronStep3.mp3"),
  },
  square: {
    0: require("../../../assets/audios/B2111885/HinhVuongStep0.mp3"),
    1: require("../../../assets/audios/B2111885/HinhVuongStep1.mp3"),
    2: require("../../../assets/audios/B2111885/HinhVuongStep2.mp3"),
    3: require("../../../assets/audios/B2111885/HinhVuongStep3.mp3"),
  },
  triangle: {
    0: require("../../../assets/audios/B2111885/TamGiacStep0.mp3"),
    1: require("../../../assets/audios/B2111885/TamGiacStep1.mp3"),
    2: require("../../../assets/audios/B2111885/TamGiacStep2.mp3"),
    3: require("../../../assets/audios/B2111885/TamGiacStep3.mp3"),
  },
  rectangle: {
    0: require("../../../assets/audios/B2111885/ChuNhatStep0.mp3"),
    1: require("../../../assets/audios/B2111885/ChuNhatStep1.mp3"),
    2: require("../../../assets/audios/B2111885/ChuNhatStep2.mp3"),
    3: require("../../../assets/audios/B2111885/ChuNhatStep3.mp3"),
  },
};

const BaiGiangHinhHoc = forwardRef<BaiGiangHinhHocHandle, BaiGiangHinhHocProps>(({ type, step }, ref) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Hàm phát audio cho step hiện tại
  const playCurrentAudio = async () => {
    // Tắt audio cũ nếu có
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const audioSource = audioMap[type]?.[step];
    if (audioSource) {
      const { sound } = await Audio.Sound.createAsync(audioSource);
      soundRef.current = sound;
      await sound.playAsync();
    }
  };

  // Hàm tắt audio hiện tại
  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  // Expose playCurrentAudio và stopAudio ra ngoài qua ref
  useImperativeHandle(ref, () => ({
    playCurrentAudio,
    stopAudio,
  }));

  // Tự động phát audio khi type hoặc step thay đổi
  useEffect(() => {
    playCurrentAudio();
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, step]);

  return null;
});

export default BaiGiangHinhHoc;