import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Image, View } from 'react-native';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  label?: string;
  iconColor?: string; // Thêm dòng này
}

const BackButton: React.FC<BackButtonProps> = ({
  style,
  textStyle,
  label = 'Thoát',
  iconColor = '#fff', // Mặc định màu trắng
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => router.back()}>
      <Image
        source={require('../../../assets/icons/back.png')}
        style={[styles.icon, { tintColor: iconColor }]} // Thêm tintColor
        resizeMode="contain"
      />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    paddingLeft:10
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 6,
    tintColor: '#ffffffff',
  },
  text: {
    fontSize: 16,
    color: '#ffffffff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  exitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
});

export default BackButton;