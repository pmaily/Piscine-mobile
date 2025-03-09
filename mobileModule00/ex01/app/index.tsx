import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-paper';


export default function App() {
    const [text, setText] = useState("A simple text");

    const toggleText = () => {
        setText((prevText) => (prevText === "A simple text" ? "Hello World!" : "A simple text"));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
            <Button mode="contained" onPress={toggleText} style={styles.button}>
                Click me
            </Button>
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
    button: {
        width: '80%',
        maxWidth: 600,
    },
});