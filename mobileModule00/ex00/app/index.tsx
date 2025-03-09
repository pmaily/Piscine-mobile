import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

export default function App() {
    const handlePress = () => {
        console.log('Button pressed');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>A simple text</Text>
            <Button mode="contained" onPress={handlePress} style={styles.button}>
                Click me
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
