import useSettingsStore from "@/src/store/useSettingsStore";
import { Switch, View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import Typography from "../Typography";
import * as DropdownMenu from "zeego/dropdown-menu";
import { UnistylesRuntime } from "react-native-unistyles";
import webDropdownStyleSheet from "@/src/styles/webDropdownStyleSheet";
import { AntDesign } from "@expo/vector-icons";
import { SFSymbol } from "expo-symbols";

// const cardSizes = [
//   {
//     type: "list" as const,
//     name: "List",
//     description: "contains subtitles",
//     iosIconName: "l.circle",
//   },
//   {
//     type: "compressed" as const,
//     name: "Compressed",
//     description: "contains subtitles and thumbnails",
//     iosIconName: "c.circle",
//   },
//   {
//     type: "small" as const,
//     name: "Small",
//     description: "contains thumbnails",
//     iosIconName: "s.circle",
//   },
//   {
//     type: "medium" as const,
//     name: "Medium",
//     description: "contains cards, subtitles, and thumbnails",
//     iosIconName: "m.circle",
//   },
//   {
//     type: "large" as const,
//     name: "Large",
//     description: "contains cards, subtitles, and thumbnails",
//     iosIconName: "l.circle",
//   },
//   {
//     type: "wide" as const,
//     name: "Wide",
//     description: "contains subtitles and thumbnails",
//     iosIconName: "w.circle",
//   },
// ];

const themes = [
  {
    type: "system" as const,
    name: "System",
    iosIconName: "lightbulb" as SFSymbol,
  },
  {
    type: "light" as const,
    name: "Light",
    iosIconName: "sun.max" as SFSymbol,
  },
  {
    type: "dark" as const,
    name: "Dark",
    iosIconName: "moon" as SFSymbol,
  },
];

export default function BaseSettings() {
  const { styles, theme } = useStyles(stylesheet);
  const { styles: webStyles } = useStyles(webDropdownStyleSheet);
  const settingsStore = useSettingsStore();

  return (
    <View style={styles.container}>
      <Typography size="3xl" fontWeight="900">
        Settings
      </Typography>
      {/* <View style={styles.item}>
        <Typography size="xl" fontWeight="500">
          Card Size
        </Typography>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger action="press">
            <View style={styles.container}>
              <Typography
                size="xl"
                fontWeight="500"
                color="secondary"
                style={{
                  textTransform: "capitalize",
                }}
              >
                {settingsStore.settings.cardSize}
              </Typography>
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            style={webStyles.dropdownContent}
            align="end"
            alignOffset={-8}
            sideOffset={6}
          >
            {cardSizes.map((cardSize, index) => {
              return (
                <DropdownMenu.CheckboxItem
                  value={settingsStore.settings.cardSize === cardSize.type}
                  style={[
                    webStyles.dropdownCheckboxItem,
                    {
                      borderBottomWidth: index === cardSizes.length - 1 ? 0 : 1,
                    },
                  ]}
                  onValueChange={(next) => {
                    if (next === "on") {
                      settingsStore.updateSetting({
                        setting: "card-size",
                        type: cardSize.type,
                      });
                    }
                  }}
                  key={cardSize.type}
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    {cardSize.name}
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemSubtitle style={webStyles.dropdownSubTitle}>
                    {cardSize.description}
                  </DropdownMenu.ItemSubtitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: cardSize.iosIconName,
                    }}
                  />
                  {settingsStore.settings.cardSize === cardSize.type ? (
                    <AntDesign
                      name="checkcircle"
                      size={24}
                      color={theme.colors.typography}
                      style={webStyles.dropdownSubTriggerIcon}
                    />
                  ) : null}
                </DropdownMenu.CheckboxItem>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View> */}
      <View style={styles.item}>
        <Typography size="xl" fontWeight="500">
          Override Theme
        </Typography>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View style={styles.container}>
              <Typography
                size="xl"
                fontWeight="500"
                color="secondary"
                style={{
                  textTransform: "capitalize",
                }}
              >
                {settingsStore.settings.themeMode}
              </Typography>
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            style={webStyles.dropdownContent}
            align="end"
            alignOffset={-8}
            sideOffset={6}
          >
            {themes.map((option, index) => {
              return (
                <DropdownMenu.CheckboxItem
                  value={settingsStore.settings.themeMode === option.type}
                  style={{
                    ...webStyles.dropdownCheckboxItem,
                    borderBottomWidth: index === themes.length - 1 ? 0 : 1,
                  }}
                  onValueChange={(next) => {
                    if (next === "on") {
                      settingsStore.updateSetting({
                        setting: "theme",
                        mode: option.type,
                      });
                    }
                  }}
                  key={option.type}
                >
                  <DropdownMenu.ItemTitle style={webStyles.dropdownTitle}>
                    {option.name}
                  </DropdownMenu.ItemTitle>
                  <DropdownMenu.ItemIcon
                    ios={{
                      name: option.iosIconName,
                    }}
                  />
                  {settingsStore.settings.themeMode === option.type ? (
                    <AntDesign
                      name="checkcircle"
                      size={24}
                      color={theme.colors.typography}
                      style={webStyles.dropdownSubTriggerIcon}
                    />
                  ) : null}
                </DropdownMenu.CheckboxItem>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
      <View style={styles.item}>
        <Typography size="xl" fontWeight="500">
          Progressive Blurs
        </Typography>
        <Switch
          value={settingsStore.settings.progressiveBlursEnabled}
          onValueChange={(value) => {
            settingsStore.updateSetting({
              setting: "progressive-blurs",
            });
          }}
          trackColor={{
            true: "#0C83FE",
          }}
        />
      </View>
      <View style={styles.item}>
        <Typography size="xl" fontWeight="500">
          Haptics
        </Typography>
        <Switch
          value={settingsStore.settings.hapticsEnabled}
          onValueChange={(value) => {
            settingsStore.updateSetting({
              setting: "haptics",
            });
          }}
          trackColor={{
            true: "#0C83FE",
          }}
        />
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    gap: 18,
  },
  item: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
}));
