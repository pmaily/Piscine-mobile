import { Stack } from "expo-router";
import { useWindowDimensions } from "react-native";

export default function RootLayout() {
    const { height, width } = useWindowDimensions();
    const isPortrait = height > width;

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Calculator",
                    headerShown: false,
                    headerTitleStyle: {
                        fontSize: isPortrait ? 18 : 24,
                    },
                }}
            />
        </Stack>
    );
}
