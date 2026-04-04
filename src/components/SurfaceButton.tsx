import { StyleProp, ViewStyle } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

type SurfaceButtonProps = {
  icon: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SurfaceButton({ icon, onPress, style }: SurfaceButtonProps) {
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
        ...style
      }}
      onPress={onPress}
    />
  );
}
