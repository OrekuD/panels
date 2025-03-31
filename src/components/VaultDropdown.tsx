import * as DropdownMenu from "zeego/dropdown-menu";
import React from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useStyles } from "react-native-unistyles";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import useCollectionsStore from "../store/useCollectionsStore";
import { Comic, VaultFolder } from "../types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
// import { unzip } from "react-native-zip-archive";
import useLibraryStore from "../store/useLibraryStore";
import uuid from "../utils/uuid";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import stripFileExtension from "../utils/stripFileExtension";
import { XMLParser } from "fast-xml-parser";
import { useRouter } from "expo-router";
import useVaultItemsStore from "../store/useVaultItemsStore";
import prompt from "react-native-prompt-android";

type VaultDropdownProps = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  folder?: VaultFolder;
};

export default function VaultDropdown(props: VaultDropdownProps) {
  const { styles: webStyles, theme } = useStyles(webDropdownStyleSheet);
  const createFolder = useVaultItemsStore((state) => state.createFolder);
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

  async function pickFile() {
    try {
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

      const targetPath =
        FileSystem.documentDirectory + "comics/unzip/" + uuid();
      // const unzipped = await unzip(result.assets[0].uri, targetPath);

      // if (unzipped) {
      //   let files = await FileSystem.readDirectoryAsync(unzipped);

      //   console.log("here 2");
      //   if (files.length === 0) return;
      //   files = files.filter((file) => !file.endsWith(".xml"));
      //   files.sort();

      //   console.log("here 4");
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
      //   Alert.alert(
      //     "Success",
      //     "File imported successfully. You can find it in your library."
      //   );
      // }
    } catch (error) {
      console.log("error: ", error);
      Alert.alert("Error", "An error occurred while importing the file.");
    }
  }

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
            // onSelect={pickFile}
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
