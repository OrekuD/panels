import CollectionPreviewCard from "@/src/components/CollectionPreviewCard";
import Typography from "@/src/components/Typography";
import useScreenType from "@/src/hooks/useScreenType";
import useCollectionsStore from "@/src/store/useCollectionsStore";
import useSettingsStore from "@/src/store/useSettingsStore";
import { Entypo } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import {
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  createStyleSheet,
  mq,
  UnistylesRuntime,
  useStyles,
} from "react-native-unistyles";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import useVaultItemsStore from "@/src/store/useVaultItemsStore";
import { VaultFile, VaultFolder } from "@/src/types";
import { formatFileSize } from "@/src/utils/formatFileSize";
import VaultSelector from "@/src/components/VaultSelector";

export default function Vault() {
  const { styles, theme } = useStyles(stylesheet);
  const router = useRouter();
  const { isMobile } = useScreenType();
  const { top, bottom } = useSafeAreaInsets();
  const folders = useVaultItemsStore((state) => state.folders);
  const files = useVaultItemsStore((state) => state.files);
  const settingsStore = useSettingsStore((state) => state.settings);
  const colorScheme = useColorScheme();

  const rootFolders = React.useMemo(
    () => folders.filter((folder) => folder.parentId === null),
    [folders]
  );

  const rootFiles = React.useMemo(
    () => files.filter((file) => file.parentId === null),
    [files]
  );

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const importFiles = React.useCallback(async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Panels",
          message: "Panels needs access to your files",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      console.log("here 1");
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can access the files");
      } else {
        console.log("Files access permission denied");
      }
    }

    const result = await DocumentPicker.getDocumentAsync({});

    if (result.canceled || !result.assets.length) {
      return;
    }

    console.log({ e: result.assets[0] });
  }, []);

  const renderFolderItem = (item: VaultFolder) => (
    <TouchableOpacity
      style={styles.folderItem}
      // onPress={() => router.push(`/folder/${item.id}`)}
    >
      <View>
        <Typography numberOfLines={1}>{item.name}</Typography>
        <Typography>{new Date(item.createdAt).toLocaleDateString()}</Typography>
      </View>
    </TouchableOpacity>
  );

  const renderFileItem = (item: VaultFile) => (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={() => {
        // show preview or popup or what ever
      }}
    >
      {/* <Ionicons 
        name={getFileIcon(item.type)} 
        size={24} 
        color="#007AFF" 
        style={styles.icon} 
      /> */}
      <View>
        <Typography numberOfLines={1}>{item.name}</Typography>
        <Typography>
          {formatFileSize(item.size)} ·{" "}
          {new Date(item.createdAt).toLocaleDateString()}
        </Typography>
      </View>
    </TouchableOpacity>
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
          <VaultSelector />
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
          <VaultSelector />
        </View>
      )}
      <View style={styles.content}>
        <FlashList
          data={[...rootFolders, ...rootFiles]}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => {
            if ("childrenIds" in item) {
              return renderFolderItem(item);
            } else {
              return renderFileItem(item);
            }
          }}
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
                Vault
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
  folderItem: {
    borderWidth: 1,
    borderColor: "yellow",
  },
  fileItem: {
    borderWidth: 1,
    borderColor: "red",
  },
}));
