import { UnistylesRuntime, createStyleSheet } from "react-native-unistyles";

const webDropdownStyleSheet = createStyleSheet((theme) => ({
  dropdownContent: {
    width: 300,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.borderColor,
    maxHeight: UnistylesRuntime.screen.height * 0.677,
    overflow: "scroll" as any,
  },
  dropdownItem: {
    borderBottomWidth: 1,
    borderColor: theme.colors.borderColor,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    position: "relative",
  },
  dropdownCheckboxItem: {
    borderBottomWidth: 1,
    borderColor: theme.colors.borderColor,
    padding: 12,
    paddingLeft: 38,
    gap: 4,
    position: "relative",
  },
  dropdownSubContent: {
    width: 200,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.borderColor,
    // transform: [{ translateX: -12 }, { translateY: 6 }],
  },
  dropdownSubContentItem: {
    borderTopWidth: 1,
    borderColor: theme.colors.borderColor,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    position: "relative",
  },
  dropdownSubTrigger: {
    borderBottomWidth: 1,
    borderColor: theme.colors.borderColor,
    padding: 12,
    paddingLeft: 38,
    gap: 4,
    position: "relative",
  },
  dropdownTitle: {
    color: theme.colors.typography,
    fontSize: 16,
  },
  dropdownDestructiveTitle: {
    color: "#DC4138",
    fontSize: 16,
  },
  dropdownSubTitle: {
    color: theme.colors.secondaryTypography,
    fontSize: 14,
  },
  dropdownIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    color: theme.colors.secondaryTypography,
    fontSize: 16,
  },
  dropdownSubTriggerIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    color: theme.colors.secondaryTypography,
    fontSize: 16,
  },
}));

export default webDropdownStyleSheet;
