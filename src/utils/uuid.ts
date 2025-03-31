import rnUuid from "react-native-uuid";

export default function uuid() {
  return rnUuid.v4().toString();
}
