import ComicPreviewCard from "@/src/components/ComicPreviewCard";
import Typography from "@/src/components/Typography";
import useScreenType from "@/src/hooks/useScreenType";
import useLibraryStore from "@/src/store/useLibraryStore";
import useBookmarksStore from "@/src/store/useBookmarksStore";
import useSettingsStore from "@/src/store/useSettingsStore";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";

export default function Bookmarks() {
  const libraryStoreComics = useLibraryStore((state) => state.comics);
  const bookmarkComics = useBookmarksStore((state) => state.comicIds);
  const { styles, theme } = useStyles(stylesheet);
  const settingsStore = useSettingsStore((state) => state.settings);
  const colorScheme = useColorScheme();
  const { isMobile } = useScreenType();
  const { top, bottom } = useSafeAreaInsets();

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const comics = React.useMemo(
    () => libraryStoreComics.filter(({ id }) => bookmarkComics.includes(id)),
    [libraryStoreComics, bookmarkComics]
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" && settingsStore.progressiveBlursEnabled ? (
        <BlurView
          intensity={24}
          tint={themeMode === "light" ? "systemThickMaterialLight" : undefined}
          style={[
            styles.blurView,
            {
              top: 0,
              height: top + 12,
            },
          ]}
        />
      ) : null}
      <View style={styles.content}>
        <FlashList
          data={comics}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => (
            <ComicPreviewCard comic={item} showProgress />
          )}
          numColumns={2}
          estimatedItemSize={380}
          contentContainerStyle={{
            paddingTop: isMobile ? top + 12 : 54,
            paddingBottom: isMobile ? bottom + 100 : 150,
            paddingHorizontal: theme.margins["2xl"],
          }}
          ListEmptyComponent={<Typography>No files</Typography>}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.margins["2xl"] }} />
          )}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <Typography size="3xl" fontWeight="900">
                Your
              </Typography>
              <Typography size="3xl" fontWeight="900">
                Bookmarks
              </Typography>
            </View>
          }
        />
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignSelf: "center",
    width: {
      [mq.only.width(0, 480)]: "100%",
      [mq.only.width(480, 768)]: "75%",
      [mq.only.width(768, 1024)]: "70%",
      [mq.only.width(1024, 1440)]: 720,
      [mq.only.width(1440)]: 920,
    },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  blurView: {
    position: "absolute",
    left: 0,
    width: "100%",
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: {
      [mq.only.width(0, 480)]: 32,
      [mq.only.width(480, 768)]: "6.25%",
      [mq.only.width(768, 1024)]: "7.5%",
      [mq.only.width(1024, 1440)]: (UnistylesRuntime.screen.width - 720) * 0.2,
      [mq.only.width(1440)]: (UnistylesRuntime.screen.width - 920) * 0.35,
    },
  },
}));
