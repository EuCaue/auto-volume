import { useState } from "react";
import { StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import Slider from "@react-native-community/slider";
import {
  HelperText,
  Icon,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { Popup } from "@/components/Popup";
import { SurfaceButton } from "@/components/SurfaceButton";
import { useVolumeScheduler } from "@/features/volume/useVolumeScheduler";
import { formatTime } from "@/utils/time";

export default function Index() {
  //  TODO: need to put those into a store
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timerValue, setTimerValue] = useState<string>("00:00:05");
  const [volumeValue, setVolumeValue] = useState<number>(100);

  const [showVolumeDialog, setShowVolumeDialog] = useState<boolean>(false);
  const [showTimerDialog, setShowTimerDialog] = useState<boolean>(false);
  const theme = useTheme();

  useVolumeScheduler(timerValue, volumeValue);

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
          onPress={() => setShowVolumeDialog(true)}
        />

        <SurfaceButton
          icon="clock-time-five-outline"
          onPress={() => setShowTimerDialog(true)}
        />

        <SurfaceButton
          icon="cog-outline"
          onPress={async () => {
            console.log("permission button");
          }}
        />
      </View>

      <Popup
        onClose={() => setShowVolumeDialog(false)}
        open={showVolumeDialog}
        title="Volume"
        description="Configure the volume level that should be set."
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Icon source="volume-high" size={48} />

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
        onClose={() => setShowTimerDialog(false)}
        open={showTimerDialog}
        title="Schedule"
        description="Configure the schedule that should trigger the volume."
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
          onChangeText={text => {
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
});
