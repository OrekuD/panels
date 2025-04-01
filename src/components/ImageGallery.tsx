import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Modal, TouchableOpacity, Image } from "react-native";
import Gallery from "react-native-awesome-gallery";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  isVisible: boolean;
  images: string[];
  onClose: () => void;
  startIndex?: number;
  setSlideIndex?: React.Dispatch<React.SetStateAction<number>>;
  backdropColor?: string;
}

export default function ImageGallery(props: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <Modal
      visible={props.isVisible}
      transparent
      style={{
        backgroundColor: props?.backdropColor || "#000",
      }}
      animationType="slide"
    >
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.onClose}
          style={{ ...styles.closeButton, top: top }}
        >
          <FontAwesome6 name="xmark" size={24} color="black" />
        </TouchableOpacity>
        <Gallery
          data={props.images}
          onIndexChange={(newIndex) => {
            props?.setSlideIndex?.(newIndex);
          }}
          initialIndex={props.startIndex}
          onSwipeToClose={props.onClose}
          style={{
            backgroundColor: props?.backdropColor || "#000",
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    zIndex: 100,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
