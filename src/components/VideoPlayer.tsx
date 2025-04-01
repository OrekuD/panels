import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnimations } from "@react-native-media-console/reanimated";
import MediaConsoleVideoPlayer from "react-native-media-console";
import { useNavigation } from "@react-navigation/native";
import RNVideoPlayer from "react-native-video-player";

interface Props {
  isVisible: boolean;
  videos: string[];
  onClose: () => void;
  startIndex?: number;
  setSlideIndex?: React.Dispatch<React.SetStateAction<number>>;
  backdropColor?: string;
}

export default function VideoPlayer(props: Props) {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();

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
        {/* <MediaConsoleVideoPlayer
          useAnimations={useAnimations}
          source={{ uri: "https://vjs.zencdn.net/v/oceans.mp4" }}
          navigator={navigation}
          onBack={props.onClose}
        /> */}
        <RNVideoPlayer
          endWithThumbnail
          autoplay
          thumbnail={{
            uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
          }}
          source={{
            uri: "https://vjs.zencdn.net/v/oceans.mp4",
          }}
          // onError={(e) => console.log(e)}
          showDuration={true}
          style={styles.videoPlayer}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    // alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
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
  videoPlayer: {
    width: "100%",
    // height: "100%",
  },
});
