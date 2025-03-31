import Typography from "@/src/components/Typography";
import {
  FlatList,
  Platform,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import useSettingsStore from "@/src/store/useSettingsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useScreenType from "@/src/hooks/useScreenType";
import { BlurView } from "expo-blur";
import FeedSelector from "@/src/components/FeedSelector";
import ReadingNowCard from "@/src/components/ReadingNowCard";
import useLibraryStore from "@/src/store/useLibraryStore";
import useReadingNow from "@/src/store/useReadingNowStore";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Comic } from "@/src/types";

// const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList<Comic>);
const AnimatedFlashlist = Animated.createAnimatedComponent(FlatList<Comic>);

const itemInfoHeight = 100;

export default function Index() {
  const { styles, theme } = useStyles(stylesheet);
  const { isMobile } = useScreenType();
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const settingsStore = useSettingsStore((state) => state.settings);
  const library = useLibraryStore((state) => state.comics);
  const readingNowComicIds = useReadingNow((state) => state.comicIds);
  const colorScheme = useColorScheme();
  const scrollX = useSharedValue(0);
  const scrollXIndex = useSharedValue(0);

  const onScrollEnd = React.useCallback((contentOffsetX: number) => {
    scrollXIndex.value = withSpring(Math.round(contentOffsetX / itemWidth), {
      damping: 200,
    });
  }, []);

  const onScrollX = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      runOnJS(onScrollEnd)(e.contentOffset.x);
    },
  });

  const themeMode = React.useMemo(() => {
    if (settingsStore.themeMode === "system") {
      return colorScheme;
    }

    return settingsStore.themeMode;
  }, [settingsStore.themeMode, UnistylesRuntime.hasAdaptiveThemes]);

  const readingNow = React.useMemo(
    () => library.filter(({ id }) => readingNowComicIds.includes(id)),
    [library, readingNowComicIds]
  );

  const itemWidth = width * 0.7;
  const spacer = (width - itemWidth) / 2;

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollXIndex.value * -itemInfoHeight,
        },
      ],
    };
  });

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
          <FeedSelector />
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
          <FeedSelector />
        </View>
      )}
      <View
        style={[
          styles.content,
          {
            paddingTop: isMobile ? top + 12 : 54,
            paddingBottom: isMobile ? bottom + 100 : 150,
          },
        ]}
      >
        <View
          style={{
            marginBottom: 32,
            paddingHorizontal: theme.margins["2xl"],
          }}
        >
          <Typography size="3xl" fontWeight="900">
            Reading
          </Typography>
          <Typography size="3xl" fontWeight="900">
            Now
          </Typography>
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <AnimatedFlashlist
            data={readingNow}
            keyExtractor={({ id }) => id}
            renderItem={({ item, index }) => (
              <ReadingNowCard item={item} scrollX={scrollX} index={index} />
            )}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            // estimatedItemSize={210}
            scrollEventThrottle={16}
            snapToInterval={itemWidth}
            decelerationRate="fast"
            onScroll={onScrollX}
            ListHeaderComponent={<View style={{ width: spacer * 0.3 }} />}
            ListFooterComponent={<View style={{ width: spacer }} />}
          />
          <View
            style={[
              styles.contentWrapper,
              {
                top: width * 0.7 * 1.4 + 28,
              },
            ]}
          >
            <Animated.View style={[animatedStyles]}>
              {readingNow.map((item) => {
                return (
                  <View style={styles.itemContent} key={item.id}>
                    <Typography size="xl" fontWeight="700" numberOfLines={2}>
                      {item.title}
                    </Typography>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progress,
                          {
                            width: `${
                              (item.currentPage / item.pages.length) * 100
                            }%`,
                            backgroundColor:
                              item.currentPage === item.pages.length
                                ? theme.colors.green
                                : theme.colors.blue,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>
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
    zIndex: 30,
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
  contentWrapper: {
    position: "absolute",
    left: 0,
    width: "100%",
    // backgroundColor: "red",
    paddingHorizontal: theme.margins["2xl"],
    pointerEvents: "none",
    height: itemInfoHeight,
    overflow: "hidden",
  },
  itemContent: {
    height: itemInfoHeight,
    width: "100%",
    // backgroundColor: "blue",
    justifyContent: "center",
    gap: 14,
  },
  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: theme.colors.borderColor,
    borderRadius: 6 / 2,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.blue,
    borderRadius: 2,
  },
}));
