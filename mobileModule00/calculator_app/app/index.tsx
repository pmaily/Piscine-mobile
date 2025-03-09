import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Appbar } from "react-native-paper";
import Grid from "react-native-grid-component";
import { evaluate } from "mathjs";

export default function Calculator() {
	const [expression, setExpression] = useState("0");
	const [result, setResult] = useState("0");
	const { width, height } = useWindowDimensions();
	const isPortrait = height > width;

	const handlePress = (value: string) => {
		if (value === "AC") {
			setExpression("0");
			setResult("0");
		} else if (value === "C") {
			setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
		} else if (value === "=") {
			try {
				const res = evaluate(expression);
				setResult(res.toString());
			} catch (error) {
				setResult("Error");
			}
		} else {
			setExpression((prev) => (prev === "0" ? value : prev + value));
		}
	};

	const renderItem = (button: string, index: number) => {
		if (button === "") {
			return <View />;
		}

		return (
			<TouchableOpacity key={index} style={styles.button} onPress={() => handlePress(button)}>
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
		"0", ".", "=", "-",
		"C", "", "", "AC"
	];

	const scrollViewRefExpression = useRef<ScrollView>(null);
	const scrollViewRefResult = useRef<ScrollView>(null);

	const scrollToEnd = (scrollViewRef: React.RefObject<ScrollView>) => {
		setTimeout(() => {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	useEffect(() => {
		scrollToEnd(scrollViewRefExpression);
	}, [expression]);

	useEffect(() => {
		scrollToEnd(scrollViewRefResult);
	}, [result]);

	return (
		<View style={styles.container}>
			<Appbar.Header style={styles.header}>
				<Appbar.Content title="Calculator" />
			</Appbar.Header>
			<View style={styles.display}>
				<View style={{ flex: 1 }}>
					<View style={[styles.input, isPortrait ? styles.inputPortrait : styles.inputLandscape]}>
						<ScrollView
							ref={scrollViewRefExpression}
							key={isPortrait ? "portrait" : "landscape"}
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.scrollViewContainer}
						>
							<Text
								style={[
									isPortrait ? { fontSize: 36, textAlign: "right", flex:1 } : { fontSize: 24, textAlign: "right", flex: 1 }
								]}
								numberOfLines={1}
							>
								{expression}
							</Text>
						</ScrollView>
					</View>
					<View style={[styles.input, isPortrait ? styles.inputPortrait : styles.inputLandscape]}>
						<ScrollView
							ref={scrollViewRefResult}
							key={isPortrait ? "portrait" : "landscape"}
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.scrollViewContainer}
						>
							<Text
								style={[
									isPortrait ? { fontSize: 36, textAlign: "right", flex:1 } : { fontSize: 24, textAlign: "right", flex: 1 }
								]}
								numberOfLines={1}
							>
								{result}
							</Text>
						</ScrollView>
					</View>
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
		overflow: "hidden",
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
		textAlign: "right",
		fontSize: 18,
		marginBottom: 10,
		paddingVertical: 10,
		backgroundColor: "#f1f1f1",
		borderRadius: 8,
		paddingHorizontal: 15,
		flex: 1,
	},
	scrollViewContainer: {
		flexDirection: "row",
		flexGrow: 1,
		justifyContent: "flex-start",
	},
	inputPortrait: {
		fontSize: 36,
		maxHeight: 60,
	},
	inputLandscape: {
		fontSize: 24,
		maxHeight: 50,
	},
	grid: {
		paddingBottom: 20,
	},
	button: {
		flex: 1,
		margin: 5,
		backgroundColor: "#ddd",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		borderRadius: 10,
	},
	buttonText: {
		fontSize: 20,
	},
});
