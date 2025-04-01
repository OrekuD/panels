import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import {
  createStyleSheet,
  UnistylesRuntime,
  useStyles,
} from "react-native-unistyles";
import Typography from "./Typography";
import { VaultFolder } from "../types";
import React from "react";
import { useRouter } from "expo-router";

export default function Folder({ folder }: { folder: VaultFolder }) {
  const router = useRouter();
  const { styles, theme } = useStyles(stylesheet);
  const files = React.useMemo(
    () => folder.childrenIds.files.length + folder.childrenIds.folders.length,
    [folder.childrenIds.files, folder.childrenIds.folders]
  );

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => router.push(`/folder/${folder.id}`)}
    >
      <View style={styles.folderIconContainer}>
        <Ionicons
          name="folder-open-sharp"
          size={16}
          color={theme.colors.typography}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 6,
          paddingVertical: 4,
        }}
      >
        <Typography
          size="xs"
          numberOfLines={1}
          style={{
            width: "100%",
          }}
        >
          {folder.name}
        </Typography>
        <Typography size="xs" color="secondary">
          {files} items
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 6,
    width: theme.previewSize,
    height: theme.previewSize,
  },
  folderIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
}));
