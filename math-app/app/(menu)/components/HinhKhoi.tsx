// components/HinhKhoi.tsx
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useEffect, useRef } from 'react';
import { Dimensions, PanResponder, View } from 'react-native';
import * as THREE from 'three';

interface HinhKhoiProps {
  renderShape: (scene: THREE.Scene) => THREE.Object3D;
  initialRotation?: { x: number; y: number };
}

const HinhKhoi: React.FC<HinhKhoiProps> = ({
  renderShape,
  initialRotation = { x: 0.3, y: 0.3 },
}) => {
  const rotation = useRef({ ...initialRotation });
  const meshRef = useRef<THREE.Object3D | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Kích thước khối ~1/3 màn hình
  const widthScreen = Dimensions.get('window').width;
  const size = Math.floor(widthScreen / 1.3);

  useEffect(() => {
    if (sceneRef.current && meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      const newMesh = renderShape(sceneRef.current);
      meshRef.current = newMesh;
      sceneRef.current.add(newMesh);

      // Áp dụng scale và rotation ban đầu
      if (meshRef.current) {
        meshRef.current.scale.set(3, 3, 3);
        meshRef.current.rotation.x = rotation.current.x;
        meshRef.current.rotation.y = rotation.current.y;
      }
    }
  }, [renderShape]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (meshRef.current) {
          rotation.current.y += gesture.dx * 0.01;
          rotation.current.x += gesture.dy * 0.01;
          meshRef.current.rotation.y = rotation.current.y;
          meshRef.current.rotation.x = rotation.current.x;
        }
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        width: size,
        height: size,
        alignSelf: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <GLView
        style={{ flex: 1 }}
        onContextCreate={async (gl) => {
          const scene = new THREE.Scene();
          sceneRef.current = scene;
          const camera = new THREE.PerspectiveCamera(
            75,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
          );
          camera.position.z = 6;

          const renderer = new Renderer({ gl }) as any;
          renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

          // Ánh sáng
          const light1 = new THREE.DirectionalLight(0xffffff, 1);
          light1.position.set(5, 5, 5);
          scene.add(light1);

          const light2 = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(light2);

          // Tạo hình khối
          const mesh = renderShape(scene);
          meshRef.current = mesh;
          mesh.scale.set(3, 3, 3); 
          mesh.rotation.x = rotation.current.x;
          mesh.rotation.y = rotation.current.y;
          scene.add(mesh);

          // Render loop
          const render = () => {
            renderer.render(scene, camera);
            gl.endFrameEXP();
            requestAnimationFrame(render);
          };
          render();
        }}
      />
    </View>
  );
};

export default HinhKhoi;