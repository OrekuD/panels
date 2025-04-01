import { Image, TouchableOpacity, View } from "react-native";
import { VaultFile } from "../types";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import React from "react";
import Typography from "./Typography";
import useVaultItemsStore from "../store/useVaultItemsStore";
import ImageGallery from "./ImageGallery";
import VideoPlayer from "./VideoPlayer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function File({
  file,
}: {
  file: VaultFile;
  //   onPress: () => void;
}) {
  const [showImageGallery, setShowImageGallery] = React.useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
  const { styles, theme } = useStyles(stylesheet);
  const files = useVaultItemsStore((state) => state.files);

  const images = React.useMemo(() => {
    if (!file.parentId) {
      return files
        .filter(({ parentId, type }) => !parentId && type === "image")
        .map(({ uri }) => uri);
    } else {
      return files
        .filter(
          ({ parentId, type }) => parentId === file.parentId && type === "image"
        )
        .map(({ uri }) => uri);
    }
  }, [file.parentId, files]);

  const fileImageIndex = React.useMemo(() => {
    return images.findIndex((uri) => uri === file.uri);
  }, [images, file.uri]);

  if (file.type === "image") {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.container}
          onPress={() => {
            setShowImageGallery(true);
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1742403949587-42a767b9ea5b?q=80&w=200",
            }}
            style={styles.imagePreview}
            //   contentFit="cover"
          />
          <View style={styles.fileNameContainer}>
            <Typography
              numberOfLines={1}
              size="xs"
              color="white"
              ellipsizeMode="middle"
            >
              {file.name}
            </Typography>
          </View>
        </TouchableOpacity>
        <ImageGallery
          // images={images}
          // startIndex={fileImageIndex}
          images={[
            "https://images.unsplash.com/photo-1742403949587-42a767b9ea5b?q=80&w=400",
          ]}
          isVisible={showImageGallery}
          onClose={() => setShowImageGallery(false)}
        />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.container}
        onPress={() => {
          setShowVideoPlayer(true);
        }}
      >
        {file.thumbnail ? (
          <Image
            source={{
              uri: file.thumbnail,
            }}
            style={styles.imagePreview}
          />
        ) : (
          <View style={styles.folderIconContainer}>
            <MaterialCommunityIcons
              name="file-image-remove-outline"
              size={16}
              color={theme.colors.typography}
            />
          </View>
        )}
        <View style={styles.fileNameContainer}>
          <Typography
            numberOfLines={1}
            size="xs"
            color="white"
            ellipsizeMode="middle"
          >
            {file.name}
          </Typography>
        </View>
      </TouchableOpacity>
      <VideoPlayer
        videos={[]}
        startIndex={fileImageIndex}
        isVisible={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
      />
    </>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 6,
    width: theme.previewSize,
    height: theme.previewSize,
    backgroundColor: "#121212",
  },
  imagePreview: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fileNameContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  folderIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
  },
}));
