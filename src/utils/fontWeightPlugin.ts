import { UnistylesPlugin } from "react-native-unistyles";

export const fontWeightPlugin: UnistylesPlugin = {
  name: "fontWeightPlugin",
  onParsedStyle: (_key, styles) => {
    if ("fontWeight" in styles) {
      switch (styles.fontWeight) {
        case "bold": {
          styles.fontFamily = "SFProDisplayBold";
        }
        case "500": {
          styles.fontFamily = "SFProDisplayMedium";
        }
        case "600": {
          styles.fontFamily = "SFProDisplaySemibold";
        }
        case "700": {
          styles.fontFamily = "SFProDisplayBold";
        }
        default: {
          styles.fontFamily = "SFProDisplay";
        }
      }
    }

    return styles;
  },
};
