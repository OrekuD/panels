import {
  Platform,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import Typography from "./Typography";
import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import * as DropdownMenu from "zeego/dropdown-menu";
import * as ContextMenu from "zeego/context-menu";
import { useRouter } from "expo-router";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import { Comic, ComicCollection } from "../types";
import bytesToMB from "../utils/bytesToMB";
import React from "react";
import formatDistance from "../utils/formatDistance";
import useLibraryStore from "../store/useLibraryStore";
import useCollectionsStore from "../store/useCollectionsStore";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
// import { unzip } from "react-native-zip-archive";
import uuid from "../utils/uuid";
import stripFileExtension from "../utils/stripFileExtension";

type CollectionPreviewCardProps = {
  collection: ComicCollection;
};

export default function CollectionPreviewCard(
  props: CollectionPreviewCardProps
) {
  const { styles, theme } = useStyles(stylesheet);
  const { styles: webStyles } = useStyles(webDropdownStyleSheet);
  const router = useRouter();
  const libraryStore = useLibraryStore();
  const collectionsStore = useCollectionsStore();

  const images: Array<{ uri: string; rotation: number }> = React.useMemo(() => {
    return props.collection.comics.map((comicId, index) => {
      const pages = libraryStore.comics.find(({ id }) => id === comicId)
        ?.pages || [""];
      return {
        uri: pages[0],
        rotation: index === 0 ? 0 : index === 1 ? -5 : 5,
      };
    });
  }, [props.collection.comics]);

  const rename = React.useCallback(() => {
    Alert.prompt(
      "Rename",
      "Enter the new title",
      (newTitle) => {
        if (!newTitle) return;
        collectionsStore.renameCollection(props.collection.id, newTitle);
      },
      "plain-text",
      props.collection.name
    );
  }, [props.collection.id, props.collection.name]);

  const deleteCollection = React.useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Delete", "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: `Delete ${props.collection.name}`,
          message:
            "Are you sure you want to delete this collection? This action can't be undone",
        },
        (index) => {
          if (index === 0) {
            collectionsStore.deleteCollection(props.collection.id);
          }
        }
      );
    } else {
      // add a confirmation dialog for android / web
      collectionsStore.deleteCollection(props.collection.id);
    }
  }, [props.collection.id]);

  const pickFile = React.useCallback(async () => {
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
      //   collectionsStore.addComicsToCollection(props.collection.id, [comic.id]);
      //   Alert.alert(
      //     "Success",
      //     "File imported successfully. You can find it in your library and has been added to this collection."
      //   );
      // }
    } catch (error) {
      Alert.alert("Error", "An error occurred while importing the file.");
    }
  }, [props.collection.id]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <View
          style={{
            paddingHorizontal: 5,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              router.push(`/collection/${props.collection.id}`);
            }}
            style={styles.container}
          >
            <Typography size="md" fontWeight="600" numberOfLines={1}>
              {props.collection.name}
            </Typography>
            <View style={styles.main}>
              <View style={styles.imageContainer}>
                {images.map((image, index) => {
                  return (
                    <Image
                      key={index}
                      source={{
                        uri: image.uri,
                      }}
                      style={[
                        styles.image,
                        {
                          zIndex: 10 - index,
                          transform: [{ rotate: `${image.rotation}deg` }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
            <View
              style={[
                styles.footer,
                {
                  marginTop: 14,
                },
              ]}
            >
              <Typography color="secondary" size="sm" fontWeight="500">
                {props.collection.comics.length === 1
                  ? "1 title"
                  : `${props.collection.comics.length} titles`}
              </Typography>
              {/* {Boolean(props.collection.size) ? (
                <Typography color="secondary" size="sm" fontWeight="500">
                  {bytesToMB(props.collection.size)} MB
                </Typography>
              ) : null} */}
            </View>
            <View style={styles.footer}>
              <Typography color="secondary" size="sm" fontWeight="500">
                {formatDistance(props.collection.createdAt)}
              </Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => e.stopPropagation()}
              >
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Entypo
                      name="dots-three-horizontal"
                      size={24}
                      color={theme.colors.gray100}
                    />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    style={webStyles.dropdownContent}
                    align="end"
                    alignOffset={-8}
                    sideOffset={6}
                  >
                    <DropdownMenu.Label>
                      {props.collection.name}
                    </DropdownMenu.Label>
                    <DropdownMenu.Group>
                      <DropdownMenu.Item
                        key="rename"
                        style={webStyles.dropdownItem}
                        onSelect={rename}
                      >
                        <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                          Rename
                        </DropdownMenu.ItemTitle>
                        <DropdownMenu.ItemIcon
                          ios={{
                            name: "pencil",
                          }}
                        />
                      </DropdownMenu.Item>
                      {/* <DropdownMenu.Item
                      key="share"
                      style={webStyles.dropdownItem}
                      onSelect={share}
                    >
                      <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Share
                      </DropdownMenu.ItemTitle>
                      <DropdownMenu.ItemIcon
                        ios={{
                          name: "square.and.arrow.up",
                        }}
                      />
                    </DropdownMenu.Item> */}
                    </DropdownMenu.Group>
                    {/* <DropdownMenu.Group>
                    <DropdownMenu.Item
                      key="bookmarks"
                      style={webStyles.dropdownItem}
                      onSelect={updateBookmarks}
                    >
                      <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                        {bookmarksStore.comicIds.includes(props.collection.id)
                          ? "Remove from Bookmarks"
                          : "Add to Bookmarks"}
                      </DropdownMenu.ItemTitle>
                      <DropdownMenu.ItemIcon
                        ios={{
                          name: bookmarksStore.comicIds.includes(
                            props.collection.id
                          )
                            ? "bookmark.fill"
                            : "bookmark",
                        }}
                      />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      key="mark-as-complete"
                      style={webStyles.dropdownItem}
                      onSelect={markAsComplete}
                    >
                      <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Mark as Complete
                      </DropdownMenu.ItemTitle>
                      <DropdownMenu.ItemIcon
                        ios={{
                          name: "text.badge.checkmark",
                        }}
                      />
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      key="mark-as-unread"
                      style={webStyles.dropdownItem}
                      onSelect={markAsUnread}
                    >
                      <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Mark as Unread
                      </DropdownMenu.ItemTitle>
                      <DropdownMenu.ItemIcon
                        ios={{
                          name: "text.badge.xmark",
                        }}
                      />
                    </DropdownMenu.Item>
                  </DropdownMenu.Group> */}
                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger
                        key="sub"
                        style={webStyles.dropdownSubTrigger}
                      >
                        <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                          Add to collections
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
                      <DropdownMenu.SubContent
                        style={webStyles.dropdownSubContent}
                      >
                        <DropdownMenu.Item
                          style={{
                            ...webStyles.dropdownSubContentItem,
                            borderTopWidth: 0,
                          }}
                          onSelect={() =>
                            router.push(`/select-comic/${props.collection.id}`)
                          }
                          key="add-from-library"
                        >
                          <DropdownMenu.ItemTitle
                            style={webStyles.dropdownTitle}
                          >
                            Import from Library
                          </DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          style={{
                            ...webStyles.dropdownSubContentItem,
                            borderTopWidth: 0,
                          }}
                          onSelect={pickFile}
                          key="import-new-file"
                        >
                          <DropdownMenu.ItemTitle
                            style={webStyles.dropdownTitle}
                          >
                            Import new file
                          </DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                    <DropdownMenu.Group>
                      <DropdownMenu.Item
                        key="delete"
                        destructive
                        style={webStyles.dropdownItem}
                        onSelect={deleteCollection}
                      >
                        <DropdownMenu.ItemTitle
                          style={webStyles.dropdownDestructiveTitle}
                        >
                          Delete
                        </DropdownMenu.ItemTitle>
                        <DropdownMenu.ItemIcon
                          ios={{
                            name: "trash",
                          }}
                        />
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </ContextMenu.Trigger>
      <ContextMenu.Content style={webStyles.dropdownContent}>
        <ContextMenu.Label>{props.collection.name}</ContextMenu.Label>
        <ContextMenu.Group>
          <ContextMenu.Item
            key="rename"
            style={webStyles.dropdownItem}
            onSelect={rename}
          >
            <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
              Rename
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon
              ios={{
                name: "pencil",
              }}
            />
          </ContextMenu.Item>
          {/* <ContextMenu.Item
                      key="share"
                      style={webStyles.dropdownItem}
                      onSelect={share}
                    >
                      <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Share
                      </ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon
                        ios={{
                          name: "square.and.arrow.up",
                        }}
                      />
                    </ContextMenu.Item> */}
        </ContextMenu.Group>
        {/* <ContextMenu.Group>
                    <ContextMenu.Item
                      key="bookmarks"
                      style={webStyles.dropdownItem}
                      onSelect={updateBookmarks}
                    >
                      <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                        {bookmarksStore.comicIds.includes(props.collection.id)
                          ? "Remove from Bookmarks"
                          : "Add to Bookmarks"}
                      </ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon
                        ios={{
                          name: bookmarksStore.comicIds.includes(
                            props.collection.id
                          )
                            ? "bookmark.fill"
                            : "bookmark",
                        }}
                      />
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      key="mark-as-complete"
                      style={webStyles.dropdownItem}
                      onSelect={markAsComplete}
                    >
                      <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Mark as Complete
                      </ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon
                        ios={{
                          name: "text.badge.checkmark",
                        }}
                      />
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      key="mark-as-unread"
                      style={webStyles.dropdownItem}
                      onSelect={markAsUnread}
                    >
                      <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                        Mark as Unread
                      </ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon
                        ios={{
                          name: "text.badge.xmark",
                        }}
                      />
                    </ContextMenu.Item>
                  </ContextMenu.Group> */}
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger
            key="sub"
            style={webStyles.dropdownSubTrigger}
          >
            <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
              Add to collections
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon
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
          </ContextMenu.SubTrigger>
          <ContextMenu.SubContent style={webStyles.dropdownSubContent}>
            <ContextMenu.Item
              style={{
                ...webStyles.dropdownSubContentItem,
                borderTopWidth: 0,
              }}
              onSelect={() =>
                router.push(`/select-comic/${props.collection.id}`)
              }
              key="add-from-library"
            >
              <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                Import from Library
              </ContextMenu.ItemTitle>
            </ContextMenu.Item>
            <ContextMenu.Item
              style={{
                ...webStyles.dropdownSubContentItem,
                borderTopWidth: 0,
              }}
              onSelect={pickFile}
              key="import-new-file"
            >
              <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
                Import new file
              </ContextMenu.ItemTitle>
            </ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
        <ContextMenu.Group>
          <ContextMenu.Item
            key="delete"
            destructive
            style={webStyles.dropdownItem}
            onSelect={deleteCollection}
          >
            <ContextMenu.ItemTitle style={webStyles.dropdownDestructiveTitle}>
              Delete
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon
              ios={{
                name: "trash",
              }}
            />
          </ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 7,
    padding: theme.margins["2xl"],
    paddingBottom: 0,
    // marginRight: 5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.margins.lg,
    paddingBottom: theme.margins.xl,
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  iconButton: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  main: {
    gap: 12,
    marginTop: 12,
    alignItems: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1 / 1.4,
  },
}));
