import * as DropdownMenu from "zeego/dropdown-menu";
import React from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useStyles } from "react-native-unistyles";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import useCollectionsStore from "../store/useCollectionsStore";
import { Comic, VaultFolder } from "../types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
// import { unzip } from "react-native-zip-archive";
import useLibraryStore from "../store/useLibraryStore";
import uuid from "../utils/uuid";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import stripFileExtension from "../utils/stripFileExtension";
import { XMLParser } from "fast-xml-parser";
import { useRouter } from "expo-router";
import useVaultItemsStore from "../store/useVaultItemsStore";
import prompt from "react-native-prompt-android";
import { VaultFile } from "../types";
import * as VideoThumbnails from "expo-video-thumbnails";

type VaultDropdownProps = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  folder?: VaultFolder;
};

export default function VaultDropdown(props: VaultDropdownProps) {
  const { styles: webStyles, theme } = useStyles(webDropdownStyleSheet);
  const createFolder = useVaultItemsStore((state) => state.createFolder);
  const addFile = useVaultItemsStore((state) => state.addFile); // Get addFile function
  const router = useRouter();

  const addFolder = React.useCallback(() => {
    prompt(
      "Create Folder",
      "Enter folder name",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (folderName) => {
            createFolder(folderName, props.folder ? props.folder.id : null);
          },
        },
      ],
      {
        type: "plain-text",
        cancelable: false,
        defaultValue: "",
        placeholder: "",
      }
    );
  }, [props.folder]);

  const importFiles = React.useCallback(async () => {
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

    if (
      mediaLibraryPermission.status === MediaLibrary.PermissionStatus.DENIED
    ) {
      Alert.alert("Media Library", "Permission denied");
      return;
    }

    // if (Platform.OS === "android") {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //     {
    //       title: "Panels",
    //       message: "Panels needs access to your files",
    //       buttonNeutral: "Ask Me Later",
    //       buttonNegative: "Cancel",
    //       buttonPositive: "OK",
    //     }
    //   );
    //   // Check if permission was granted
    //   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //     // Inform the user and stop the import process if permission is denied
    //     Alert.alert(
    //       "Permission Denied",
    //       "File access permission is required to import files."
    //     );
    //     return; // Exit the function early
    //   }
    // }

    // Proceed with DocumentPicker only if permissions are granted (on Android) or not needed (iOS/Web)
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "video/*"], // Accept only images and videos
      copyToCacheDirectory: true, // Recommended for persistent access
      multiple: true, // Allow multiple file selection
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    // Process each selected asset
    for (const asset of result.assets) {
      try {
        const fileType = asset.mimeType?.startsWith("image")
          ? "image"
          : asset.mimeType?.startsWith("video")
          ? "video"
          : null;

        if (!fileType) {
          console.warn(
            `Unsupported file type: ${asset.mimeType} for file ${asset.name}`
          );
          Alert.alert(
            "Unsupported File",
            `Skipping file "${asset.name}" due to unsupported type: ${
              asset.mimeType ?? "Unknown"
            }`
          );
          continue; // Skip unsupported files
        }

        const vaultDir = FileSystem.documentDirectory + "vault/";
        const dirInfo = await FileSystem.getInfoAsync(vaultDir);

        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(vaultDir, {
            intermediates: true,
          });
        }

        const fileExtension = asset.name.split(".").pop() || "";
        const newFileName = `${uuid()}${
          fileExtension ? "." + fileExtension : ""
        }`;
        const destinationUri = vaultDir + newFileName;

        await FileSystem.copyAsync({
          from: asset.uri,
          to: destinationUri,
        });

        let thumbnail = "";
        if (fileType === "video") {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            destinationUri,
            {
              time: 0,
            }
          );

          thumbnail = uri;
        }

        const newVaultFile: VaultFile = {
          id: uuid(),
          name: asset.name,
          type: fileType,
          size: asset.size ?? 0,
          uri: destinationUri,
          createdAt: new Date().toISOString(),
          parentId: props.folder ? props.folder.id : null,
          thumbnail,
        };

        addFile(newVaultFile);

        if (
          Platform.OS === "ios" &&
          FileSystem.cacheDirectory &&
          asset.uri.startsWith(FileSystem.cacheDirectory)
        ) {
          try {
            console.log("before delete");
            await FileSystem.deleteAsync(asset.uri, {
              idempotent: true,
            });
          } catch (e) {
            console.log("Error cleaning up cached file:", e);
          }
        }

        if (
          Platform.OS === "android" &&
          asset.uri.includes("content://media/")
        ) {
          const file = await MediaLibrary.createAssetAsync(asset.uri);
          await MediaLibrary.deleteAssetsAsync([file]);
        }
      } catch (error) {
        console.error(`Failed to import file ${asset.name}:`, error);
        Alert.alert("Import Error", `Failed to import file: ${asset.name}`);
      }
    }
  }, [props.folder, addFile]); // Add addFile to dependencies

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{props.children}</DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={webStyles.dropdownContent}
        align="end"
        alignOffset={Platform.OS === "ios" ? -8 : -100}
        sideOffset={Platform.OS === "ios" ? 6 : -100}
      >
        {!props.folder && (
          <DropdownMenu.Group>
            <DropdownMenu.Item
              key="settings"
              onSelect={() => {}}
              style={{
                ...webStyles.dropdownCheckboxItem,
                borderBottomWidth: 0,
              }}
            >
              <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                Settings
              </DropdownMenu.ItemTitle>
              <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                customize your vault
              </DropdownMenu.ItemSubtitle>
              <DropdownMenu.ItemIcon
                ios={{
                  name: "gear",
                }}
              />
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        )}
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="import"
            style={webStyles.dropdownCheckboxItem}
            onSelect={importFiles}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Import
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              import new files
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "tray.and.arrow.down",
              }}
            />
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="new-folder"
            style={webStyles.dropdownCheckboxItem}
            onSelect={addFolder}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Create folder
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              add new folder
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "folder.badge.plus",
              }}
            />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
