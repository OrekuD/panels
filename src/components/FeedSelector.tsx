import { Octicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import HomeFeedDropdown from "./HomeFeedDropdown";

export default function FeedSelector() {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <HomeFeedDropdown>
      <Animated.View style={[styles.selector]}>
        <Octicons name="stack" size={24} color={theme.colors.typography} />
      </Animated.View>
    </HomeFeedDropdown>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  selector: {
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
}));
