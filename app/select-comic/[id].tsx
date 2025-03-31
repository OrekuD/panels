import { View, Platform, TouchableOpacity, useColorScheme } from "react-native";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";
import useLibraryStore from "@/src/store/useLibraryStore";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/src/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import ComicSelectionPreviewCard from "@/src/components/ComicSelectionPreviewCard";
import useScreenType from "@/src/hooks/useScreenType";
import useSettingsStore from "@/src/store/useSettingsStore";
import { BlurView } from "expo-blur";
import useCollectionsStore from "@/src/store/useCollectionsStore";

export default function SelectComic() {
  const { styles, theme } = useStyles(stylesheet);
  const libraryStore = useLibraryStore();
  const collectionsStore = useCollectionsStore();
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isMobile } = useScreenType();
  const { top, bottom } = useSafeAreaInsets();
  const [selectedComicIds, setSelectedComicIds] = React.useState<Array<string>>(
    []
  );
  const settingsStore = useSettingsStore((state) => state.settings);
  const colorScheme = useColorScheme();

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const collection = React.useMemo(
    () => collectionsStore.collections.find(({ id }) => id === params.id),
    [params.id, collectionsStore.collections]
  );

  const addComics = React.useCallback(() => {
    if (selectedComicIds.length === 0) return;

    collectionsStore.addComicsToCollection(params.id, selectedComicIds);
    router.back();
  }, [selectedComicIds, params.id]);

  const comics = React.useMemo(() => {
    if (!collection) return [];

    return libraryStore.comics.filter(({ id }) => {
      const index = collection.comics.findIndex((comicId) => comicId === id);
      return index === -1;
    });
  }, [libraryStore.comics, collection?.comics]);

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" && settingsStore.progressiveBlursEnabled ? (
        <BlurView
          intensity={24}
          tint={themeMode === "light" ? "systemThickMaterialLight" : undefined}
          style={[
            styles.blurView,
            {
              bottom: 0,
              height: bottom + 68,
              paddingBottom: bottom + 24,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.select,
              {
                opacity: selectedComicIds.length === 0 ? 0.5 : 1,
              },
            ]}
            onPress={addComics}
            disabled={selectedComicIds.length === 0}
          >
            <Typography size="lg" fontWeight="600">
              Select
            </Typography>
          </TouchableOpacity>
        </BlurView>
      ) : (
        <View
          style={[
            styles.blurView,
            {
              bottom: 0,
              minHeight: bottom + 68,
              paddingBottom: isMobile ? bottom + 24 : 70,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.select,
              {
                opacity: selectedComicIds.length === 0 ? 0.5 : 1,
              },
            ]}
            onPress={addComics}
            disabled={selectedComicIds.length === 0}
          >
            <Typography size="lg" fontWeight="600">
              Select
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={[
          styles.innerContainer,
          Platform.OS === "web"
            ? styles.webContainer
            : {
                flex: 1,
              },
        ]}
      >
        <View style={styles.knob} />
        <View style={styles.flatlist}>
          <FlashList
            data={comics}
            keyExtractor={({ id }) => id}
            extraData={selectedComicIds}
            renderItem={({ item }) => {
              const isSelected = selectedComicIds.includes(item.id);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedComicIds((prevValues) =>
                        prevValues.filter((id) => id !== item.id)
                      );
                    } else {
                      setSelectedComicIds((prevValues) => [
                        ...prevValues,
                        item.id,
                      ]);
                    }
                  }}
                >
                  <ComicSelectionPreviewCard
                    comic={item}
                    isSelected={isSelected}
                  />
                </TouchableOpacity>
              );
            }}
            numColumns={2}
            estimatedItemSize={380}
            contentContainerStyle={{
              paddingBottom: isMobile ? bottom + 100 : 150,
              paddingHorizontal: theme.margins["2xl"],
            }}
            ListEmptyComponent={<Typography>No files</Typography>}
            scrollEventThrottle={16}
            ItemSeparatorComponent={() => (
              <View style={{ height: theme.margins["2xl"] }} />
            )}
          />
        </View>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
  },
  innerContainer: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  webContainer: {
    width: {
      [mq.only.width(0, 480)]: UnistylesRuntime.screen.width - 32,
      [mq.only.width(480, 768)]: UnistylesRuntime.screen.width * 0.8,
      [mq.only.width(768, 1024)]: UnistylesRuntime.screen.width * 0.75,
      [mq.only.width(1024, 1440)]: 740,
      [mq.only.width(1440)]: 940,
    },
    height: {
      [mq.only.width(0, 480)]: UnistylesRuntime.screen.height * 0.9,
      [mq.only.width(480)]: UnistylesRuntime.screen.height * 0.9,
    },
    alignSelf: "center",
    marginVertical: "auto",
    borderRadius: 12,
  },
  flatlist: {
    flex: 1,
    paddingTop: 44,
    paddingBottom: 60,
  },
  knob: {
    width: 44,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gray200,
    alignSelf: "center",
    position: "absolute",
    transform: [{ translateX: -22 }],
    left: "50%",
    top: 6,
    zIndex: 10,
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
  select: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 14,
    backgroundColor: theme.colors.cardBackground,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
}));
