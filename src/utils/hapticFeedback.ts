import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function hapticFeedback() {
  if (Platform.OS !== "ios") return; // maybe add android vibration later
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
