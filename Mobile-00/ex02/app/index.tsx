import React, {useState} from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {Appbar} from "react-native-paper";
import Grid from 'react-native-grid-component';

export default function Calculator() {
	const [expression, setExpression] = useState("0");
	const [result, setResult] = useState("0");
	const {width, height} = useWindowDimensions();
	const isPortrait = height > width;

	const handleButtonPress = (value: string) => {
		console.log("Button pressed:", value);
	};

	const renderItem = (button: string, index: number) => {
		if (button === "") {
			return <View/>;
		}

		return (
			<TouchableOpacity
				key={index}
				style={styles.button}
				onPress={() => handleButtonPress(button)}
			>
				<Text style={styles.buttonText}>{button}</Text>
			</TouchableOpacity>
		);
	};

	const buttons = [
		"7", "8", "9", "0", "C", "AC",
		"4", "5", "6", "+", "-", ".",
		"1", "2", "3", "*", "/", "="
	];

	const buttons2 = [
		"7", "8", "9", "*",
		"4", "5", "6", "/",
		"1", "2", "3", "+",
		"0", "-", "=", "-",
		"C", "", "", "AC"
	];

	return (
		<View style={styles.container}>
			<Appbar.Header style={styles.header}>
				<Appbar.Content title="Calculator"/>
			</Appbar.Header>
			<View style={styles.display}>
				<View style={{ flex: 1 }}>
					<TextInput
						value={expression}
						style={[styles.input, isPortrait ? styles.inputPortrait : styles.inputLandscape]}
						editable={false}
					/>
					<TextInput
						value={result}
						style={[styles.input, isPortrait ? styles.inputPortrait : styles.inputLandscape]}
						editable={false}
					/>
				</View>
				<Grid
					key={isPortrait ? "portrait" : "landscape"}
					renderItem={renderItem}
					data={isPortrait ? buttons2 : buttons}
					numColumns={isPortrait ? 4 : 6}
					style={styles.grid}
				/>
			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		height: 30,
	},
	display: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		paddingHorizontal: 30,
	},
	input: {
		fontSize: 18,
		marginBottom: 10,
		textAlign: "right",
		paddingVertical: 10,
		backgroundColor: "#f1f1f1",
		borderRadius: 8,
		paddingHorizontal: 15,
	},
	inputPortrait: {
		fontSize: 36,
		height: 60,
	},
	inputLandscape: {
		fontSize: 24,
		height: 50,
	},
	grid: {
		paddingBottom: 20,
	},
	button: {
		flex: 1,
		margin: 5,
		backgroundColor: '#ddd',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		borderRadius: 10,
	},
	buttonText: {
		fontSize: 20,
	},
});