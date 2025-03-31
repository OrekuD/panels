import ComicPreviewCard from "@/src/components/ComicPreviewCard";
import Typography from "@/src/components/Typography";
import useScreenType from "@/src/hooks/useScreenType";
import useCollectionsStore from "@/src/store/useCollectionsStore";
import useSettingsStore from "@/src/store/useSettingsStore";
import webDropdownStyleSheet from "@/src/styles/webDropdownStyleSheet";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
// import { unzip } from "react-native-zip-archive";
import * as DropdownMenu from "zeego/dropdown-menu";
import { Comic } from "@/src/types";
import stripFileExtension from "@/src/utils/stripFileExtension";
import uuid from "@/src/utils/uuid";
import useLibraryStore from "@/src/store/useLibraryStore";

export default function Collection() {
  const collectionsStore = useCollectionsStore();
  const params = useLocalSearchParams<{ id: string }>();
  const { styles, theme } = useStyles(stylesheet);
  const settingsStore = useSettingsStore((state) => state.settings);
  const colorScheme = useColorScheme();
  const { isMobile } = useScreenType();
  const { top, bottom } = useSafeAreaInsets();
  const { styles: webStyles } = useStyles(webDropdownStyleSheet);
  const libraryStore = useLibraryStore();
  const router = useRouter();

  const collection = React.useMemo(() => {
    const item = collectionsStore.collections.find(
      ({ id }) => id === params.id
    );

    if (!item)
      return {
        collection: null,
        comics: [],
      };

    const comics = libraryStore.comics.filter(({ id }) =>
      item.comics.includes(id)
    );

    return {
      collection: item,
      comics,
    };
  }, [params.id, collectionsStore.collections]);

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const pickFile = React.useCallback(async () => {
    if (!collection.collection) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({});

      if (result.canceled || !result.assets.length) {
        return;
      }

      const targetPath =
        FileSystem.documentDirectory + "comics/unzip/" + uuid();
      // const unzipped = await unzip(result.assets[0].uri, targetPath);

      // if (unzipped) {
      //   let files = await FileSystem.readDirectoryAsync(unzipped);

      //   if (files.length === 0) return;
      //   files = files.filter((file) => !file.endsWith(".xml"));
      //   files.sort();

      //   const fileUrls = files.map((file) => `${unzipped}/${file}`);
      //   const comic: Comic = {
      //     createdAt: new Date().toUTCString(),
      //     id: uuid(),
      //     pages: fileUrls,
      //     title: stripFileExtension(result.assets[0].name),
      //     size: result.assets[0].size || -1,
      //     currentPage: 0,
      //   };
      //   libraryStore.addComic(comic);
      //   collectionsStore.addComicsToCollection(collection.collection.id, [
      //     comic.id,
      //   ]);
      //   Alert.alert(
      //     "Success",
      //     "File imported successfully. You can find it in your library and has been added to this collection."
      //   );
      // }
    } catch (error) {
      Alert.alert("Error", "An error occurred while importing the file.");
    }
  }, [collection.collection]);

  if (!collection?.collection) {
    return (
      <View>
        <Typography>Collection not found</Typography>
      </View>
    );
  }

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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <View style={styles.addComic}>
                <Entypo name="plus" size={24} color={theme.colors.typography} />
              </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              style={webStyles.dropdownContent}
              align="end"
              alignOffset={-8}
              sideOffset={6}
            >
              <DropdownMenu.Group>
                <DropdownMenu.Item
                  key="add"
                  style={webStyles.dropdownCheckboxItem}
                  onSelect={() =>
                    router.push(`/select-comic/${collection.collection.id}`)
                  }
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    Add from library
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                    add comics from your library
                  </DropdownMenu.ItemSubtitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: "book",
                    }}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  key="import"
                  style={webStyles.dropdownCheckboxItem}
                  onSelect={pickFile}
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    Import files
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                    import new files into this collection
                  </DropdownMenu.ItemSubtitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: "tray.and.arrow.down",
                    }}
                  />
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <View style={styles.addComic}>
                <Entypo name="plus" size={24} color={theme.colors.typography} />
              </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              style={webStyles.dropdownContent}
              align="end"
              alignOffset={-8}
              sideOffset={6}
            >
              <DropdownMenu.Group>
                <DropdownMenu.Item
                  key="import"
                  style={webStyles.dropdownCheckboxItem}
                  onSelect={pickFile}
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    Import files
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                    import new files into this collection
                  </DropdownMenu.ItemSubtitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: "tray.and.arrow.down",
                    }}
                  />
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  key="s"
                  style={webStyles.dropdownCheckboxItem}
                  onSelect={pickFile}
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    Import files
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                    import new files into this collection
                  </DropdownMenu.ItemSubtitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: "tray.and.arrow.down",
                    }}
                  />
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </View>
      )}
      <View style={styles.content}>
        <FlashList
          data={collection.comics}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => <ComicPreviewCard comic={item} />}
          numColumns={2}
          estimatedItemSize={380}
          contentContainerStyle={{
            paddingTop: isMobile ? top + 12 : 54,
            paddingBottom: isMobile ? bottom + 100 : 150,
            paddingHorizontal: theme.margins["2xl"],
          }}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Typography
                size="md"
                fontWeight="500"
                style={{
                  textAlign: "center",
                }}
              >
                You don't have any comics in this collection.
              </Typography>
            </View>
          }
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.margins["2xl"] }} />
          )}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <Typography size="3xl" fontWeight="900">
                {collection.collection.name}
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
  emptyView: {
    paddingTop: 140,
    paddingHorizontal: theme.margins["2xl"],
    alignItems: "center",
  },
  addComic: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: theme.colors.secondaryButtonBackgroundColor,
    zIndex: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
  },
}));
