import * as DropdownMenu from "zeego/dropdown-menu";
import React from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useStyles } from "react-native-unistyles";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import useCollectionsStore from "../store/useCollectionsStore";
import { Comic } from "../types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
// import { unzip } from "react-native-zip-archive";
import useLibraryStore from "../store/useLibraryStore";
import uuid from "../utils/uuid";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import stripFileExtension from "../utils/stripFileExtension";
import { XMLParser } from "fast-xml-parser";
import { useRouter } from "expo-router";

type HomeFeedDropdownProps = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
};

export default function HomeFeedDropdown(props: HomeFeedDropdownProps) {
  const { styles: webStyles, theme } = useStyles(webDropdownStyleSheet);
  const collections = useCollectionsStore((state) => state.collections);
  const libraryStore = useLibraryStore();
  const router = useRouter();

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
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="settings"
            onSelect={() => router.push("/settings")}
            style={{
              ...webStyles.dropdownCheckboxItem,
              borderBottomWidth: 0,
            }}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Settings
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              make the app your own
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "gear",
              }}
            />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger
            key="sub"
            style={webStyles.dropdownSubTrigger}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              All Collections
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "tag",
              }}
            />
            <Entypo
              name="chevron-right"
              size={24}
              color={theme.colors.typography}
              style={webStyles.dropdownSubTriggerIcon}
            />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent style={webStyles.dropdownSubContent}>
            {collections.map((collection, index) => (
              <DropdownMenu.Item
                key={collection.id}
                style={{
                  ...webStyles.dropdownSubContentItem,
                  borderTopWidth: index === 0 ? 0 : 1,
                }}
                onSelect={() => router.push(`/collection/${collection.id}`)}
              >
                <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                  {collection.name}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="vault"
            style={webStyles.dropdownCheckboxItem}
            onSelect={() => router.push("/vault")}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Vault
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              view your vault
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "lock",
              }}
            />
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="bookmarks"
            style={webStyles.dropdownCheckboxItem}
            onSelect={() => router.push("/bookmarks")}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Bookmarks
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              view your bookmarks
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "bookmark",
              }}
            />
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="collections"
            style={webStyles.dropdownCheckboxItem}
            onSelect={() => router.push("/collections")}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Collections
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              view your collections
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "list.bullet",
              }}
            />
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="library"
            style={webStyles.dropdownCheckboxItem}
            onSelect={() => router.push("/library")}
          >
            <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
              Library
            </DropdownMenu.ItemTitle>
            <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
              view your library
            </DropdownMenu.ItemSubtitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: "book",
              }}
            />
          </DropdownMenu.Item>
        </DropdownMenu.Group>
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
              import new files
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
  );
}
