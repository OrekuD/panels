import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";

type ThemeSetting = {
  setting: "theme";
  mode: "light" | "dark" | "system";
};

type ProgressiveBlursSetting = {
  setting: "progressive-blurs";
};

type HapticsSetting = {
  setting: "haptics";
};

type UpdateSetting = ThemeSetting | ProgressiveBlursSetting | HapticsSetting;

type Settings = {
  themeMode: ThemeSetting["mode"];
  progressiveBlursEnabled: boolean;
  hapticsEnabled: boolean;
};

type SettingsStore = {
  settings: Settings;
  updateSetting: (setting: UpdateSetting) => void;
};

const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      settings: {
        fontType: "san-francisco",
        cardSize: "medium",
        themeMode: "system",
        progressiveBlursEnabled: true,
        hapticsEnabled: true,
      },
      updateSetting: (setting) => {
        switch (setting.setting) {
          case "theme":
            return set((prevState) => ({
              ...prevState,
              settings: {
                ...prevState.settings,
                themeMode: setting.mode,
              },
            }));

          case "progressive-blurs":
            return set((prevState) => ({
              ...prevState,
              settings: {
                ...prevState.settings,
                progressiveBlursEnabled:
                  !prevState.settings.progressiveBlursEnabled,
              },
            }));

          case "haptics":
            return set((prevState) => ({
              ...prevState,
              settings: {
                ...prevState.settings,
                hapticsEnabled: !prevState.settings.hapticsEnabled,
              },
            }));

          default:
            break;
        }
      },
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useSettingsStore;
