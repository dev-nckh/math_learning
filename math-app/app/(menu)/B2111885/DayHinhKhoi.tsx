// DayHinhKhoi.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as THREE from 'three';
import HinhKhoi from '../components/HinhKhoi';

const createTransparentMaterial = (color: number) => {
  return new THREE.MeshPhongMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,
    specular: 0x111111,
    shininess: 30
  });
};

// Ví dụ cho từng hình khối:
const HINH_KHOI_LIST = [
  {
    name: 'Hình lập phương',
    desc: 'Hình lập phương là khối có 6 mặt đều là hình vuông bằng nhau.',
    renderShape: () => {
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
      const materials = colors.map(color =>
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
    },
    initialRotation: { x: 0.3, y: 0.3 }
  },
  {
    name: 'Hình hộp chữ nhật',
    desc: 'Hình hộp chữ nhật có 6 mặt là hình chữ nhật.',
    renderShape: () => {
      const colors = [0x2196f3, 0x4caf50, 0xff9800, 0xe91e63, 0x9c27b0, 0x607d8b];
      const materials = colors.map(color =>
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      return new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.7), materials);
    },
    initialRotation: { x: 0, y: 0.3 } // Chỉ nghiêng theo trục Y
  },
  {
    name: 'Hình trụ',
    desc: 'Hình trụ có hai đáy là hình tròn và một mặt cong.',
    renderShape: () => {
      const colors = [0xff9800, 0x2196f3, 0x4caf50];
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
    const colors = [0xe91e63, 0x2196f3, 0x4caf50, 0xff9800]; // 4 mặt bên
    const baseColor = 0x9c27b0; // màu đáy

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
    desc: 'Hình cầu là hình tròn 3D, mọi điểm trên mặt đều cách tâm một khoảng bằng nhau.',
    renderShape: () => {
      // Hình cầu mịn
      const material = new THREE.MeshPhongMaterial({
        color: 0x9c27b0,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), material);

      // Hình tròn chia đôi (ở xích đạo)
      const circleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      const circle = new THREE.Mesh(new THREE.CircleGeometry(0.7, 64), circleMaterial);
      circle.rotation.x = Math.PI / 2; // Đặt nằm ngang

      // Gom lại thành 1 group
      const group = new THREE.Group();
      group.add(sphere);
      group.add(circle);

      return group;
    }
  },
];

const DayHinhKhoi = () => {
  const [index, setIndex] = useState(0);
  const currentShape = HINH_KHOI_LIST[index];

  return (
    <View style={styles.container}>
      <View style={styles.shapeContainer}>
        <HinhKhoi 
          renderShape={() => currentShape.renderShape()} 
          initialRotation={currentShape.initialRotation} 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{currentShape.name}</Text>
        <Text style={styles.description}>{currentShape.desc}</Text>
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
    backgroundColor: '#fff',
  },
  shapeContainer: {
    height: '50%',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  textContainer: {
    height: '30%',
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#2196f3',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DayHinhKhoi;