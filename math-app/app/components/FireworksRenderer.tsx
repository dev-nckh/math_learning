import React from 'react';
import { Text, Animated, Dimensions } from 'react-native';
import { styles } from '../styles/styles';

const { width, height } = Dimensions.get('window');

interface FireworksRendererProps {
  showFireworks: boolean;
  fireworksAnim: Animated.Value[];
}

const FireworksRenderer: React.FC<FireworksRendererProps> = ({ 
  showFireworks, 
  fireworksAnim 
}) => {
  if (!showFireworks) return null;
  
  return (
    <>
      {fireworksAnim.map((anim, index) => {
        const size = Math.random() * 50 + 30;
        const emojis = ['🎉', '✨', '🌟', '🎊', '🎈', '🎁', '💫', '⭐️'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const scaleValue = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.5]
        });
        
        const rotateValue = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        });
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.firework,
              {
                left: Math.random() * width,
                top: Math.random() * (height * 0.5),
                width: size,
                height: size,
                transform: [
                  { scale: scaleValue },
                  { rotate: rotateValue }
                ],
                opacity: anim
              }
            ]}
          >
            <Text style={[styles.fireworkText, { fontSize: size * 0.8 }]}>{randomEmoji}</Text>
          </Animated.View>
        );
      })}
    </>
  );
};

export default FireworksRenderer;