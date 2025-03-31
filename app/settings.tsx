import BaseSettings from "@/src/components/settings/BaseSettings";
import { Platform, ScrollView, Switch, View } from "react-native";
import {
  UnistylesRuntime,
  createStyleSheet,
  mq,
  useStyles,
} from "react-native-unistyles";
// import BaseSettings from "@/src/components/settings/BaseSettings";
// import GesturesSettings from "@/src/components/settings/GesturesSettings";
// import ArticlesSettings from "@/src/components/settings/ArticlesSettings";

export default function Screen() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.innerContainer,
          Platform.OS === "web"
            ? styles.webContainer
            : {
                flex: 1,
              },
        ]}
      >
        <View style={styles.knob} />
        <ScrollView contentContainerStyle={styles.scrollview}>
          <BaseSettings />
        </ScrollView>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
  },
  innerContainer: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  webContainer: {
    width: {
      [mq.only.width(0, 480)]: UnistylesRuntime.screen.width - 32,
      [mq.only.width(480, 768)]: UnistylesRuntime.screen.width * 0.8,
      [mq.only.width(768, 1024)]: UnistylesRuntime.screen.width * 0.75,
      [mq.only.width(1024, 1440)]: 740,
      [mq.only.width(1440)]: 940,
    },
    height: {
      [mq.only.width(0, 480)]: UnistylesRuntime.screen.height * 0.9,
      [mq.only.width(480)]: UnistylesRuntime.screen.height * 0.9,
    },
    alignSelf: "center",
    marginVertical: "auto",
    borderRadius: 12,
  },
  scrollview: {
    gap: 28,
    paddingTop: 44,
    paddingBottom: 60,
    paddingHorizontal: {
      [mq.only.width(0, 480)]: theme.margins["2xl"],
      [mq.only.width(480, 768)]: theme.margins["2xl"] * 1.5,
      [mq.only.width(768)]: theme.margins["2xl"] * 2,
    },
  },
  knob: {
    width: 44,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gray200,
    alignSelf: "center",
    position: "absolute",
    transform: [{ translateX: -22 }],
    left: "50%",
    top: 6,
    zIndex: 10,
  },
}));
