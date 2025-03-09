import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function App() {
    const [text, setText] = useState("A simple text");

    const toggleText = () => {
        setText((prevText) => (prevText === "A simple text" ? "Hello World!" : "A simple text"));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
            <Button title="Toggle Text" onPress={toggleText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        marginBottom: 20,
    },
});