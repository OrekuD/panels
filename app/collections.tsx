import CollectionPreviewCard from "@/src/components/CollectionPreviewCard";
import Typography from "@/src/components/Typography";
import useScreenType from "@/src/hooks/useScreenType";
import useCollectionsStore from "@/src/store/useCollectionsStore";
import useSettingsStore from "@/src/store/useSettingsStore";
import uuid from "@/src/utils/uuid";
import { Entypo, Octicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
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

export default function Collections() {
  const collectionsStore = useCollectionsStore();
  const { styles, theme } = useStyles(stylesheet);
  const settingsStore = useSettingsStore((state) => state.settings);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isMobile } = useScreenType();
  const { top, bottom } = useSafeAreaInsets();

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const createCollection = React.useCallback(() => {
    Alert.prompt(
      "Collection Name",
      "Enter the name of the collection you want to create.",
      [
        {
          text: "Cancel",
          style: "destructive",
        },
        {
          text: "Create",
          onPress: (name) => {
            if (!name || name?.trim() === "") return;
            const id = uuid();
            collectionsStore.addCollection({
              id,
              name,
              comics: [],
              createdAt: new Date().toISOString(),
            });
            router.push(`/collection/${id}`);
          },
        },
      ],
      "plain-text"
    );
  }, []);

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
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addCollection}
            onPress={createCollection}
          >
            <Entypo name="plus" size={24} color={theme.colors.typography} />
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
            style={styles.addCollection}
            onPress={createCollection}
          >
            <Entypo name="plus" size={24} color={theme.colors.typography} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>
        <FlashList
          data={collectionsStore.collections}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => <CollectionPreviewCard collection={item} />}
          numColumns={2}
          estimatedItemSize={380}
          contentContainerStyle={{
            paddingTop: isMobile ? top + 12 : 54,
            paddingBottom: isMobile ? bottom + 100 : 150,
            paddingHorizontal: theme.margins["2xl"],
          }}
          ListEmptyComponent={<Typography>No files</Typography>}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.margins["2xl"] }} />
          )}
          ListHeaderComponent={
            <View style={{ marginBottom: 16 }}>
              <Typography size="3xl" fontWeight="900">
                Your
              </Typography>
              <Typography size="3xl" fontWeight="900">
                Collections
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
  addCollection: {
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
