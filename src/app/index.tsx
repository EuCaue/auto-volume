import { useCallback, useState, useEffect, useRef } from "react";
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
import { formatTime, timerToMs } from "@/utils/time";
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVString,
} from "react-native-mmkv";
import { DEFAULT_VALUES, KEYS } from "@/utils/storage";

import { useNotificationsPermissions } from "@/features/notifications/useNotificationsPermissions";
import { createChannel } from "@/features/notifications/notificationsChannel";
import { registerNotificationEvents } from "@/features/notifications/notificationsEvents";

//  TODO: use toast
//  TODO: implement sidebar/header
//  TODO: maybe add a threshold
export default function Index() {
  const [isActive, setIsActive] = useMMKVBoolean(KEYS.isActive);
  const [timerValue, setTimerValue] = useMMKVString(KEYS.timerValue);
  const [volumeValue, setVolumeValue] = useMMKVNumber(KEYS.volumeValue);

  const [showVolumeDialog, setShowVolumeDialog] = useState<boolean>(false);
  const [showTimerDialog, setShowTimerDialog] = useState<boolean>(false);
  const theme = useTheme();

  //  TODO: use this 
  const { permissionGranted } = useNotificationsPermissions();
  console.log("PERMISSIONGRANTED", permissionGranted);

  useVolumeScheduler(timerValue!, volumeValue!);
  const timerError = useCallback((timeValue?: string) => {
    return timerToMs(timeValue ?? DEFAULT_VALUES.timerValue) <= 0;
  }, []);

  useEffect(() => {
    createChannel();
    const unsubscribe = registerNotificationEvents();
    return () => unsubscribe();
  }, []);

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
        onClose={() => {
          if (timerValue && timerToMs(timerValue) <= 0) {
            return;
          }
          setShowTimerDialog(false);
        }}
        open={showTimerDialog}
        title="Schedule"
        description="Configure the schedule that should trigger the volume."
      >
        <TextInput
          keyboardType="number-pad"
          value={timerValue}
          left={<TextInput.Icon icon="clock" />}
          error={timerError(timerValue)}
          right={
            <TextInput.Icon
              icon="close"
              onPress={() => setTimerValue(DEFAULT_VALUES.timerValue)}
            />
          }
          contentStyle={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
          onChangeText={(text) => {
            const timer = formatTime(text);
            setTimerValue(timer);
          }}
        />

        <HelperText
          visible
          type="info"
          style={{
            ...theme.fonts.titleSmall,
            textAlign: "center",
            color: timerError(timerValue)
              ? theme.colors.error
              : "current-color",
          }}
        >
          {timerError(timerValue)
            ? "Time must be greater than 00:00:00."
            : "HH:MM:SS"}
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
