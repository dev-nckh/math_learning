// games/types/PointLineGame.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, PanResponder, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Svg, Line, Circle, Polygon } from 'react-native-svg';
import GeometryTutorial from '../components/theory/LinePointTheory';

interface PhysicsBallGameProps {
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

interface Point {
  x: number;
  y: number;
  id: number;
}

interface Basket {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LineSegment {
  start: Point;
  end: Point;
  id: number;
}

interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  hasHitLine: boolean;
  hitLineCount: number;
  hitLineIds: Set<number>;
}

interface GameState {
  points: Point[];
  lines: LineSegment[];
  ball: Ball | null;
  basket: Basket;
  isPlaying: boolean;
  gameWon: boolean;
  score: number;
  level: number;
}

const { width: screenWidth } = Dimensions.get('window');
const drawAreaWidth = screenWidth - 40;
const drawAreaHeight = 400;
const POINT_RADIUS = 8;
const BALL_RADIUS = 12;
const BASKET_WIDTH = 60;
const BASKET_HEIGHT = 20;
const GRAVITY = 0.4;
const FRICTION = 0.85;
const BOUNCE_DAMPING = 0.8;
const TOUCH_RADIUS = 40;
const MIN_VELOCITY = 0.05; // Minimum velocity before stopping
const OVERLAP_THRESHOLD = 5; // Distance threshold for overlapping points

export default function PhysicsBallGame({ chapterId, lessonId, gameId, gameData }: PhysicsBallGameProps) {
  // Helper function to get required line hits for current level
  const getRequiredLineHits = (level: number): number => {
    return level; // Level 1 = 1 line, Level 2 = 2 lines, etc.
  };
  
  // Phase state
  const [gamePhase, setGamePhase] = useState<'tutorial' | 'game'>('tutorial');
  const [showGameTutorial, setShowGameTutorial] = useState(false);
  const [hasSeenGameTutorial, setHasSeenGameTutorial] = useState(false);
  const [ballCollisionEffect, setBallCollisionEffect] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    points: [],
    lines: [],
    ball: null,
    basket: { x: 0, y: 0, width: BASKET_WIDTH, height: BASKET_HEIGHT },
    isPlaying: false,
    gameWon: false,
    score: 0,
    level: 1
  });
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStart, setCurrentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  
  // Animation refs
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize game with basket and ball at different positions per level
  useEffect(() => {
    if (gamePhase === 'game') {
      // Calculate basket position based on level
      const basketPositions = [
        { x: drawAreaWidth * 0.2, y: drawAreaHeight - BASKET_HEIGHT }, // Level 1: Left side
        { x: drawAreaWidth * 0.8 - BASKET_WIDTH, y: drawAreaHeight - BASKET_HEIGHT }, // Level 2: Right side
        { x: drawAreaWidth * 0.5 - BASKET_WIDTH / 2, y: drawAreaHeight - BASKET_HEIGHT }, // Level 3: Center
        { x: drawAreaWidth * 0.1, y: drawAreaHeight - BASKET_HEIGHT }, // Level 4: Far left
        { x: drawAreaWidth * 0.9 - BASKET_WIDTH, y: drawAreaHeight - BASKET_HEIGHT }, // Level 5: Far right
      ];
      
      const basketIndex = (gameState.level - 1) % basketPositions.length;
      const basketPosition = basketPositions[basketIndex];
      
      // Generate ball position at top of grid, ensuring it's not aligned with basket
      let ballX;
      const basketCenterX = basketPosition.x + BASKET_WIDTH / 2;
      const minDistance = 80; // Minimum distance to avoid alignment
      
      do {
        ballX = Math.random() * (drawAreaWidth - 2 * BALL_RADIUS) + BALL_RADIUS;
      } while (Math.abs(ballX - basketCenterX) < minDistance);
      
      const ballY = BALL_RADIUS + 20; // Position near top with some margin
      
      const newBall: Ball = {
        x: ballX,
        y: ballY,
        velocityX: 0,
        velocityY: 0,
        radius: BALL_RADIUS,
        hasHitLine: false,
        hitLineCount: 0,
        hitLineIds: new Set()
      };
      
      setGameState(prev => ({
        ...prev,
        points: [],
        lines: [],
        ball: newBall,
        basket: {
          x: basketPosition.x,
          y: basketPosition.y,
          width: BASKET_WIDTH,
          height: BASKET_HEIGHT
        },
        isPlaying: false,
        gameWon: false
      }));
    }
  }, [gamePhase, gameState.level]);

  // Tutorial handlers
  const handleTutorialComplete = () => {
    setGamePhase('game');
    setShowGameTutorial(true);
  };

  const handleTutorialExit = () => {
    router.back();
  };

  const handleGameTutorialComplete = () => {
    setShowGameTutorial(false);
    setHasSeenGameTutorial(true);
  };
  
  // Physics simulation
  const updateBallPhysics = (ball: Ball, deltaTime: number): Ball => {
    let newBall = { ...ball };
    
    // Apply gravity
    newBall.velocityY += GRAVITY * deltaTime;
    
    // Store old position for collision checking
    const oldX = newBall.x;
    const oldY = newBall.y;
    
    // Update position
    newBall.x += newBall.velocityX * deltaTime;
    newBall.y += newBall.velocityY * deltaTime;
    
    // Check collision with walls - keep ball within grid bounds
    if (newBall.x - newBall.radius <= 0) {
      newBall.x = newBall.radius;
      newBall.velocityX = Math.abs(newBall.velocityX) * BOUNCE_DAMPING;
    }
    if (newBall.x + newBall.radius >= drawAreaWidth) {
      newBall.x = drawAreaWidth - newBall.radius;
      newBall.velocityX = -Math.abs(newBall.velocityX) * BOUNCE_DAMPING;
    }
    
    // Bounce off the bottom (grid floor) naturally
    if (newBall.y + newBall.radius >= drawAreaHeight) {
      newBall.y = drawAreaHeight - newBall.radius;
      newBall.velocityY = -Math.abs(newBall.velocityY) * BOUNCE_DAMPING;
      newBall.velocityX *= FRICTION; // Apply friction when touching ground
    }
    
    // Top boundary (less likely but for completeness)
    if (newBall.y - newBall.radius <= 0) {
      newBall.y = newBall.radius;
      newBall.velocityY = Math.abs(newBall.velocityY) * BOUNCE_DAMPING;
    }
    
    // Check collision with line segments (multiple iterations for stability)
    let collisionOccurred = false;
    for (let iteration = 0; iteration < 3; iteration++) {
      let hasCollision = false;
      
      for (const line of gameState.lines) {
        const collision = checkBallLineCollision(newBall, line);
        if (collision) {
          newBall = collision;
          hasCollision = true;
          collisionOccurred = true;
        }
      }
      
      if (!hasCollision) break; // No more collisions, exit loop
    }
    
    // Apply minimum velocity threshold to prevent jittering
    if (Math.abs(newBall.velocityX) < MIN_VELOCITY) {
      newBall.velocityX = 0;
    }
    if (Math.abs(newBall.velocityY) < MIN_VELOCITY && newBall.y + newBall.radius >= drawAreaHeight - 1) {
      newBall.velocityY = 0;
    }
    
    return newBall;
  };
  
  const checkBallLineCollision = (ball: Ball, line: LineSegment): Ball | null => {
    const { start, end } = line;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return null;
    
    // Calculate the closest point on the line to the ball
    const ballToStart = {
      x: ball.x - start.x,
      y: ball.y - start.y
    };
    
    const projection = (ballToStart.x * dx + ballToStart.y * dy) / (length * length);
    
    // Clamp projection to line segment
    const clampedProjection = Math.max(0, Math.min(1, projection));
    
    const closestPoint = {
      x: start.x + clampedProjection * dx,
      y: start.y + clampedProjection * dy
    };
    
    const distanceVector = {
      x: ball.x - closestPoint.x,
      y: ball.y - closestPoint.y
    };
    
    const distance = Math.sqrt(distanceVector.x * distanceVector.x + distanceVector.y * distanceVector.y);
    
    if (distance <= ball.radius && distance > 0) {
      const newBall = { ...ball };
      
      // Calculate collision normal (pointing away from line)
      const normalX = distanceVector.x / distance;
      const normalY = distanceVector.y / distance;
      
      // Move ball outside of collision
      const penetration = ball.radius - distance;
      newBall.x += normalX * penetration;
      newBall.y += normalY * penetration;
      
      // Calculate relative velocity in collision normal direction
      const velocityDotNormal = newBall.velocityX * normalX + newBall.velocityY * normalY;
      
      // Only resolve collision if objects are moving towards each other
      if (velocityDotNormal < 0) {
        // Apply collision response
        newBall.velocityX -= (1 + BOUNCE_DAMPING) * velocityDotNormal * normalX;
        newBall.velocityY -= (1 + BOUNCE_DAMPING) * velocityDotNormal * normalY;
        
        // Apply friction along the tangent
        const tangentX = -normalY;
        const tangentY = normalX;
        const velocityDotTangent = newBall.velocityX * tangentX + newBall.velocityY * tangentY;
        
        newBall.velocityX -= velocityDotTangent * tangentX * (1 - FRICTION);
        newBall.velocityY -= velocityDotTangent * tangentY * (1 - FRICTION);
        
        // Track line hits for level requirements
        if (!newBall.hitLineIds.has(line.id)) {
          newBall.hitLineIds.add(line.id);
          newBall.hitLineCount = newBall.hitLineIds.size;
          newBall.hasHitLine = true;
        }
        
        // Trigger visual collision effect
        setBallCollisionEffect(true);
        setTimeout(() => setBallCollisionEffect(false), 200);
      }
      
      return newBall;
    }
    
    return null;
  };
  
  // Game animation loop
  const startGameLoop = () => {
    if (!gameState.ball || gameState.isPlaying) return;
    
    setGameState(prev => ({ ...prev, isPlaying: true }));
    let lastTime = Date.now();
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      setGameState(prev => {
        if (!prev.ball || !prev.isPlaying) return prev;
        
        const updatedBall = updateBallPhysics(prev.ball, deltaTime);
        
        // Check if ball fell into basket
        const basket = prev.basket;
        if (updatedBall.x >= basket.x && 
            updatedBall.x <= basket.x + basket.width &&
            updatedBall.y + updatedBall.radius >= basket.y) {
          
          // Check win condition: ball must have hit a line AND be in basket
          if (updatedBall.hasHitLine) {
            setTimeout(() => {
              Alert.alert(
                '🎉 Chúc mừng!',
                'Bạn đã thành công! Bóng đã chạm đường thẳng và rơi vào rổ!',
                [
                  { text: 'Chơi lại', onPress: () => resetGame() },
                  { text: 'Level tiếp theo', onPress: () => nextLevel() }
                ]
              );
            }, 500);
            
            return {
              ...prev,
              ball: { ...updatedBall, y: basket.y - updatedBall.radius },
              isPlaying: false,
              gameWon: true,
              score: prev.score + 100
            };
          } else {
            // Ball in basket but didn't hit any line
            setTimeout(() => {
              Alert.alert(
                '😔 Gần rồi!',
                'Bóng đã vào rổ nhưng chưa chạm đường thẳng nào. Hãy thử lại!',
                [{ text: 'Thử lại', onPress: () => resetBall() }]
              );
            }, 500);
            
            return {
              ...prev,
              ball: { ...updatedBall, y: basket.y - updatedBall.radius },
              isPlaying: false
            };
          }
        }
        
        if (Math.abs(updatedBall.velocityX) > MIN_VELOCITY || Math.abs(updatedBall.velocityY) > MIN_VELOCITY) {
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        } else {
          // Ball stopped moving - check if it's near the basket
          const basket = prev.basket;
          const nearBasket = Math.abs(updatedBall.x - (basket.x + basket.width/2)) < basket.width &&
                            Math.abs(updatedBall.y - basket.y) < 30;
          
          setTimeout(() => {
            if (nearBasket && !updatedBall.hasHitLine) {
              Alert.alert(
                '😔 Gần rồi!',
                'Bóng đã dừng gần rổ nhưng chưa chạm đường thẳng nào!',
                [{ text: 'Thử lại', onPress: () => resetBall() }]
              );
            } else {
              Alert.alert(
                '😔 Thử lại!',
                updatedBall.hasHitLine ? 
                  'Bóng đã chạm đường thẳng nhưng không vào được rổ.' :
                  'Bóng chưa chạm đường thẳng nào và không vào rổ.',
                [{ text: 'Thử lại', onPress: () => resetBall() }]
              );
            }
          }, 1000);
          
          return { ...prev, isPlaying: false };
        }
        
        return { ...prev, ball: updatedBall };
      });
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  const resetBall = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Reset ball to original position at top
    const basketCenterX = gameState.basket.x + gameState.basket.width / 2;
    const minDistance = 80;
    
    let ballX;
    do {
      ballX = Math.random() * (drawAreaWidth - 2 * BALL_RADIUS) + BALL_RADIUS;
    } while (Math.abs(ballX - basketCenterX) < minDistance);
    
    const newBall: Ball = {
      x: ballX,
      y: BALL_RADIUS + 20,
      velocityX: 0,
      velocityY: 0,
      radius: BALL_RADIUS,
      hasHitLine: false
    };
    
    setGameState(prev => ({
      ...prev,
      ball: newBall,
      isPlaying: false,
      gameWon: false
    }));
  };
  
  const resetGame = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Generate new ball position for the current level
    const basketCenterX = gameState.basket.x + gameState.basket.width / 2;
    const minDistance = 80;
    
    let ballX;
    do {
      ballX = Math.random() * (drawAreaWidth - 2 * BALL_RADIUS) + BALL_RADIUS;
    } while (Math.abs(ballX - basketCenterX) < minDistance);
    
    const newBall: Ball = {
      x: ballX,
      y: BALL_RADIUS + 20,
      velocityX: 0,
      velocityY: 0,
      radius: BALL_RADIUS,
      hasHitLine: false
    };
    
    setGameState(prev => ({
      ...prev,
      points: [],
      lines: [],
      ball: newBall,
      isPlaying: false,
      gameWon: false
    }));
  };
  
  const nextLevel = () => {
    setGameState(prev => ({ ...prev, level: prev.level + 1 }));
    // Show tutorial again for new level if user wants
    if (hasSeenGameTutorial) {
      setShowGameTutorial(true);
    }
    resetGame();
  };
  
  // Touch handlers
  const handleCanvasPress = (event: any) => {
    if (gameState.isPlaying || isDrawing) return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    // Constrain coordinates within grid bounds
    const constrainedX = Math.max(BALL_RADIUS, Math.min(drawAreaWidth - BALL_RADIUS, locationX));
    const constrainedY = Math.max(BALL_RADIUS, Math.min(drawAreaHeight - BALL_RADIUS, locationY));
    
    // Check if we clicked near an existing point
    const nearestPoint = findNearestPoint(constrainedX, constrainedY);
    
    if (!nearestPoint) {
      // Create new point if not near existing one
      const newPoint: Point = {
        x: constrainedX,
        y: constrainedY,
        id: Date.now()
      };
      
      setGameState(prev => ({
        ...prev,
        points: [...prev.points, newPoint]
      }));
    }
  };

  const findNearestPoint = (x: number, y: number): Point | null => {
    let nearest: Point | null = null;
    let minDistance = TOUCH_RADIUS;
    
    gameState.points.forEach(point => {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    return nearest;
  };

  // PanResponder for line drawing
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (event) => {
      if (gameState.isPlaying) return false;
      
      const { locationX, locationY } = event.nativeEvent;
      
      // Only start line drawing if we have at least 2 points and start near a point
      if (gameState.points.length >= 2) {
        const nearestPoint = findNearestPoint(locationX, locationY);
        return nearestPoint !== null;
      }
      
      return false;
    },
    
    onMoveShouldSetPanResponder: () => {
      return isDrawing;
    },
    
    onPanResponderGrant: (event) => {
      if (gameState.isPlaying) return;
      
      const { locationX, locationY } = event.nativeEvent;
      
      if (gameState.points.length >= 2) {
        const nearestPoint = findNearestPoint(locationX, locationY);
        if (nearestPoint) {
          setCurrentStart(nearestPoint);
          setIsDrawing(true);
        }
      }
    },
    
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      
      if (isDrawing && currentStart) {
        const endPoint: Point = { 
          x: locationX, 
          y: locationY, 
          id: -1
        };
        setCurrentEnd(endPoint);
      }
    },
    
    onPanResponderRelease: (event) => {
      if (isDrawing && currentStart) {
        const { locationX, locationY } = event.nativeEvent;
        const nearestPoint = findNearestPoint(locationX, locationY);
        
        if (nearestPoint && nearestPoint.id !== currentStart.id) {
          const lineExists = gameState.lines.some(line => 
            (line.start.id === currentStart.id && line.end.id === nearestPoint.id) ||
            (line.start.id === nearestPoint.id && line.end.id === currentStart.id)
          );
          
          if (!lineExists) {
            const newLine: LineSegment = { 
              start: currentStart, 
              end: nearestPoint, 
              id: Date.now() 
            };
            
            setGameState(prev => ({
              ...prev,
              lines: [...prev.lines, newLine]
            }));
          }
        }
        
        setIsDrawing(false);
        setCurrentStart(null);
        setCurrentEnd(null);
      }
    }
  });

  const clearCanvas = () => {
    if (gameState.isPlaying) return;
    setGameState(prev => ({ ...prev, lines: [] }));
  };
  
  const removeLastLine = () => {
    if (gameState.isPlaying || gameState.lines.length === 0) return;
    setGameState(prev => ({
      ...prev,
      lines: prev.lines.slice(0, -1)
    }));
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render tutorial phase
  if (gamePhase === 'tutorial') {
    return (
      <GeometryTutorial 
        onComplete={handleTutorialComplete}
        onExit={handleTutorialExit}
      />
    );
  }

  // Render game tutorial popup
  const renderGameTutorial = () => (
    <Modal
      visible={showGameTutorial}
      transparent={true}
      animationType="fade"
      onRequestClose={handleGameTutorialComplete}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tutorialContainer}>
          <View style={styles.tutorialHeader}>
            <Text style={styles.tutorialTitle}>🎮 Hướng dẫn chơi</Text>
          </View>
          
          <View style={styles.tutorialContent}>
            <View style={styles.tutorialStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Tạo điểm:</Text> Chạm vào lưới để đặt các điểm
              </Text>
            </View>
            
            <View style={styles.tutorialStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Vẽ đường:</Text> Kéo từ điểm này đến điểm khác (cần ít nhất 2 điểm)
              </Text>
            </View>
            
            <View style={styles.tutorialStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Thả bóng:</Text> Nhấn &quot;Bắt đầu&quot; để thả bóng từ vị trí ngẫu nhiên
              </Text>
            </View>
            
            <View style={styles.tutorialStep}>
              <Text style={styles.stepNumber}>🎯</Text>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Mục tiêu:</Text> Bóng phải chạm đường thẳng và rơi vào rổ!
              </Text>
            </View>
          </View>
          
          <View style={styles.tutorialFooter}>
            <Text style={styles.hintText}>
              💡 Bóng và rổ không thẳng hàng - hãy suy nghĩ chiến lược!
            </Text>
            
            <TouchableOpacity 
              style={styles.gotItButton}
              onPress={handleGameTutorialComplete}
            >
              <Text style={styles.gotItButtonText}>✅ Đã rõ!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render game phase
  return (
    <SafeAreaView style={styles.container}>
      {/* Render tutorial popup */}
      {renderGameTutorial()}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.gameTitle}>{gameData.title}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Điểm: {gameState.score}</Text>
          <Text style={styles.progressText}>Level {gameState.level}</Text>
        </View>
      </View>

      {/* Instruction - Only show if tutorial hasn't been seen */}
      {!hasSeenGameTutorial && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            🏀 Tạo điểm và vẽ đường thẳng để dẫn bóng vào rổ! Bóng sẽ tự động rơi từ trên xuống.
          </Text>
          <Text style={styles.hintText}>
            💡 Chạm để tạo điểm → Kéo giữa các điểm để vẽ đường → Bắt đầu thả bóng!
          </Text>
        </View>
      )}



      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        <TouchableOpacity 
          style={styles.canvas}
          onPress={handleCanvasPress}
          activeOpacity={1}
          disabled={gameState.isPlaying}
        >
          <View 
            style={styles.canvasContent}
            {...panResponder.panHandlers}
          >
            <Svg width={drawAreaWidth} height={drawAreaHeight} style={styles.svg}>
              {/* Background grid */}
              {Array.from({ length: 21 }).map((_, i) => (
                <React.Fragment key={`grid-${i}`}>
                  <Line
                    x1={0}
                    y1={(i * drawAreaHeight) / 20}
                    x2={drawAreaWidth}
                    y2={(i * drawAreaHeight) / 20}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                  <Line
                    x1={(i * drawAreaWidth) / 20}
                    y1={0}
                    x2={(i * drawAreaWidth) / 20}
                    y2={drawAreaHeight}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                </React.Fragment>
              ))}
              
              {/* Draw points */}
              {gameState.points.map((point: Point) => (
                <Circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r={POINT_RADIUS}
                  fill={currentStart && currentStart.id === point.id ? "#e74c3c" : "#3498db"}
                  stroke={gameState.points.length >= 2 ? "#2c3e50" : "#2980b9"}
                  strokeWidth="2"
                />
              ))}
              
              {/* Draw basket */}
              <React.Fragment>
                {/* Basket base */}
                <Line
                  x1={gameState.basket.x}
                  y1={gameState.basket.y + gameState.basket.height}
                  x2={gameState.basket.x + gameState.basket.width}
                  y2={gameState.basket.y + gameState.basket.height}
                  stroke="#8B4513"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Basket left side */}
                <Line
                  x1={gameState.basket.x}
                  y1={gameState.basket.y}
                  x2={gameState.basket.x}
                  y2={gameState.basket.y + gameState.basket.height}
                  stroke="#8B4513"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Basket right side */}
                <Line
                  x1={gameState.basket.x + gameState.basket.width}
                  y1={gameState.basket.y}
                  x2={gameState.basket.x + gameState.basket.width}
                  y2={gameState.basket.y + gameState.basket.height}
                  stroke="#8B4513"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Basket net effect */}
                <Line
                  x1={gameState.basket.x + 10}
                  y1={gameState.basket.y + 5}
                  x2={gameState.basket.x + 10}
                  y2={gameState.basket.y + 15}
                  stroke="#228B22"
                  strokeWidth="2"
                />
                <Line
                  x1={gameState.basket.x + 20}
                  y1={gameState.basket.y + 5}
                  x2={gameState.basket.x + 20}
                  y2={gameState.basket.y + 15}
                  stroke="#228B22"
                  strokeWidth="2"
                />
                <Line
                  x1={gameState.basket.x + 30}
                  y1={gameState.basket.y + 5}
                  x2={gameState.basket.x + 30}
                  y2={gameState.basket.y + 15}
                  stroke="#228B22"
                  strokeWidth="2"
                />
                <Line
                  x1={gameState.basket.x + 40}
                  y1={gameState.basket.y + 5}
                  x2={gameState.basket.x + 40}
                  y2={gameState.basket.y + 15}
                  stroke="#228B22"
                  strokeWidth="2"
                />
                <Line
                  x1={gameState.basket.x + 50}
                  y1={gameState.basket.y + 5}
                  x2={gameState.basket.x + 50}
                  y2={gameState.basket.y + 15}
                  stroke="#228B22"
                  strokeWidth="2"
                />
              </React.Fragment>
              
              {/* Draw lines */}
              {gameState.lines.map((line: LineSegment) => (
                <Line
                  key={line.id}
                  x1={line.start.x}
                  y1={line.start.y}
                  x2={line.end.x}
                  y2={line.end.y}
                  stroke="#27ae60"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              ))}
              
              {/* Draw current line being drawn */}
              {isDrawing && currentStart && currentEnd && (
                <Line
                  x1={currentStart.x}
                  y1={currentStart.y}
                  x2={currentEnd.x}
                  y2={currentEnd.y}
                  stroke="#e74c3c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="10,5"
                />
              )}
            </Svg>
            
            {/* Ball */}
            {gameState.ball && (
              <Animated.View
                style={[
                  styles.ball,
                  {
                    left: gameState.ball.x - BALL_RADIUS,
                    top: gameState.ball.y - BALL_RADIUS,
                  },
                  ballCollisionEffect && styles.ballCollisionEffect
                ]}
              >
                <View style={styles.ballInner} />
                {ballCollisionEffect && (
                  <View style={styles.collisionRing} />
                )}
                {debugMode && (
                  <View style={styles.debugCollisionRadius} />
                )}
              </Animated.View>
            )}
            
            {gameState.points.length === 0 && (
              <Text style={styles.canvasHint}>
                Chạm vào màn hình để tạo điểm!
              </Text>
            )}
            
            {gameState.points.length === 1 && (
              <Text style={styles.canvasHint}>
                Tạo thêm điểm để có thể vẽ đường thẳng!
              </Text>
            )}
            
            {gameState.points.length >= 2 && gameState.lines.length === 0 && (
              <Text style={styles.canvasHint}>
                Kéo từ một điểm đến điểm khác để vẽ đường thẳng!
              </Text>
            )}
            
            {gameState.points.length >= 2 && gameState.lines.length > 0 && !gameState.isPlaying && (
              <Text style={styles.canvasHint}>
                Nhấn &quot;Bắt đầu&quot; để thả bóng xuống!
              </Text>
            )}
            
            {debugMode && gameState.ball && (
              <Text style={styles.debugInfo}>
                Velocity: X={gameState.ball.velocityX.toFixed(2)}, Y={gameState.ball.velocityY.toFixed(2)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.clearButton]}
          onPress={removeLastLine}
          disabled={gameState.isPlaying || gameState.lines.length === 0}
        >
          <Text style={styles.controlButtonText}>↶ Hoàn tác</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.clearButton]}
          onPress={clearCanvas}
          disabled={gameState.isPlaying || gameState.lines.length === 0}
        >
          <Text style={styles.controlButtonText}>🗑️ Xóa hết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]}
          onPress={startGameLoop}
          disabled={gameState.isPlaying || gameState.points.length === 0}
        >
          <Text style={styles.controlButtonText}>
            {gameState.isPlaying ? '⏸️ Đang chơi' : '▶️ Bắt đầu'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Game Info and Help Button */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Điểm: {gameState.points.length}{gameState.points.length < 2 ? ' (cần ít nhất 2)' : ''}</Text>
        <Text style={styles.infoText}>Đường: {gameState.lines.length}</Text>
        <Text style={styles.infoText}>
          Bóng: {gameState.ball ? (gameState.ball.hasHitLine ? '✅ Đã chạm' : '❌ Chưa chạm') : '🏀 Sẵn sàng'}
        </Text>
        
        {hasSeenGameTutorial && (
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowGameTutorial(true)}
          >
            <Text style={styles.helpButtonText}>❓</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.helpButton, debugMode && styles.debugActive]}
          onPress={() => setDebugMode(!debugMode)}
        >
          <Text style={styles.helpButtonText}>🐛</Text>
        </TouchableOpacity>
      </View>

      {/* Exit Button */}
      <TouchableOpacity 
        style={styles.exitButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.exitButtonText}>🚪 Thoát</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  scoreText: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  instructionContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },

  drawingArea: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  canvas: {
    width: drawAreaWidth,
    height: drawAreaHeight,
    borderRadius: 10,
  },
  canvasContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  canvasHint: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 12,
    color: '#e74c3c',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 5,
  },
  ball: {
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballInner: {
    width: BALL_RADIUS,
    height: BALL_RADIUS,
    borderRadius: BALL_RADIUS / 2,
    backgroundColor: '#c0392b',
  },
  ballCollisionEffect: {
    transform: [{ scale: 1.2 }],
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  collisionRing: {
    position: 'absolute',
    width: BALL_RADIUS * 3,
    height: BALL_RADIUS * 3,
    borderRadius: BALL_RADIUS * 1.5,
    borderWidth: 3,
    borderColor: '#f39c12',
    backgroundColor: 'transparent',
    top: -BALL_RADIUS * 0.5,
    left: -BALL_RADIUS * 0.5,
    opacity: 0.7,
  },
  debugCollisionRadius: {
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    borderWidth: 1,
    borderColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    top: 0,
    left: 0,
  },
  debugActive: {
    backgroundColor: '#e74c3c',
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  startButton: {
    backgroundColor: '#f39c12',
  },
  playButton: {
    backgroundColor: '#27ae60',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  helpButton: {
    backgroundColor: '#f39c12',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  helpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#34495e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tutorialHeader: {
    backgroundColor: '#3498db',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tutorialContent: {
    padding: 20,
  },
  tutorialStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    backgroundColor: '#e74c3c',
    color: 'white',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  tutorialFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  gotItButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gotItButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});