// DayHinhKhoi.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as THREE from 'three';
import HinhKhoi from '../components/HinhKhoi';
import BackButton from '../components/backButton';
import Music from '../components/music';

const SHAPE_IMAGES = [
  require('../../../assets/images/B2111885/HinhLapPhuong.png'),
  require('../../../assets/images/B2111885/HinhHop.png'),
  require('../../../assets/images/B2111885/HinhTru.png'),
  require('../../../assets/images/B2111885/HinhChop.png'),
  require('../../../assets/images/B2111885/HinhCau.png'),
];


// Ví dụ cho từng hình khối:
const HINH_KHOI_LIST = [
  {
    name: 'Hình lập phương',
    desc: 'Hình lập phương là khối có 6 mặt đều là hình vuông bằng nhau.',
    renderShape: () => {
      const colors = [
        0xff6666, // đỏ
        0xffb366, // cam
        0xffff99, // vàng
        0x99cc99, // xanh lá
        0x99e6ff, // xanh dương
        0xcc99ff  // tím
      ];
      const materials = colors.map(color =>
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
    },
    initialRotation: { x: 0.3, y: 0.3 }
  },
  {
    name: 'Hình hộp chữ nhật',
    desc: 'Hình hộp chữ nhật có 4 mặt là hình chữ nhật và có 2 mặt đáy là hình chữ vuông.',
    renderShape: () => {
      const colors = [
        0xff6666, // đỏ
        0xffb366, // cam
        0xffff99, // vàng
        0x99cc99, // xanh lá
        0x99e6ff, // xanh dương
        0xcc99ff  // tím
      ];
      const materials = colors.map(color =>
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      return new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1), materials);
    },
    initialRotation: { x: 0, y: 0.3 } // Chỉ nghiêng theo trục Y
  },
  {
    name: 'Hình trụ',
    desc: 'Hình trụ có hai đáy là hình tròn và mặt bên là một hình chữ nhật to được uốn cong.',
    renderShape: () => {
      const colors = [
        0xff6666, // mặt đáy 1 (đỏ)
        0xffb366, // mặt cong (cam)
        0xffff99  // mặt đáy 2 (vàng)
      ];
      const materials = colors.map(color =>
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.5, 32, 1, false),
        [materials[0], materials[1], materials[2]]
      );
    }
  },
{
  name: 'Hình chóp nhọn',
  desc: 'Hình chóp nhọn có đáy là hình vuông và các mặt bên là tam giác.',
  renderShape: () => {
    const colors = [
      0xff6666, // đỏ
      0xcc99ff, // cam
      0xffff99, // vàng
      0x99e6ff  // xanh dương
    ];// 4 mặt bên
    const baseColor = 0xffb366; // màu đáy

    const group = new THREE.Group();

    // Tạo 4 mặt bên (tam giác)
    const height = 1.2;
    const radius = 0.7;
    const vertices = [];
    for (let i = 0; i < 4; i++) {
      const angle1 = (i / 4) * Math.PI * 2;
      const angle2 = ((i + 1) / 4) * Math.PI * 2;
      const v0 = new THREE.Vector3(0, height / 2, 0); // đỉnh
      const v1 = new THREE.Vector3(Math.cos(angle1) * radius, -height / 2, Math.sin(angle1) * radius);
      const v2 = new THREE.Vector3(Math.cos(angle2) * radius, -height / 2, Math.sin(angle2) * radius);

      const geometry = new THREE.BufferGeometry().setFromPoints([v0, v1, v2]);
      geometry.setIndex([0, 1, 2]);
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhongMaterial({ color: colors[i], transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      vertices.push(v1);
    }

    // Tạo mặt đáy (hình vuông)
    const baseGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
    baseGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    baseGeometry.computeVertexNormals();
    const baseMaterial = new THREE.MeshPhongMaterial({ color: baseColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(baseMesh);

    return group;
  },
  initialRotation: { x: 0, y: 0.3 }
},
{
  name: 'Hình cầu',
  desc: 'Hình cầu là hình mà ta nhìn mọi hướng đều thấy nó có hình tròn.',
  renderShape: () => {
    // Quả cầu mịn
    const material = new THREE.MeshPhongMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), material);

    // Hình tròn 1 (xích đạo - màu trắng)
    const circleMaterial1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const circle1 = new THREE.Mesh(new THREE.CircleGeometry(0.7, 64), circleMaterial1);
    circle1.rotation.x = Math.PI / 1.7; // Nằm ngang

    // Hình tròn 2 (vuông góc với hình 1 - màu xanh)
    const circleMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x0000ff, // xanh dương
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const circle2 = new THREE.Mesh(new THREE.CircleGeometry(0.7, 64), circleMaterial2);
    circle2.rotation.y = Math.PI / 2; // Quay vuông góc theo trục Y

    // Gom lại thành group
    const group = new THREE.Group();
    group.add(sphere);
    group.add(circle1);
    group.add(circle2);
    group.rotation.y = Math.PI / 6;  
    group.rotation.x = -Math.PI / 6; 
    return group;
  }
}


];

const ROTATE_STEP = Math.PI / 7.2; // ~25 độ

const DayHinhKhoi = () => {
  const [index, setIndex] = useState(0);
  const currentShape = HINH_KHOI_LIST[index];

  // State điều khiển góc xoay
  const [rotation, setRotation] = useState(
    currentShape.initialRotation || { x: 0, y: 0 }
  );

  // Khi đổi hình, reset lại góc xoay về mặc định của hình đó (nếu có)
  React.useEffect(() => {
    setRotation(currentShape.initialRotation || { x: 0, y: 0 });
  }, [index]);

  return (
    <View style={styles.container}>
      <View
            style={{
              width: "100%",
              flexDirection: "row",          
              justifyContent: "space-between", 
              alignItems: "center",
              marginTop: 20,
              marginBottom: 0,
              paddingHorizontal: 10, 
              zIndex: 1000,
              backgroundColor: '#6021f3ff',
            }}
          >
            <BackButton/>
            <Music list="gameHinh2" />
          </View>

      <View style={styles.shapeContainer}>
        <View style={styles.shape3DWrapper}>
          {/* Nút xoay trái - góc trên trái */}
          <TouchableOpacity
            style={[styles.rotateButton, { left: 10, top: 10 }]}
            onPress={() => setRotation(r => ({ ...r, y: r.y - ROTATE_STEP }))}
          >
            <Text style={styles.rotateButtonText}>←</Text>
          </TouchableOpacity>
          {/* Nút xoay xuống - góc dưới trái */}
          <TouchableOpacity
            style={[styles.rotateButton, { left: 10, bottom: 10 }]}
            onPress={() => setRotation(r => ({ ...r, x: r.x + ROTATE_STEP }))}
          >
            <Text style={styles.rotateButtonText}>↓</Text>
          </TouchableOpacity>
          {/* Nút xoay phải - góc trên phải */}
          <TouchableOpacity
            style={[styles.rotateButton, { right: 10, top: 10 }]}
            onPress={() => setRotation(r => ({ ...r, y: r.y + ROTATE_STEP }))}
          >
            <Text style={styles.rotateButtonText}>→</Text>
          </TouchableOpacity>
          {/* Nút xoay lên - góc dưới phải */}
          <TouchableOpacity
            style={[styles.rotateButton, { right: 10, bottom: 10 }]}
            onPress={() => setRotation(r => ({ ...r, x: r.x - ROTATE_STEP }))}
          >
            <Text style={styles.rotateButtonText}>↑</Text>
          </TouchableOpacity>

          <HinhKhoi
            renderShape={() => currentShape.renderShape()}
            initialRotation={rotation}
          />
        </View>
        <View style={styles.textOverlay}>
          <Text style={styles.title}>{currentShape.name}</Text>
          <Text style={styles.description}>{currentShape.desc}</Text>
        </View>
      </View>

      {/* Hiển thị hình minh họa phía trên các nút điều hướng */}
      <View style={styles.imagePreviewContainer}>
        <Image
          source={SHAPE_IMAGES[index]}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => setIndex(prev => Math.max(0, prev - 1))}
          style={[
            styles.button,
            index === 0 ? styles.disabledButton : styles.activeButton
          ]}
        >
          <Text style={styles.buttonText}>Hình Trước</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={index === HINH_KHOI_LIST.length - 1}
          onPress={() => setIndex(prev => Math.min(HINH_KHOI_LIST.length - 1, prev + 1))}
          style={[
            styles.button,
            index === HINH_KHOI_LIST.length - 1 ? styles.disabledButton : styles.activeButton
          ]}
        >
          <Text style={styles.buttonText}>Hình Sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Giữ nguyên phần styles từ code trước
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  shapeContainer: {
    height: '50%', // Chia 50% chiều cao màn hình
    width: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0, // Không bị đè lên nút back
  },
  shape3DWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  textOverlay: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: 200,
    height: 200,
  },
  navigationContainer: {
    height: '20%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  activeButton: {
    backgroundColor: '#6021f3ff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rotateButton: {
    position: 'absolute',
    backgroundColor: '#6021f3ff',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    opacity: 0.85,
  },
  rotateButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default DayHinhKhoi;