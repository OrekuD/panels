import { View, Image } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import Typography from "./Typography";
import webDropdownStyleSheet from "../styles/webDropdownStyleSheet";
import { Comic } from "../types";
import bytesToMB from "../utils/bytesToMB";
import formatDistance from "../utils/formatDistance";

type ComicSelectionPreviewCardProps = {
  comic: Comic;
  isSelected: boolean;
};

export default function ComicSelectionPreviewCard(
  props: ComicSelectionPreviewCardProps
) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View
      style={{
        paddingHorizontal: 5,
      }}
    >
      <View
        style={[
          styles.container,
          {
            borderColor: props.isSelected
              ? theme.colors.blue
              : theme.colors.borderColor,
          },
        ]}
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
        <View
          style={[
            styles.footer,
            {
              // paddingBottom: 12,
              marginTop: 14,
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
            {/* {formatDistance(new Date(props.comic.createdAt), new Date(), {
              addSuffix: true,
            })} */}
            {formatDistance(props.comic.createdAt)}
          </Typography>
        </View>
      </View>
    </View>
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
}));
