import { Text, View } from "react-native";
import Point from "./contents/chapter_3/section_1";
import { Redirect } from 'expo-router'

export default function Index() {
  return (
    <View>
      <Redirect href={"/(menu)" as any} />
    </View>
  );
}
