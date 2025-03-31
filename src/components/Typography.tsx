import React from "react";
import { Text as DefaultText } from "react-native";
import { useStyles } from "react-native-unistyles";
import useSettingsStore from "../store/useSettingsStore";

type TypographyProps = DefaultText["props"] & {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: "primary" | "secondary";
  fontWeight?: "400" | "500" | "600" | "700" | "800" | "900";
};

export default function Typography({
  size,
  color,
  fontWeight,
  style,
  ...props
}: React.PropsWithChildren<TypographyProps>) {
  const { theme } = useStyles();
  const settingsStore = useSettingsStore(({ settings }) => settings);

  const fontSize = React.useMemo(() => {
    switch (size) {
      case "xs":
        return 12;
      case "sm":
        return 14;
      case "md":
        return 17;
      case "lg":
        return 20;
      case "xl":
        return 24;
      case "2xl":
        return 28;
      case "3xl":
        return 48;
      default:
        return 16;
    }
  }, [size]);

  const fontFamily = React.useMemo(() => {
    switch (fontWeight) {
      case "400":
        return "SFProDisplay";
      case "500":
        return "SFProDisplayMedium";
      case "600":
        return "SFProDisplaySemibold";
      case "700":
        return "SFProDisplayBold";
      case "800":
        return "SFProDisplayHeavy";
      case "900":
        return "SFProDisplayBlack";

      default:
        return "SFProDisplay";
    }
  }, [fontWeight]);

  const textColor = React.useMemo(() => {
    switch (color) {
      case "primary":
        return theme.colors.typography;
      case "secondary":
        return theme.colors.secondaryTypography;
      default:
        return theme.colors.typography;
    }
  }, [color, theme.colors.typography, theme.colors.secondaryTypography]);

  return (
    <DefaultText
      style={[
        style,
        {
          fontFamily,
          fontSize,
          color: textColor,
        },
      ]}
      {...props}
    >
      {props.children}
    </DefaultText>
  );
}
