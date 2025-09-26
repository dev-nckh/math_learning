import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  PanResponder,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system/legacy';
import ViewShot from 'react-native-view-shot';

import ToanHinh_HinhNen from '../components/ToanHinh_HinhNen';
import ToanHinh_NhanDan from '../components/ToanHinh_NhanDan';

const { width } = Dimensions.get('window');

type ShapeType = 'circle' | 'square' | 'triangle' | 'rectangle';

type ShapeData = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
};

type StickerData = {
  id: string;
  img: any;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

const TOOLBOX_SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'rectangle'];
const SHAPE_SIZE = 56;
const RECT_WIDTH = 90;
const RECT_HEIGHT = SHAPE_SIZE;
const TOOLBOX_SIZE = 44;
const TOOLBOX_RECT_WIDTH = 70;
const TOOLBOX_RECT_HEIGHT = TOOLBOX_SIZE;
const STICKER_SIZE = 48;

// Danh sách màu sắc cho bảng màu
const COLOR_PALETTE = [
  '#FF6F61', '#FFB347', '#FFF275', '#B5EAD7', '#A7C7E7',
  '#7EC8E3', '#C3AED6', '#FFFFFF', '#222222', '#E5E4E2',
  '#F67280', '#355C7D', '#6C5B7D', '#C06C84', '#F8B195',
  '#99B898', '#FECEAB', '#FF847C',
];

// Màu mặc định cho các hình
const DEFAULT_COLORS: Record<ShapeType, string> = {
  circle: '#FF6F61',
  square: '#FFB347',
  triangle: '#B5EAD7',
  rectangle: '#A7C7E7',
};
//kích thước hình trong toolbox
const getShapeStyle = (
  type: ShapeType,
  size = SHAPE_SIZE,
  rectW = RECT_WIDTH,
  rectH = RECT_HEIGHT,
  color?: string
) => {
  switch (type) {
    case 'circle':
      return {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color || DEFAULT_COLORS.circle,
      };
    case 'square':
      return {
        width: size,
        height: size,
        backgroundColor: color || DEFAULT_COLORS.square,
      };
    case 'triangle': {
      const side = size;
      const base = side;
      const height = side * Math.sqrt(3) / 2;
      return {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderLeftWidth: base / 2,
        borderRightWidth: base / 2,
        borderBottomWidth: height,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color || DEFAULT_COLORS.triangle,
      };
    }
    case 'rectangle':
      return {
        width: rectW,
        height: rectH,
        backgroundColor: color || DEFAULT_COLORS.rectangle,
      };
    default:
      return {};
  }
};

const DraggableShape = ({
  shape,
  onDrop,
  trashLayout,
  colorMode,
  selectedColor,
  onChangeColor,
  deleteMode,
  onDeleteShape,
  adjustShapeId,
  setAdjustShapeId,
  setHideUI,
}: {
  shape: ShapeData;
  onDrop: (shape: ShapeData, isDelete: boolean) => void;
  trashLayout: { x: number; y: number; width: number; height: number } | null;
  colorMode: boolean;
  selectedColor: string;
  onChangeColor: (id: string) => void;
  deleteMode: boolean;
  onDeleteShape: (id: string) => void;
  adjustShapeId: string | null;
  setAdjustShapeId: (id: string | null) => void;
  setHideUI: (hide: boolean) => void;
}) => {
  const translateX = useSharedValue(shape.x);
  const translateY = useSharedValue(shape.y);
  const scale = useSharedValue(shape.scale);
  const rotation = useSharedValue(shape.rotation);
  const [sliderValue, setSliderValue] = useState(shape.scale);
  const [rotationDeg, setRotationDeg] = useState(shape.rotation);

  useEffect(() => {
    scale.value = sliderValue;
  }, [sliderValue]);

  useEffect(() => {
    rotation.value = rotationDeg;
  }, [rotationDeg]);

  // Pan gesture handler cho kéo/thả hình
  const panRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      startX.current = translateX.value;
      startY.current = translateY.value;
    }
    if (event.nativeEvent.state === State.ACTIVE) {
      translateX.value = startX.current + event.nativeEvent.translationX;
      translateY.value = startY.current + event.nativeEvent.translationY;
    }
    if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      runOnJS(onDrop)({
        ...shape,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
        color: shape.color,
      }, false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  if (deleteMode) {
    return (
      <TapGestureHandler
        onHandlerStateChange={event => {
          if (event.nativeEvent.state === State.END) {
            onDeleteShape(shape.id);
          }
        }}
      >
        <Animated.View style={animatedStyle}>
          <Animated.View style={[
            getShapeStyle(
              shape.type,
              SHAPE_SIZE,
              RECT_WIDTH,
              RECT_HEIGHT,
              shape.color
            ),
            { opacity: 0.5 }
          ]} />
        </Animated.View>
      </TapGestureHandler>
    );
  }

  return (
    <>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
        enabled={!colorMode}
      >
        <Animated.View style={animatedStyle}>
          <TapGestureHandler
            onHandlerStateChange={event => {
              if (event.nativeEvent.state === State.END) {
                if (colorMode) {
                  onChangeColor(shape.id);
                  setAdjustShapeId(null);
                  setHideUI(false);
                } else {
                  if (adjustShapeId === shape.id) {
                    setAdjustShapeId(null);
                    setHideUI(false);
                  } else {
                    setAdjustShapeId(shape.id);
                    setHideUI(true);
                  }
                }
              }
            }}
            numberOfTaps={1}
          >
            <Animated.View>
              <Animated.View style={getShapeStyle(
                shape.type,
                SHAPE_SIZE,
                RECT_WIDTH,
                RECT_HEIGHT,
                shape.color
              )} />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      {/* Thanh điều chỉnh kích thước và xoay */}
      {adjustShapeId === shape.id && (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          height: 70,
          zIndex: 301,
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
            <TouchableOpacity
              style={{ marginHorizontal: 12 }}
              onPress={() => setRotationDeg(prev => prev - (Math.PI / 12))}
            >
              <MaterialIcons name="rotate-left" size={28} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 12 }}
              onPress={() => setRotationDeg(prev => prev + (Math.PI / 12))}
            >
              <MaterialIcons name="rotate-right" size={28} color="#888" />
            </TouchableOpacity>
          </View>
          <Slider
            minimumValue={1}
            maximumValue={2}
            value={sliderValue}
            onValueChange={val => {
              setSliderValue(val);
              runOnJS(onDrop)({
                ...shape,
                x: translateX.value,
                y: translateY.value,
                scale: val,
                rotation: rotationDeg,
                color: shape.color,
              }, false);
            }}
            minimumTrackTintColor="#ff9800"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#ff9800"
            style={{ width: width - 48 }}
          />
        </View>
      )}
    </>
  );
};

// --- DraggableSticker ---
const DraggableSticker = ({
  sticker,
  deleteMode,
  onDeleteSticker,
  onDrop,
  adjustStickerId,
  setAdjustStickerId,
  setHideUI,
}: {
  sticker: StickerData;
  deleteMode: boolean;
  onDeleteSticker: (id: string) => void;
  onDrop: (sticker: StickerData) => void;
  adjustStickerId: string | null;
  setAdjustStickerId: (id: string | null) => void;
  setHideUI: (hide: boolean) => void;
}) => {
  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const [sliderValue, setSliderValue] = useState(sticker.scale);
  const [rotationDeg, setRotationDeg] = useState(sticker.rotation);

  useEffect(() => {
    scale.value = sliderValue;
  }, [sliderValue]);

  useEffect(() => {
    rotation.value = rotationDeg;
  }, [rotationDeg]);

  const startX = useRef(0);
  const startY = useRef(0);

  // Pan gesture handler cho kéo/thả sticker
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      startX.current = translateX.value;
      startY.current = translateY.value;
    }
    if (event.nativeEvent.state === State.ACTIVE) {
      translateX.value = startX.current + event.nativeEvent.translationX;
      translateY.value = startY.current + event.nativeEvent.translationY;
    }
    if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      runOnJS(onDrop)({
        ...sticker,
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  if (deleteMode) {
    return (
      <TapGestureHandler
        onHandlerStateChange={event => {
          if (event.nativeEvent.state === State.END) {
            onDeleteSticker(sticker.id);
          }
        }}
      >
        <Animated.View style={animatedStyle}>
          <Image
            source={sticker.img}
            style={{ width: STICKER_SIZE, height: STICKER_SIZE, opacity: 0.5 }}
            resizeMode="contain"
          />
        </Animated.View>
      </TapGestureHandler>
    );
  }

  return (
    <>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        <Animated.View style={animatedStyle}>
          <TapGestureHandler
            onHandlerStateChange={event => {
              if (event.nativeEvent.state === State.END) {
                if (adjustStickerId === sticker.id) {
                  setAdjustStickerId(null);
                  setHideUI(false);
                } else {
                  setAdjustStickerId(sticker.id);
                  setHideUI(true);
                }
              }
            }}
            numberOfTaps={1}
          >
            <Animated.View>
              <Image source={sticker.img} style={{ width: STICKER_SIZE, height: STICKER_SIZE }} resizeMode="contain" />
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      {/* Thanh điều chỉnh kích thước và xoay cho nhãn dán */}
      {adjustStickerId === sticker.id && (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          height: 70,
          zIndex: 301,
          backgroundColor: '#fff',
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
            <TouchableOpacity
              style={{ marginHorizontal: 12 }}
              onPress={() => setRotationDeg(prev => prev - (Math.PI / 12))}
            >
              <MaterialIcons name="rotate-left" size={28} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 12 }}
              onPress={() => setRotationDeg(prev => prev + (Math.PI / 12))}
            >
              <MaterialIcons name="rotate-right" size={28} color="#888" />
            </TouchableOpacity>
          </View>
          <Slider
            minimumValue={1}
            maximumValue={2}
            value={sliderValue}
            onValueChange={val => {
              setSliderValue(val);
              runOnJS(onDrop)({
                ...sticker,
                x: translateX.value,
                y: translateY.value,
                scale: val,
                rotation: rotationDeg,
              });
            }}
            minimumTrackTintColor="#ff9800"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#ff9800"
            style={{ width: width - 48 }}
          />
        </View>
      )}
    </>
  );
};

const NAV_ITEMS = [
  { key: 'shape', icon: <MaterialCommunityIcons name="shape" size={28} color="#555" />, label: 'Hình học' },
  { key: 'sticker', icon: <MaterialCommunityIcons name="emoticon-happy-outline" size={28} color="#555" />, label: 'Nhãn dán' },
  { key: 'background', icon: <MaterialCommunityIcons name="image" size={28} color="#555" />, label: 'Hình nền' },
];

const TOOLBAR_HEIGHT = 60;
const TOOLBOX_HEIGHT = 64;
const TOOLBAR_PADDING_BOTTOM = 36;

// Danh sách hình mẫu
const MAU_LIST = [
  require('../../../assets/images/B2111885/Game2/Mau/Ex1.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex2.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex3.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex4.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex5.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex6.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex7.jpg'),
  require('../../../assets/images/B2111885/Game2/Mau/Ex8.jpg'),
];

const saveDir = (FileSystem as any).documentDirectory + 'Game2Save/';

const GameHinh2 = () => {
  const bodyRef = useRef<any>(null); 

  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [trashLayout, setTrashLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [colorMode, setColorMode] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'shape' | 'sticker' | 'background'>('shape');
  const [background, setBackground] = useState(require('../../../assets/images/B2111885/main_background.jpg'));
  const [selectedBackground, setSelectedBackground] = useState<any>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [showGalleryPanel, setShowGalleryPanel] = useState(true);
  const [hideUI, setHideUI] = useState(false);
  const [savedImages, setSavedImages] = useState<{ img: string, data: string }[]>([]);
  const [showMauHinhModal, setShowMauHinhModal] = useState(false);
  const [currentMau, setCurrentMau] = useState<any>(null);
  const [adjustShapeId, setAdjustShapeId] = useState<string | null>(null);
  const [adjustStickerId, setAdjustStickerId] = useState<string | null>(null);

  const galleryAnim = useRef(new RNAnimated.Value(1)).current;

  // Animation for toolbox show/hide
  const toolboxAnim = useRef(new RNAnimated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          toolboxAnim.setValue(Math.max(0, 1 - gestureState.dy / 80));
        } else if (gestureState.dy < 0) {
          toolboxAnim.setValue(Math.min(1, 1 - gestureState.dy / 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30) {
          RNAnimated.timing(toolboxAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -30) {
          RNAnimated.timing(toolboxAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else {
          RNAnimated.spring(toolboxAnim, {
            toValue: (toolboxAnim as any).__getValue() > 0.5 ? 1 : 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const navPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          toolboxAnim.setValue(Math.min(1, 1 - gestureState.dy / 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          RNAnimated.timing(toolboxAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else {
          RNAnimated.spring(toolboxAnim, {
            toValue: (toolboxAnim as any).__getValue() > 0.5 ? 1 : 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const toolboxTranslate = toolboxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TOOLBOX_HEIGHT + TOOLBAR_PADDING_BOTTOM, 0],
  });
  const toolboxOpacity = toolboxAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.5, 1],
  });

  const paletteAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(paletteAnim, {
      toValue: showColorPanel ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [showColorPanel]);

  useEffect(() => {
    RNAnimated.timing(galleryAnim, {
      toValue: showGalleryPanel ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showGalleryPanel]);

  // Hiển thị ngẫu nhiên 1 hình mẫu khi vào giao diện
  useEffect(() => {
    setCurrentMau(MAU_LIST[Math.floor(Math.random() * MAU_LIST.length)]);
    loadSavedImages();
  }, []);

  useEffect(() => {
    window.hideToolbar = (hide: boolean) => setHideUI(hide);
    return () => { window.hideToolbar = undefined; };
  }, []);

  const handleToolboxPress = (type: ShapeType) => {
    setShapes(prev => [
      ...prev,
      {
        id: `play-${type}-${Date.now()}-${Math.random()}`,
        type,
        x: 120,
        y: 220,
        scale: 1, // <-- mặc định là 1
        rotation: 0,
        color: DEFAULT_COLORS[type],
      },
    ]);
  };

  const handleDrop = (shape: ShapeData, isDelete: boolean) => {
    if (isDelete) {
      setShapes(prev => prev.filter(s => s.id !== shape.id));
    } else {
      setShapes(prev =>
        prev.map(s => (s.id === shape.id ? { ...s, ...shape } : s))
      );
    }
  };

  const handleChangeColor = (id: string) => {
    setShapes(prev =>
      prev.map(s => (s.id === id ? { ...s, color: selectedColor } : s))
    );
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    if (shapes.length > 0) setColorMode(true);
  };

  const handlePaletteOrCancel = () => {
    if (colorMode) {
      setColorMode(false);
    } else {
      setShowColorPanel(show => !show);
    }
  };

  const handleTrashPress = () => {
    setDeleteMode(mode => !mode);
    setColorMode(false);
  };

  const handleDeleteShape = (id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleBackgroundSelect = (img: any) => {
    setSelectedBackground(img);
    setBackground(img);
  };

  const handleStickerSelect = (img: any) => {
    if (deleteMode) return;
    setStickers(prev => [
      ...prev,
      {
        id: `sticker-${Date.now()}-${Math.random()}`,
        img,
        x: 120,
        y: 220,
        scale: 1, // <-- mặc định là 1
        rotation: 0,
      },
    ]);
  };

  const paletteGlow = paletteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#ffe082'],
  });


  const loadSavedImages = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(saveDir);
      const images = files.filter(f => f.endsWith('.jpg')).map(f => saveDir + f);
      setSavedImages(
        images.map(imgPath => ({
          img: imgPath,
          data: imgPath.replace('.jpg', '.json'),
        }))
      );
    } catch (e) {
      setSavedImages([]);
    }
  };

  // Sửa lại hàm lưu tác phẩm để khắc phục lỗi trên Android và đảm bảo đường dẫn đúng

  const handleSaveImage = async () => {
    setHideUI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 350)); // Đợi UI ẩn
      const uri = await bodyRef.current.capture();

      // Tạo thư mục nếu chưa có
      await FileSystem.makeDirectoryAsync(saveDir, { intermediates: true }).catch(() => {});

      // Tạo tên file
      const fileName = `save-${Date.now()}`;
      const imagePath = `${saveDir}${fileName}.jpg`;
      const dataPath = `${saveDir}${fileName}.json`;

      // Di chuyển file ảnh
      await FileSystem.moveAsync({ from: uri, to: imagePath });

      // Lưu dữ liệu trạng thái
      const saveData = {
        background: selectedBackground || background,
        shapes,
        stickers,
      };
      await FileSystem.writeAsStringAsync(dataPath, JSON.stringify(saveData));

      setHideUI(false);
      Alert.alert("Thông Báo", "Đã lưu tác phẩm thành công");
      loadSavedImages();
    } catch (e) {
      setHideUI(false);
      Alert.alert("Thông Báo", "Lưu tác phẩm thất bại!");
    }
  };

  const [showMauHinh, setShowMauHinh] = useState(true); // Hiện hình mẫu lớn

  // PanResponder cho hình mẫu: vuốt phải để ẩn hình mẫu
  const mauHinhPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) setShowMauHinh(false); // Vuốt phải đủ xa thì ẩn
      },
    })
  ).current;

  // PanResponder cho nút hiện lại: vuốt trái để hiện hình mẫu
  const mauHinhShowPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dx < -20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) setShowMauHinh(true); // Vuốt trái đủ xa thì hiện
      },
    })
  ).current;

  const handleLoadSavedWork = async (dataPath: string) => {
    try {
      const json = await FileSystem.readAsStringAsync(dataPath);
      const saveData = JSON.parse(json);

      // Khôi phục lại các state đã lưu
      setBackground(saveData.background);
      setSelectedBackground(saveData.background);
      setShapes(Array.isArray(saveData.shapes) ? saveData.shapes : []);
      setStickers(Array.isArray(saveData.stickers) ? saveData.stickers : []);
      setColorMode(false);
      setDeleteMode(false);
      setAdjustShapeId(null);
      setAdjustStickerId(null);
      setHideUI(false);
      // Nếu có các state khác, khôi phục thêm ở đây
    } catch (e) {
      Alert.alert("Thông Báo", "Không thể tải lại tác phẩm này!");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ViewShot ref={bodyRef} options={{ format: 'jpg', quality: 0.95 }} style={{ flex: 1 }}>
        <ImageBackground
          source={background}
          style={styles.container}
          resizeMode="cover"
        >
          <ViewShot ref={bodyRef} options={{ format: 'jpg', quality: 0.95 }} style={{ flex: 1 }}>
            {/* Khu vực xếp hình */}
            <View style={styles.playArea}>
              {/* Thùng rác */}
              {!hideUI && (
                <TouchableOpacity
                  style={[
                    styles.trash,
                    deleteMode && { backgroundColor: '#fffbe6', borderColor: '#ff9800', shadowColor: '#ff9800', shadowOpacity: 0.8, shadowRadius: 10, elevation: 15 }
                  ]}
                  onPress={handleTrashPress}
                  activeOpacity={0.7}
                  onLayout={e => {
                    const { x, y, width, height } = e.nativeEvent.layout;
                    setTrashLayout({ x, y, width, height });
                  }}
                >
                  <MaterialIcons name="delete" size={36} color={deleteMode ? "#ff9800" : "#b71c1c"} />
                </TouchableOpacity>
              )}
              {/* Công cụ màu sắc dọc */}
              {!hideUI && (
                <View style={styles.colorToolsColumn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RNAnimated.View
                      style={[
                        styles.colorIcon,
                        {
                          backgroundColor: paletteGlow,
                          borderColor: '#b71c1c',
                          shadowColor: showColorPanel ? '#ffe082' : '#fff',
                          shadowOpacity: showColorPanel ? 0.8 : 0,
                          shadowRadius: showColorPanel ? 16 : 0,
                          elevation: showColorPanel ? 10 : 2,
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 24 }}
                        onPress={handlePaletteOrCancel}
                        disabled={deleteMode}
                        activeOpacity={0.7}
                      >
                        {colorMode ? (
                          <MaterialIcons name="cancel" size={32} color="#b71c1c" />
                        ) : (
                          <MaterialIcons name="palette" size={32} color="#555" />
                        )}
                      </TouchableOpacity>
                    </RNAnimated.View>
                  </View>
                  {showColorPanel && (
                    <ScrollView
                      style={styles.colorColumnScroll}
                      contentContainerStyle={styles.colorColumn}
                      showsVerticalScrollIndicator={false}
                    >
                      {COLOR_PALETTE.map((color, idx) => (
                        <TouchableOpacity
                          key={color + '-' + idx}
                          style={[
                            styles.colorCircle,
                            {
                              backgroundColor: color,
                              borderWidth: selectedColor === color ? 3 : 1,
                              borderColor: selectedColor === color ? '#333' : '#888',
                            },
                          ]}
                          onPress={() => handleSelectColor(color)}
                          disabled={deleteMode}
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
              {/* Các hình tương tác */}
              {shapes.map(shape => (
                <DraggableShape
                  key={shape.id}
                  shape={shape}
                  onDrop={handleDrop}
                  trashLayout={trashLayout}
                  colorMode={colorMode}
                  selectedColor={selectedColor}
                  onChangeColor={handleChangeColor}
                  deleteMode={deleteMode}
                  onDeleteShape={handleDeleteShape}
                  adjustShapeId={adjustShapeId}
                  setAdjustShapeId={setAdjustShapeId}
                  setHideUI={setHideUI}
                />
              ))}
              {stickers.map(sticker => (
                <DraggableSticker
                  key={sticker.id}
                  sticker={sticker}
                  deleteMode={deleteMode}
                  onDeleteSticker={handleDeleteSticker}
                  onDrop={newSticker => {
                    setStickers(prev =>
                      prev.map(s => (s.id === newSticker.id ? { ...s, ...newSticker } : s))
                    );
                  }}
                  adjustStickerId={adjustStickerId}
                  setAdjustStickerId={setAdjustStickerId}
                  setHideUI={setHideUI}
                />
              ))}
            </View>

            {/* Thanh công cụ */}
            {!hideUI && (
              <RNAnimated.View
                style={[
                  styles.toolsArea,
                  {
                    height: TOOLBAR_HEIGHT + TOOLBOX_HEIGHT + TOOLBAR_PADDING_BOTTOM,
                    transform: [{ translateY: toolboxTranslate }],
                    opacity: toolboxOpacity,
                    paddingBottom: TOOLBAR_PADDING_BOTTOM,
                  },
                ]}
                {...panResponder.panHandlers}
              >
                {/* Thanh navigation nằm trên cùng của thanh công cụ */}
                <RNAnimated.View
                  style={styles.topNav}
                  {...navPanResponder.panHandlers}
                >
                  {NAV_ITEMS.map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.navItem,
                        activeTab === item.key && styles.navItemActive
                      ]}
                      onPress={() => setActiveTab(item.key as any)}
                    >
                      {React.cloneElement(item.icon, {
                        color: activeTab === item.key ? '#ff9800' : '#555'
                      })}
                    </TouchableOpacity>
                  ))}
                </RNAnimated.View>

                {/* Toolbox hoặc Sticker/Background Picker */}
                <View style={styles.toolboxWrap}>
                  {activeTab === 'shape' && (
                    <View style={styles.toolbox}>
                      {TOOLBOX_SHAPES.map((type, idx) => (
                        <TouchableOpacity
                          key={type}
                          style={styles.toolboxShape}
                          onPress={() => handleToolboxPress(type)}
                          activeOpacity={0.7}
                          disabled={deleteMode || colorMode}
                        >
                          <View style={getShapeStyle(
                            type,
                            TOOLBOX_SIZE,
                            TOOLBOX_RECT_WIDTH,
                            TOOLBOX_RECT_HEIGHT,
                            DEFAULT_COLORS[type]
                          )} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {activeTab === 'sticker' && (
                    <View style={styles.toolbox}>
                      <ToanHinh_NhanDan onSelect={handleStickerSelect} />
                    </View>
                  )}
                  {activeTab === 'background' && (
                    <View style={styles.toolbox}>
                      <ToanHinh_HinhNen onSelect={handleBackgroundSelect} selected={selectedBackground} />
                    </View>
                  )}
                </View>
              </RNAnimated.View>
            )}
            {!hideUI && (
              <RNAnimated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: TOOLBAR_HEIGHT + TOOLBOX_HEIGHT + TOOLBAR_PADDING_BOTTOM,
                  height: 70,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 0,
                  opacity: toolboxOpacity,
                  transform: [{ translateY: toolboxTranslate }],
                  zIndex: 301,
                }}
              >
                <TouchableOpacity
                  onPress={handleSaveImage}
                  activeOpacity={0.7}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 1,
                    borderColor: '#eee',
                    marginRight: 8,
                  }}
                >
                  <Ionicons name="save-outline" size={28} color="#ff9800" />
                </TouchableOpacity>
              </RNAnimated.View>
            )}

            {/* Hiển thị hình mẫu góc phải */}
            

            {!hideUI && showMauHinh && (
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 5,
                  width: 120,
                  height: 147,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#eee',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  zIndex: 999,
                }}
                {...mauHinhPanResponder.panHandlers}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowMauHinhModal(true)}
                  style={{ width: 112, height: 140, borderRadius: 12 }}
                >
                  <Image
                    source={typeof currentMau === 'string' ? { uri: currentMau } : currentMau}
                    style={{ width: 112, height: 140, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            )}
            {!hideUI && !showMauHinh && (
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 5,
                  width: 32,
                  height: 147,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 999,
                  backgroundColor: 'transparent',
                }}
                {...mauHinhShowPanResponder.panHandlers}
              >
                <MaterialIcons name="chevron-left" size={28} color="#bbb" />
              </View>
            )}

            {/* Modal hiển thị danh sách mẫu và tác phẩm đã lưu */}
            {!hideUI && showMauHinhModal && (
              <RNAnimated.View
                style={{
                  position: 'absolute',
                  top: 30,
                  right: 10,
                  width: 260,
                  height: 420,
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: '#eee',
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 12,
                  zIndex: 1000,
                  overflow: 'hidden',
                  padding: 8,
                }}
              >
                <ScrollView style={{ flex: 1 }}>
                  {/* Tiêu đề */}
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 8, alignSelf: 'center' }}>
                    Mẫu ví dụ
                  </Text>
                  {/* Danh sách hình mẫu */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
                    {MAU_LIST.map((img, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{ margin: 4 }}
                        onPress={() => {
                          setCurrentMau(img);
                          setShowMauHinhModal(false);
                        }}
                      >
                        <Image
                          source={img}
                          style={{ width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 6 }} />
                  {/* Tiêu đề tác phẩm đã lưu */}
                  <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 6, alignSelf: 'center' }}>
                    Tác phẩm của tôi
                  </Text>
                  {/* Danh sách tác phẩm đã lưu */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {savedImages.length === 0 && (
                      <Text style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>Chưa có tác phẩm nào</Text>
                    )}
                    {savedImages.map(({ img, data }, idx) => (
                      <View key={img} style={{ margin: 4, alignItems: 'center', position: 'relative' }}>
                        <TouchableOpacity
                          onPress={async () => {
                            setCurrentMau(img); // vẫn cho xem ảnh lớn
                            await handleLoadSavedWork(data); // tái tạo lại giao diện
                            setShowMauHinhModal(false);
                          }}
                        >
                          <Image
                            source={{ uri: img }}
                            style={{ width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f5f5f5' }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                        {/* Nút xóa */}
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 2,
                            zIndex: 10,
                          }}
                          onPress={() => {
                            Alert.alert(
                              'Xác nhận',
                              'Bạn có chắc muốn xóa tác phẩm này?',
                              [
                                { text: 'Hủy', style: 'cancel' },
                                {
                                  text: 'Xóa',
                                  style: 'destructive',
                                  onPress: async () => {
                                    await FileSystem.deleteAsync(img, { idempotent: true });
                                    await FileSystem.deleteAsync(data, { idempotent: true });
                                    loadSavedImages();
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Ionicons name="close-circle" size={18} color="#ff4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                {/* Nút đóng modal */}
                <TouchableOpacity
                  style={{
                    marginTop: 12,
                    alignSelf: 'center',
                    backgroundColor: '#eee',
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 32,
                  }}
                  onPress={() => setShowMauHinhModal(false)}
                >
                  <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>Hủy</Text>
                </TouchableOpacity>
              </RNAnimated.View>
            )}

          </ViewShot>
        </ImageBackground>
      </ViewShot>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playArea: {
    flex: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 0,
  },
  toolsArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    zIndex: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: TOOLBAR_HEIGHT,
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: '#fffbe6',
    borderBottomWidth: 3,
    borderBottomColor: '#ff9800',
  },
  toolboxWrap: {
    height: TOOLBOX_HEIGHT,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 0,
    minHeight: undefined,
    height: TOOLBOX_HEIGHT,
  },
  toolboxShape: {
    marginHorizontal: 10,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trash: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#b71c1c',
  },
  colorToolsColumn: {
    position: 'absolute',
    left: 4,
    top: 70,
    zIndex: 101,
    alignItems: 'center',
    width: 60,
  },
  colorIcon: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'gray',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorColumnScroll: {
    maxHeight: 220,
    width: 44,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  colorColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    paddingVertical: "5%",
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginVertical: 4,
    borderColor: '#888',
  },
});

export default GameHinh2;

declare global {
  interface Window {
    hideToolbar?: (hide: boolean) => void;
  }
}
