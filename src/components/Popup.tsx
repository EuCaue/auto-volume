import { PropsWithChildren } from "react";
import { View } from "react-native";
import { Button, Dialog, Icon, Portal, Text, useTheme } from "react-native-paper";

type PopupProps = {
  onClose: () => void;
  open: boolean;
  title: string;
  description: string;
} & PropsWithChildren;

export function Popup({
  onClose,
  open,
  title,
  description,
  children,
}: PopupProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose}>
        <Dialog.Title>
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon source="cog-outline" size={26} />

            <Text
              style={{
                textAlign: "center",
                ...theme.fonts.headlineMedium,
              }}
            >
              {title}
            </Text>

            <Text style={{ ...theme.fonts.bodyLarge }}>{description}</Text>
          </View>
        </Dialog.Title>

        <Dialog.Content>{children}</Dialog.Content>

        <Dialog.Actions style={{ justifyContent: "center" }}>
          <Button
            icon="check"
            mode="contained"
            onPress={onClose}
            labelStyle={{
              ...theme.fonts.titleLarge,
              textAlign: "center",
            }}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
