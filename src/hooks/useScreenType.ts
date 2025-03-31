import { useWindowDimensions } from "react-native";
import React from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export default function useScreenType() {
  const { width } = useWindowDimensions();
  const [orientation, setOrientation] = React.useState<
    "portrait" | "landscape"
  >("portrait");

  React.useEffect(() => {
    function onOrientationChange(
      event: ScreenOrientation.OrientationChangeEvent
    ) {
      const portrait = [
        ScreenOrientation.Orientation.PORTRAIT_UP,
        ScreenOrientation.Orientation.PORTRAIT_DOWN,
      ];
      setOrientation(
        portrait.includes(event.orientationInfo.orientation)
          ? "portrait"
          : "landscape"
      );
    }

    const sub =
      ScreenOrientation.addOrientationChangeListener(onOrientationChange);

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, []);

  return {
    isMobile: width < 480,
    isSmallTablet:
      orientation === "landscape"
        ? width >= 480 && width < 768
        : width <= 1366 && width >= 1024,
    // isSmallTablet: true,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}
