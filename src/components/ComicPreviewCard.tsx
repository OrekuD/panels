import {
  Platform,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Share,
  ActionSheetIOS,
} from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import Typography from "./Typography";
import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import * as DropdownMenu from "zeego/dropdown-menu";
import * as ContextMenu from "zeego/context-menu";
import { useRouter } from "expo-router";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import { Comic } from "../types";
import bytesToMB from "../utils/bytesToMB";
import formatDistance from "../utils/formatDistance";
import React from "react";
import useLibraryStore from "../store/useLibraryStore";
import useBookmarksStore from "../store/useBookmarksStore";
import useCollectionsStore from "../store/useCollectionsStore";

type ComicPreviewCardProps = {
  comic: Comic;
  showProgress?: boolean;
};

export default function ComicPreviewCard(props: ComicPreviewCardProps) {
  const { styles, theme } = useStyles(stylesheet);
  const { styles: webStyles } = useStyles(webDropdownStyleSheet);
  const router = useRouter();
  const libraryStore = useLibraryStore();
  const bookmarksStore = useBookmarksStore();
  const collectionStore = useCollectionsStore();

  const rename = React.useCallback(() => {
    Alert.prompt(
      "Rename",
      "Enter the new title",
      (newTitle) => {
        if (!newTitle) return;
        libraryStore.renameComic(props.comic.id, newTitle);
      },
      "plain-text",
      props.comic.title
    );
  }, [props.comic.id, props.comic.title]);

  const share = React.useCallback(() => {
    Share.share({
      message: `Check out ${props.comic.title}!`,
      url: props.comic.pages[0],
    });
  }, [props.comic.title, props.comic.pages]);

  const markAsComplete = React.useCallback(() => {
    libraryStore.markAsComplete(props.comic.id);
  }, [props.comic.id]);

  const markAsUnread = React.useCallback(() => {
    libraryStore.markAsUnread(props.comic.id);
  }, [props.comic.id]);

  const deleteComic = React.useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Delete", "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: `Delete ${props.comic.title}`,
          message:
            "Are you sure you want to delete this comic? This action can't be undone",
        },
        (index) => {
          if (index === 0) {
            collectionStore.removeComicFromAllCollections(props.comic.id);
            libraryStore.deleteComic(props.comic.id);
          }
        }
      );
    } else {
      libraryStore.deleteComic(props.comic.id);
    }
  }, [props.comic.id]);

  const updateBookmarks = React.useCallback(() => {
    bookmarksStore.updateBookmarks(props.comic.id);
  }, [props.comic.id]);

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
              router.push(`/comic/${props.comic.id}`);
            }}
            style={styles.container}
          >
            <Typography size="md" fontWeight="600" numberOfLines={1}>
              {props.comic.title}
            </Typography>
            <View style={styles.main}>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: props.comic.pages[0],
                  }}
                  style={styles.image}
                />
              </View>
            </View>
            {props.showProgress ? (
              <View
                style={[
                  styles.footer,
                  {
                    marginTop: 14,
                    paddingBottom: theme.margins.lg,
                  },
                ]}
              >
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progress,
                      {
                        width: `${
                          (props.comic.currentPage / props.comic.pages.length) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : null}
            <View
              style={[
                styles.footer,
                {
                  marginTop: props.showProgress ? 0 : 14,
                },
              ]}
            >
              <Typography color="secondary" size="sm" fontWeight="500">
                {props.comic.pages.length} pages
              </Typography>
              {Boolean(props.comic.size) ? (
                <Typography color="secondary" size="sm" fontWeight="500">
                  {bytesToMB(props.comic.size)} MB
                </Typography>
              ) : null}
            </View>
            <View style={styles.footer}>
              <Typography color="secondary" size="sm" fontWeight="500">
                {formatDistance(props.comic.createdAt)}
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
                    <DropdownMenu.Label>{props.comic.title}</DropdownMenu.Label>
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
                      <DropdownMenu.Item
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
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>
                    <DropdownMenu.Group>
                      <DropdownMenu.Item
                        key="bookmarks"
                        style={webStyles.dropdownItem}
                        onSelect={updateBookmarks}
                      >
                        <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                          {bookmarksStore.comicIds.includes(props.comic.id)
                            ? "Remove from Bookmarks"
                            : "Add to Bookmarks"}
                        </DropdownMenu.ItemTitle>
                        <DropdownMenu.ItemIcon
                          ios={{
                            name: bookmarksStore.comicIds.includes(
                              props.comic.id
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
                    </DropdownMenu.Group>
                    <DropdownMenu.Group>
                      <DropdownMenu.Item
                        key="delete"
                        destructive
                        style={webStyles.dropdownItem}
                        onSelect={deleteComic}
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
        <ContextMenu.Label>{props.comic.title}</ContextMenu.Label>
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
          <ContextMenu.Item
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
          </ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Group>
          <ContextMenu.Item
            key="bookmarks"
            style={webStyles.dropdownItem}
            onSelect={updateBookmarks}
          >
            <ContextMenu.ItemTitle style={webStyles.dropdownTitle}>
              Add to Bookmarks
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon
              ios={{
                name: "bookmark",
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
        </ContextMenu.Group>
        <ContextMenu.Group>
          <ContextMenu.Item
            key="delete"
            destructive
            style={webStyles.dropdownItem}
            onSelect={deleteComic}
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
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1 / 1.4,
  },
  progressContainer: {
    width: "100%",
    height: 3,
    backgroundColor: theme.colors.borderColor,
    borderRadius: 2,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.blue,
    borderRadius: 2,
  },
}));
