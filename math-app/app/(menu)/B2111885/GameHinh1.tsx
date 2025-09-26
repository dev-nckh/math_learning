import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

type ShapeType = 'circle' | 'square' | 'triangle' | 'rectangle';
type ShapeObj = {
  id: string;
  type: ShapeType;
  column: number;
  animatedValue: Animated.Value;
};

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'rectangle'];
const SHAPE_HEIGHT = 80;
const COLUMN_COUNT = 3;
const INITIAL_FALL_DURATION = 4000;
const MIN_FALL_DURATION = 1000;
const getBatchLimit = (_speedUpLevel: number) => 10;
const HIGH_SCORE_KEY = 'mathgame_high_score';

const getRandomShape = (exclude: ShapeType[] = []): ShapeType => {
  const available = SHAPES.filter(s => !exclude.includes(s));
  return available[Math.floor(Math.random() * available.length)];
};

const getRandomColumns = (count: number): number[] => {
  const columns = [0, 1, 2];
  for (let i = columns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [columns[i], columns[j]] = [columns[j], columns[i]];
  }
  return columns.slice(0, count);
};

const getShapeName = (type: ShapeType): string => {
  switch (type) {
    case 'circle': return 'Hình Tròn';
    case 'square': return 'Hình Vuông';
    case 'triangle': return 'Hình Tam Giác';
    case 'rectangle': return 'Hình Chữ Nhật';
    default: return '';
  }
};

const FallingShape: React.FC<{
  shape: ShapeObj;
  columnWidth: number;
  onEnd: (id: string, caught: boolean) => void;
  fallDuration: number;
  boxHeight: number;
  playerColumn: number;
  targetShape: ShapeType | null;
  isGameOver: boolean;
}> = ({
  shape,
  columnWidth,
  onEnd,
  fallDuration,
  boxHeight,
  playerColumn,
  targetShape,
  isGameOver,
}) => {
  // Thêm ref để đảm bảo chỉ gọi onEnd 1 lần
  const endedRef = useRef(false);

  useEffect(() => {
    if (boxHeight <= SHAPE_HEIGHT + 10) return;
    const animation = Animated.timing(shape.animatedValue, {
      toValue: boxHeight - SHAPE_HEIGHT,
      duration: fallDuration,
      useNativeDriver: true,
      easing: t => t,
    });
    animation.start(() => {
      if (!isGameOver && !endedRef.current) {
        endedRef.current = true;
        onEnd(shape.id, false);
      }
    });
    return () => animation.stop();
  }, [boxHeight, fallDuration, isGameOver]);

  // Vẽ hình theo loại
  const renderShape = () => {
    switch (shape.type) {
      case 'circle':
        return <View style={styles.circleBig} />;
      case 'square':
        return <View style={styles.squareBig} />;
      case 'rectangle':
        return <View style={styles.rectangleBig} />;
      case 'triangle':
        return (
          <View style={styles.triangleWrap}>
            <View style={styles.triangleBorder} />
            <View style={styles.triangleBig} />
          </View>
        );
    }
  };

  // Kiểm tra va chạm với nhân vật khi hình gần đáy
  useEffect(() => {
    if (isGameOver) return;
    const listener = shape.animatedValue.addListener(({ value }) => {
      if (
        value >= boxHeight - SHAPE_HEIGHT - 10 &&
        shape.column === playerColumn &&
        !endedRef.current
      ) {
        endedRef.current = true;
        // Nếu đúng loại hình mục tiêu
        if (shape.type === targetShape) {
          onEnd(shape.id, true);
        } else {
          onEnd(shape.id, false);
        }
      }
    });
    return () => shape.animatedValue.removeListener(listener);
  }, [boxHeight, playerColumn, targetShape, isGameOver]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: shape.column * columnWidth + columnWidth / 2 - SHAPE_HEIGHT / 2,
        transform: [{ translateY: shape.animatedValue }],
        zIndex: 10,
      }}>
      {renderShape()}
    </Animated.View>
  );
};

const GameHinh1: React.FC = () => {
  const router = useRouter();
  const [position, setPosition] = React.useState(1);
  const [countdown, setCountdown] = React.useState(3);
  const [showCountdown, setShowCountdown] = React.useState(true);

  const [fallingShapes, setFallingShapes] = React.useState<ShapeObj[]>([]);
  const [fallDuration, setFallDuration] = React.useState(INITIAL_FALL_DURATION);
  const [boxHeight, setBoxHeight] = React.useState(0);

  const [currentTargetShape, setCurrentTargetShape] = React.useState<ShapeType | null>(null);
  const [dropBatchCount, setDropBatchCount] = React.useState(0);
  const [speedUpLevel, setSpeedUpLevel] = React.useState(0);
  const [showSpeedUp, setShowSpeedUp] = React.useState(false);

  const [score, setScore] = React.useState(0);
  const [isGameOver, setIsGameOver] = React.useState(false);

  const [pendingSpeedUp, setPendingSpeedUp] = React.useState(false);
  const [highScore, setHighScore] = React.useState(0);

  const screenWidth = Dimensions.get('window').width;
  const columnWidth = screenWidth / COLUMN_COUNT;

  // Đếm ngược bắt đầu game
  React.useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setTimeout(() => setShowCountdown(false), 1000);
    }
  }, [showCountdown, countdown]);

  // Khi hết hình, tạo đợt mới hoặc tăng tốc nếu đủ số đợt
  React.useEffect(() => {
    if (
      !showCountdown &&
      !isGameOver &&
      fallingShapes.length === 0 &&
      boxHeight > SHAPE_HEIGHT + 10 &&
      !showSpeedUp
    ) {
      const batchLimit = getBatchLimit(speedUpLevel);

      // Nếu đủ số đợt, tăng tốc (nếu chưa đạt min)
      if (
        dropBatchCount > 0 &&
        dropBatchCount % batchLimit === 0 &&
        fallDuration > MIN_FALL_DURATION &&
        !pendingSpeedUp
      ) {
        setShowSpeedUp(true);
        setPendingSpeedUp(true); // Chặn tăng tốc liên tục
        setTimeout(() => {
          setShowSpeedUp(false);
          setFallDuration(d => {
            const next = Math.max(MIN_FALL_DURATION, d / 1.5);
            if (next === MIN_FALL_DURATION) setSpeedUpLevel(9999);
            return next;
          });
          setSpeedUpLevel(lv => lv + 1);
          // KHÔNG setPendingSpeedUp(false) ở đây!
        }, 1500);
        return;
      }

      // Xác định số hình rơi mỗi đợt theo speedUpLevel
      let numShapes = 1;
      if (speedUpLevel === 0) numShapes = 1;
      else if (speedUpLevel === 1) numShapes = 2;
      else numShapes = 3;

      const columns = getRandomColumns(numShapes);
      const usedTypes: ShapeType[] = [];
      const shapes: ShapeObj[] = [];
      for (let i = 0; i < numShapes; i++) {
        const type = getRandomShape(usedTypes);
        usedTypes.push(type);
        shapes.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          column: columns[i],
          animatedValue: new Animated.Value(-SHAPE_HEIGHT),
        });
      }
      // Random chọn 1 trong các hình làm nhiệm vụ
      const targetIdx = Math.floor(Math.random() * numShapes);
      setCurrentTargetShape(shapes[targetIdx].type);

      setTimeout(() => {
        setFallingShapes(shapes);
        setDropBatchCount(c => c + 1);
        setPendingSpeedUp(false); // Cho phép tăng tốc lại sau khi đã rơi xong 1 đợt mới
      }, 300);
    }
  }, [
    fallingShapes.length,
    showCountdown,
    boxHeight,
    fallDuration,
    speedUpLevel,
    dropBatchCount,
    showSpeedUp,
    isGameOver,
    pendingSpeedUp,
  ]);

  // Khi hình rơi xong thì xóa khỏi danh sách và kiểm tra logic thắng/thua
  const handleShapeEnd = (id: string, caught: boolean) => {
    setFallingShapes(prev => prev.filter(shape => shape.id !== id));
    if (isGameOver) return;

    // Lấy thông tin hình vừa kết thúc
    let endedShape: ShapeObj | undefined;
    for (const shape of fallingShapes) {
      if (shape.id === id) {
        endedShape = shape;
        break;
      }
    }
    if (!endedShape) return;

    if (caught) {
      // Nếu nhặt đúng loại hình mục tiêu thì cộng điểm, không thua
      if (endedShape.type === currentTargetShape) {
        setScore(s => s + 10);
      } else {
        setIsGameOver(true);
      }
    } else {
      // Nếu hình rơi xuống đáy mà không nhặt, chỉ thua nếu đó là hình mục tiêu
      if (endedShape.type === currentTargetShape) {
        setIsGameOver(true);
      }
      // Nếu không phải hình mục tiêu thì không thua
    }
  };

  // Di chuyển nhân vật sang trái/phải
  const handleMoveLeft = () => {
    if (!isGameOver) setPosition(prev => Math.max(0, prev - 1));
  };
  const handleMoveRight = () => {
    if (!isGameOver) setPosition(prev => Math.min(COLUMN_COUNT - 1, prev + 1));
  };

  // Reset game (nếu muốn chơi lại)
  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setDropBatchCount(0);
    setSpeedUpLevel(0);
    setFallDuration(INITIAL_FALL_DURATION);
    setFallingShapes([]);
    setCurrentTargetShape(null);
    setShowCountdown(true);
    setCountdown(3);
  };

  // Lấy điểm cao nhất khi vào game
  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then(val => {
      if (val) setHighScore(Number(val));
    });
  }, []);

  // Khi game over, nếu điểm hiện tại > highScore thì lưu lại
  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [isGameOver, score, highScore]);

  return (
    <ImageBackground
      source={require('../../../assets/images/B2111885/game_background.jpg')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay}>
        {/* Box1: Hiển thị điểm */}
        <View style={styles.box1}>
          <View style={{ alignItems: 'flex-end', width: '100%', paddingRight: 20 }}>
            <Text style={{ fontSize: 28, color: '#E65100', fontWeight: 'bold' }}>
              Điểm: {score}
            </Text>
            <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>
              Kỷ lục: {highScore}
            </Text>
          </View>
        </View>

        <View
          style={styles.box2}
          onLayout={e => setBoxHeight(e.nativeEvent.layout.height)}>
          {fallingShapes.map(shape => (
            <FallingShape
              key={shape.id}
              shape={shape}
              columnWidth={columnWidth}
              onEnd={handleShapeEnd}
              fallDuration={fallDuration}
              boxHeight={boxHeight}
              playerColumn={position}
              targetShape={currentTargetShape}
              isGameOver={isGameOver}
            />
          ))}
        </View>

        <View style={styles.box3}>
          <View
            style={[
              styles.characterWrapper,
              { left: columnWidth * position + columnWidth / 2 - 30 },
            ]}>
            <Image
              source={require('../../../assets/images/B2111885/character/dog_basket.png')}
              style={styles.character}
            />
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleMoveLeft}>
              <Image source={require('../../../assets/icons/back.png')} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.currentShapeCenter}>
              <Text style={styles.currentShapeLabel}>Bắt hình:</Text>
              <Text style={styles.currentShapeTarget}>
                {currentTargetShape ? getShapeName(currentTargetShape) : ''}
              </Text>
            </View>

            <TouchableOpacity style={styles.controlButton} onPress={handleMoveRight}>
              <Image source={require('../../../assets/icons/next.png')} style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {showCountdown && (
          <View style={styles.countdownOverlay}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>
                {countdown > 0 ? `Bắt đầu sau ${countdown}...` : 'Bắt đầu!'}
              </Text>
            </View>
          </View>
        )}

        {showSpeedUp && fallDuration > MIN_FALL_DURATION && (
          <View style={styles.countdownOverlay}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>Tăng tốc!</Text>
            </View>
          </View>
        )}

        {isGameOver && (
          <View style={styles.countdownOverlay}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>Bạn đã thua!</Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#E65100',
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginRight: 16,
                  }}
                  onPress={handleRestart}
                >
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Chơi lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#388E3C',
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                  onPress={() => router.replace('/(menu)/B2111885/TroChoiHinhHoc')}
                >
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Trở về</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: '2%',
    paddingBottom: 12,
  },
  box1: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'flex-end', // căn phải
    paddingRight: 0, // padding sẽ đặt ở View con
  },
  box2: {
    flex: 6,
    position: 'relative',
  },
  box3: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: '2%',
  },
  characterWrapper: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    width: 60,
    paddingBottom: '25%',
  },
  character: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // căn giữa theo chiều dọc
    marginTop: '20%',
    paddingHorizontal: '5%',
    paddingVertical: '5%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  arrowIcon: {
    width: 30,
    height: 30,
    tintColor: '#333',
  },
  circleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBC02D',
    borderWidth: 4,
    borderColor: '#F9A825',
    alignSelf: 'center',
  },
  squareBig: {
    width: 80,
    height: 80,
    backgroundColor: '#EF6C00',
    borderWidth: 4,
    borderColor: '#E65100',
    alignSelf: 'center',
  },
  triangleWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  triangleBorder: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 0,
    height: 0,
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2E7D32',
    transform: [{ translateX: -40 }],
  },
  triangleBig: {
    position: 'absolute',
    top: 6,
    left: '50%',
    width: 0,
    height: 0,
    borderLeftWidth: 34,
    borderRightWidth: 34,
    borderBottomWidth: 58,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#388E3C',
    transform: [{ translateX: -34 }],
  },
  rectangleBig: {
    width: 80,
    height: 60,
    backgroundColor: '#0288D1',
    borderWidth: 4,
    borderColor: '#0277BD',
    alignSelf: 'center',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E65100',
    textAlign: 'center',
  },
  currentShapeCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  currentShapeLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentShapeTarget: {
    fontSize: 24,
    color: '#FFD600',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default GameHinh1;