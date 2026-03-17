import { Stack } from "expo-router";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack screenOptions={{ title: "Auto Volume", headerTitleAlign: "center" }} />
    </PaperProvider>
  );
}
