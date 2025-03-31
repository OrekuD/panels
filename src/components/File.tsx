import { View } from "react-native";
import { VaultFile } from "../types";
import {
  createStyleSheet,
  UnistylesRuntime,
  useStyles,
} from "react-native-unistyles";

export default function File({ file }: { file: VaultFile }) {
  const { styles, theme } = useStyles(stylesheet);
  return <View></View>;
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 6,
    width: (UnistylesRuntime.screen.width - 3 * theme.margins["2xl"]) / 3,
    height: (UnistylesRuntime.screen.width - 3 * theme.margins["2xl"]) / 3,
  },
  folderIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
}));
