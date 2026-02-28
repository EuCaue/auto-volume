import { StyleSheet, View } from "react-native";
import { useState } from "react";
import {
  Button,
  Dialog,
  HelperText,
  Icon,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import Slider from "@react-native-community/slider";

function formatTime(input: string) {
  const numbers = input.replace(/\D/g, "").slice(-6);
  const padded = numbers.padStart(6, "0");

  const hours = padded.slice(0, 2);
  const minutes = padded.slice(2, 4);
  const seconds = padded.slice(4, 6);

  return `${hours}:${minutes}:${seconds}`;
}

export default function Index() {
  // TODO: should set/get from some storage
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showVolumeDialog, setShowVolumeDialog] = useState<boolean>(false);
  const [showTimerDialog, setShowTimerDialog] = useState<boolean>(false);
  const [timerValue, setTimerValue] = useState<string>("00:00:00");
  const [volumeValue, setVolumeValue] = useState<number>(100);
  const theme = useTheme();

  return (
    <View style={styles.flex}>
      <IconButton
        mode="contained"
        icon={() => {
          return (
            <MaterialCommunityIcons
              name="power"
              size={145}
              color={
                isActive
                  ? theme.colors.onSecondary
                  : theme.colors.onSecondaryContainer
              }
            />
          );
        }}
        style={{
          ...styles.toggleContainer,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => {
          setIsActive(!isActive);
        }}
      />
      <View
        style={{
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 20,
          paddingHorizontal: 20,
        }}
      >
        <SurfaceButton
          icon="volume-high"
          onClick={() => setShowVolumeDialog(true)}
        />
        <SurfaceButton
          icon="clock-time-five-outline"
          onClick={() => setShowTimerDialog(true)}
        />
        <SurfaceButton
          icon="cog-outline"
          onClick={() => console.log("bomdia permission")}
        />
      </View>
      <Popup
        onClose={() => {
          setShowVolumeDialog(false);
        }}
        open={showVolumeDialog}
        title="Volume"
        desc="Configure the volume level that should be setted."
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Icon source={"volume-high"} size={48} allowFontScaling />
          <Slider
            style={{ width: "70%" }}
            minimumValue={0}
            maximumValue={100}
            value={volumeValue}
            onValueChange={setVolumeValue}
            step={1}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.onBackground}
            thumbTintColor={theme.colors.primary}
          />
          <Text style={{ ...theme.fonts.titleLarge, width: "100%" }}>
            {volumeValue}
          </Text>
        </View>
      </Popup>

      <Popup
        onClose={() => {
          setShowTimerDialog(false);
        }}
        open={showTimerDialog}
        title="Schedule"
        desc="Configure the schedule that should trigger the volume after device volume is changed."
      >
        <TextInput
          keyboardType="number-pad"
          value={timerValue}
          left={<TextInput.Icon icon="clock" />}
          right={
            <TextInput.Icon
              icon="close"
              onPress={() => setTimerValue("00:00:00")}
            />
          }
          contentStyle={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
          onChangeText={(text) => {
            setTimerValue(formatTime(text));
          }}
        />
        <HelperText
          visible
          type="info"
          style={{
            ...theme.fonts.titleSmall,
            textAlign: "center",
          }}
        >
          HH:MM:SS
        </HelperText>
      </Popup>
    </View>
  );
}

//  TODO: get the type of  MaterialIcon or surface
type SurfaceButtonProps = {
  icon: string;
  onClick: CallableFunction;
};

function SurfaceButton({ icon, onClick }: SurfaceButtonProps) {
  const theme = useTheme();
  const size = theme.fonts.displayMedium.fontSize;
  const box = size * 1.5;

  return (
    <IconButton
      icon={icon}
      size={size}
      mode="contained-tonal"
      style={{
        width: box,
        height: box,
        borderRadius: box / 2,
      }}
      onPress={() => onClick()}
    />
  );
}

type PopupProps = {
  onClose: () => void;
  open: boolean;
  title: string;
  desc: string;
} & React.PropsWithChildren;

function Popup({ onClose, open, title, desc, children }: PopupProps) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose}>
        <Dialog.Title>
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              flex: 1,
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon source="cog-outline" size={26} />
            <Text
              style={{
                textAlign: "center",
                width: "auto",
                ...theme.fonts.headlineMedium,
              }}
            >
              {title}
            </Text>
            <Text style={{ ...theme.fonts.bodyLarge }}>
              Configure the volume level that should be set.
            </Text>
          </View>
        </Dialog.Title>
        <Dialog.Content>{children}</Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "center" }}>
          <Button
            icon="check"
            mode="contained"
            onPress={onClose}
            labelStyle={{
              ...theme.fonts.titleLarge, // usa tipografia do Material 3
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
            }}
            contentStyle={{
              paddingHorizontal: 12,
            }}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  toggleIcon: {
    marginLeft: 6,
    justifyContent: "center",
  },
});
