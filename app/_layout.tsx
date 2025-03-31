import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { UnistylesRuntime } from "react-native-unistyles";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import useSettingsStore from "@/src/store/useSettingsStore";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../src/utils/unistyles";
import useLibraryStore from "@/src/store/useLibraryStore";
import useCollectionsStore from "@/src/store/useCollectionsStore";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SFProDisplay: require("../assets/fonts/SF-Pro-Display-Regular.otf"),
    SFProDisplayMedium: require("../assets/fonts/SF-Pro-Display-Medium.otf"),
    SFProDisplaySemibold: require("../assets/fonts/SF-Pro-Display-Semibold.otf"),
    SFProDisplayBold: require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    SFProDisplayHeavy: require("../assets/fonts/SF-Pro-Display-Heavy.otf"),
    SFProDisplayBlack: require("../assets/fonts/SF-Pro-Display-Black.otf"),
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();
  const settingsStore = useSettingsStore((store) => store.settings);
  const libraryStore = useLibraryStore();
  const collectionsStore = useCollectionsStore();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // libraryStore.reset();
    // collectionsStore.reset();

    UnistylesRuntime.setAdaptiveThemes(settingsStore.themeMode === "system");
    if (settingsStore.themeMode !== "system") {
      UnistylesRuntime.setTheme(settingsStore.themeMode);
      StatusBar.setBarStyle(
        settingsStore.themeMode === "dark" ? "light-content" : "dark-content"
      );
      StatusBar.setBackgroundColor(
        settingsStore.themeMode === "dark" ? "black" : "white"
      );
    } else {
      StatusBar.setBarStyle(
        colorScheme === "dark" ? "light-content" : "dark-content"
      );
    }
  }, [settingsStore.themeMode, colorScheme]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="settings"
            options={{
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="comic/[id]"
            options={{
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="select-comic/[id]"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
