import { Stack } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";

export default function Layout() {
  return (
      <ImageBackground
          source={require("../assets/images/v722-aum-31b.jpg")}
          style={{ width: '100%', height: '100%', backgroundColor: "white" }}
          resizeMode="cover"
      >
          <Stack
              screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                  animation: "none",
              }}
          />
      </ImageBackground>
  );
}
