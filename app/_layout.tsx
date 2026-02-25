import { Stack } from "expo-router";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack />
    </PaperProvider>
  );
}
