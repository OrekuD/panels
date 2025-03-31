import { Entypo } from "@expo/vector-icons";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import VaultDropdown from "./VaultDropdown";
import { VaultFolder } from "../types";

export default function VaultSelector({ folder }: { folder?: VaultFolder }) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <VaultDropdown folder={folder}>
      <Animated.View style={[styles.selector]}>
        <Entypo name="plus" size={24} color={theme.colors.typography} />
      </Animated.View>
    </VaultDropdown>
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
