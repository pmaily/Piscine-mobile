import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Appbar } from "react-native-paper";

export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [displayedSearch, setDisplayedSearch] = useState(""); // Stocke la valeur après clic
	const [searchPressed, setSearchPressed] = useState(false);
	const [locationPressed, setLocationPressed] = useState(false);
	const [text, setText] = useState("Currently");

	const handleSearchPress = () => {
		setDisplayedSearch(searchQuery); // Affiche la valeur entrée après le clic
		setSearchPressed(true);
		setLocationPressed(false);
	};

	const handleGeolocationPress = () => {
		setSearchPressed(false);
		setLocationPressed(true);
	};

	return (
		<View style={styles.container}>
			<Appbar.Header style={styles.header}>
				<View style={styles.searchContainer}>
					<TextInput
						placeholder="Search"
						value={searchQuery}
						onChangeText={(text) => {
							if (text.length <= 20) setSearchQuery(text); // Limite à 20 caractères
						}}
						style={styles.input}
					/>
					<Appbar.Action icon="magnify" onPress={handleSearchPress} />
					<Appbar.Action icon="crosshairs-gps" onPress={handleGeolocationPress} />
				</View>
			</Appbar.Header>

			<View style={{ flex: 1 }}>
				<View style={styles.textContainer}>
					<Text style={styles.text}>{text}</Text>
					{searchPressed && <Text style={styles.text}>{displayedSearch}</Text>}
					{locationPressed && <Text style={styles.text}>Geolocation</Text>}
				</View>
				<View style={styles.tabBar}>
					<Button title="Currently" onPress={() => setText("Currently")} />
					<Button title="Today" onPress={() => setText("Today")} />
					<Button title="Weekly" onPress={() => setText("Weekly")} />
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		backgroundColor: "#fff",
	},
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 15,
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	header: {
		backgroundColor: "#6200ee",
	},
	searchContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
	},
	input: {
		flex: 1,
		marginRight: 10,
		backgroundColor: "white",
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	textContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	text: {
		fontSize: 24,
		marginBottom: 20,
	},
});
