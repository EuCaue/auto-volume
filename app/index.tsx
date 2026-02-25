import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { Button, IconButton, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

export default function Index() {
  // TODO: should set/get from some storage
  const [isActive, setIsActive] = useState<boolean>(false);
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
        style={{...styles.toggleContainer, backgroundColor: theme.colors.primary}}
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
          onClick={() => console.log("bomdia volume")}
        />
        <SurfaceButton
          icon="clock-time-five-outline"
          onClick={() => console.log("bomdia time")}
        />
        <SurfaceButton
          icon="cog-outline"
          onClick={() => console.log("bomdia permission")}
        />
      </View>
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
