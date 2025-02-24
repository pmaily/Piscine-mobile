import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { Appbar } from "react-native-paper";
import * as Location from "expo-location"; // Importer expo-location

export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [displayedSearch, setDisplayedSearch] = useState(""); // Stocke la recherche validée
	const [searchPressed, setSearchPressed] = useState(false);
	const [locationPressed, setLocationPressed] = useState(false);
	const [text, setText] = useState("Currently");
	const [location, setLocation] = useState(null); // Stocke les coordonnées GPS
	const [errorMsg, setErrorMsg] = useState(""); // Stocke un message d'erreur

	const handleSearchPress = () => {
		setDisplayedSearch(searchQuery); // Affiche la valeur entrée après clic
		setSearchPressed(true);
		setLocationPressed(false);
		setErrorMsg(""); // Efface le message d'erreur précédent
	};

	const handleGeolocationPress = async () => {
		setSearchPressed(false);
		setLocationPressed(true);
		setErrorMsg(""); // Réinitialise le message d'erreur

		// Demander la permission de localisation
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("La localisation est désactivée. Activez-la dans les paramètres.");
			return;
		}

		// Obtenir la position actuelle
		let location = await Location.getCurrentPositionAsync({});
		setLocation(location.coords); // Stocker la latitude et la longitude
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
					{locationPressed && location ? (
						<Text style={styles.text}>
							Latitude: {location.latitude} {"\n"}Longitude: {location.longitude}
						</Text>
					) : locationPressed && errorMsg ? (
						<Text style={styles.errorText}>{errorMsg}</Text>
					) : locationPressed ? (
						<Text style={styles.text}>Obtention des coordonnées...</Text>
					) : null}
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
		fontSize: 20,
		marginBottom: 20,
		textAlign: "center",
	},
	errorText: {
		fontSize: 18,
		color: "red",
		textAlign: "center",
		marginTop: 10,
	},
});
