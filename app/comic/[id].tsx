import { View, StyleSheet, Button } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import Gallery, { RenderItemInfo } from "react-native-awesome-gallery";
import useLibraryStore from "@/src/store/useLibraryStore";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/src/components/Typography";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XMLParser } from "fast-xml-parser";
import useReadingNowStore from "@/src/store/useReadingNowStore";

const renderItem = ({ item, setImageDimensions }: RenderItemInfo<string>) => {
  return (
    <Image
      source={item}
      style={StyleSheet.absoluteFillObject}
      contentFit="contain"
      onLoad={(e) => {
        const { width, height } = e.source;
        setImageDimensions({ width, height });
      }}
    />
  );
};

export default function Comic() {
  const { styles, theme } = useStyles(stylesheet);
  const libraryStore = useLibraryStore();
  const readingNowStore = useReadingNowStore();
  const params = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const currentPage = React.useRef(0);

  const comic = React.useMemo(
    () => libraryStore.comics.find(({ id }) => id === params.id),
    [libraryStore.comics, params.id]
  );

  React.useEffect(() => {
    readingNowStore.updateReadingNow(params.id);
    return () => {
      libraryStore.updateCurrentPage(params.id, currentPage.current);
    };
  }, [params.id]);

  if (!comic) {
    return (
      <View>
        <Typography>Not found</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.top,
          {
            paddingTop: top + 12,
          },
        ]}
      >
        <Button title="Back" onPress={router.back} />
      </View>
      <Gallery
        data={comic.pages}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        onSwipeToClose={router.back}
        numToRender={3}
        initialIndex={comic.currentPage - 1}
        onIndexChange={(index) => {
          currentPage.current = index + 1;
        }}
      />
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.highContrastReadingBackground,
  },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 3,
  },
}));
