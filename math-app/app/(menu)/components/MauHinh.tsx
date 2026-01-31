import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MauHinhProps = {
  mauList: any[]; // mảng require ảnh mẫu
  onSelect?: (img: any) => void;
  width?: number;
  height?: number;
};

const MauHinh = ({ mauList, onSelect, width = 110, height = 56 }: MauHinhProps) => {
  // Chỉ chọn ngẫu nhiên 1 lần khi mount
  const [currentMau, setCurrentMau] = useState<any>(
    mauList.length > 0 ? mauList[Math.floor(Math.random() * mauList.length)] : null
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Gọi onSelect khi mount hoặc khi chọn mẫu mới
  useEffect(() => {
    if (currentMau && onSelect) onSelect(currentMau);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMau]);

  const handleSelect = (img: any) => {
    setCurrentMau(img);
    setModalVisible(false);
    // onSelect sẽ được gọi qua useEffect ở trên
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Image
          source={currentMau}
          style={{ width, height, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Mẫu ví dụ</Text>
            <FlatList
              data={mauList}
              numColumns={3}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.gridItem}>
                  <Image source={item} style={styles.gridImage} resizeMode="cover" />
                </TouchableOpacity>
              )}
              contentContainerStyle={{ alignItems: 'center' }}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: '#ff9800', fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 320, maxHeight: 420
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  gridItem: { margin: 8 },
  gridImage: { width: 80, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  closeBtn: { marginTop: 12, alignSelf: 'center', padding: 8 }
});

export default MauHinh;