import { TouchableOpacity, View, useWindowDimensions } from "react-native";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";
import { Comic } from "../types";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

type ReadingNowCardProps = {
  item: Comic;
  index: number;
  scrollX: SharedValue<number>;
};

export default function ReadingNowCard(props: ReadingNowCardProps) {
  const { styles } = useStyles(stylesheet);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            props.scrollX.value,
            [
              (props.index - 1) * width * 0.7,
              props.index * width * 0.7,
              (props.index + 1) * width * 0.7,
            ],
            [0.92, 1, 0.92],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/comic/${props.item.id}`)}
      style={{
        width: width * 0.7,
        height: width * 0.7 * 1.4,
      }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: width * 0.7,
          },
          animatedStyle,
        ]}
      >
        <Image source={{ uri: props.item.pages[0] }} style={styles.image} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    // width: {
    //   [mq.only.width(0, 480)]: UnistylesRuntime.screen.width * 0.7,
    //   [mq.only.width(480, 768)]: "75%",
    //   [mq.only.width(768, 1024)]: "70%",
    //   [mq.only.width(1024, 1440)]: 720,
    //   [mq.only.width(1440)]: 920,
    // },
    aspectRatio: 1 / 1.4,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));
