import React, {useEffect, useState} from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import {Appbar, BottomNavigation} from "react-native-paper";
import * as Location from "expo-location";
import GestureRecognizer from "react-native-swipe-gestures";

// https://api.open-meteo.com/v1/forecast?latitude=45.6958&longitude=-0.3287&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min // currently + weekly
// https://api.open-meteo.com/v1/forecast?latitude=45.6958&longitude=-0.3287&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=1 // today per hour
export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchPressed, setSearchPressed] = useState(false);
	const [locationPressed, setLocationPressed] = useState(false);
	const [text, setText] = useState("Currently");
	const [location, setLocation] = useState(null);
	const [errorMsg, setErrorMsg] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [lastResponse, setLastResponse] = useState(null);
	const [response, setResponse] = useState(null);
	const [index, setIndex] = useState(0);

	const routes = [
		{key: "currently", title: "Currently", focusedIcon: "calendar-today"},
		{key: "today", title: "Today", focusedIcon: "calendar-week"},
		{key: "weekly", title: "Weekly", focusedIcon: "calendar-month"},
	];

	const handleIndexChange = (newIndex) => {
		if (newIndex < 0) {
			newIndex = 2;
		} else if (newIndex > 2) {
			newIndex = 0;
		}
		setIndex(newIndex);
		if (newIndex === 0) setText("Currently");
		if (newIndex === 1) setText("Today");
		if (newIndex === 2) setText("Weekly");
	};

	const fetchCities = async (query, count) => {
		try {
			const response = await fetch(
				`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=${count}&language=en&format=json`
			);
			const data = await response.json();
			if (data.results) {
				if (data.results.length > 0) {
					setResponse(data.results[0]);
				} else {
					setResponse(null);
				}
				setSuggestions(data.results);
			} else {
				setResponse(null);
				setSuggestions([]);
			}
		} catch (error) {
			console.error("Erreur lors de la récupération des villes :", error);
			setSuggestions([]);
		}
	};

	useEffect(() => {
		fetchCities(searchQuery, 20);
	}, [searchQuery]);

	const handleSearchPress = () => {
		if (!searchQuery || searchQuery === "") {
			return;
		}
		setLocationPressed(false);
		setSearchPressed(true);
		setLastResponse(response);
		if (!response) {
			setErrorMsg(`Aucun résultat trouvé pour \"${searchQuery}\".`);
		} else {
			setErrorMsg("");
		}
		setSearchQuery("");
		setSuggestions([]);
	};

	const handleGeolocationPress = async () => {
		setSearchPressed(false);
		setLocationPressed(true);
		setErrorMsg("");

		let {status} = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("La localisation est désactivée. Activez-la dans les paramètres.");
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setLocation(location.coords);
	};

	const handleCitySelect = (item) => {
		Keyboard.dismiss()
		setResponse(item);
		handleSearchPress();
	};

	return (
		<GestureRecognizer
			onSwipeLeft={() => handleIndexChange(index + 1)}
			onSwipeRight={() => handleIndexChange(index - 1)}
			style={{flex: 1}}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<View style={styles.container}>
					<Appbar.Header style={styles.header}>
						<Appbar.Action color={"white"} icon="magnify" onPress={handleSearchPress}/>
						<View style={styles.searchContainer}>
							<View style={{flex: 1}}>
								<TextInput
									placeholder="Search"
									placeholderTextColor={"white"}
									value={searchQuery}
									onChangeText={setSearchQuery}
									style={styles.input}
									onBlur={() => setSuggestions([])}
								/>
							</View>
						</View>
						<Appbar.Action color={"white"} icon="crosshairs-gps" onPress={handleGeolocationPress}/>
					</Appbar.Header>
					<View style={{flex: 1}}>
						{suggestions.length > 0 && (
							<View style={styles.suggestionContainer}>
								<FlatList
									keyboardShouldPersistTaps="handled"
									data={suggestions}
									keyExtractor={(item) => item.id}
									renderItem={({item}) => (
										<TouchableOpacity onPress={() => handleCitySelect(item)}>
											<Text style={styles.suggestionText}>
												<Text style={styles.suggestionName}>{item.name}</Text>
												{item.admin1 ? (
													<Text style={styles.suggestionDetails}> {item.admin1}</Text>
												) : null}
												{item.country ? (
													<Text style={styles.suggestionDetails}>, {item.country}</Text>
												) : null}
											</Text>
										</TouchableOpacity>
									)}
								/>
							</View>
						)}
						<View style={styles.textContainer}>
							{!errorMsg && <Text style={styles.text}>{text}</Text>}
							{searchPressed && lastResponse ? (
									<Text style={styles.text}>{lastResponse.name}</Text>
								) :
								locationPressed && location ? (
									<Text style={styles.text}>
										Latitude: {location.latitude} {"\n"}Longitude: {location.longitude}
									</Text>
								) : errorMsg ? (
									<Text style={styles.errorText}>{errorMsg}</Text>
								) : locationPressed && <Text style={styles.text}>Obtention des coordonnées...</Text>}
						</View>
					</View>

					<BottomNavigation
						style={{flex: 0}}
						navigationState={{index, routes}}
						onIndexChange={handleIndexChange}
						renderScene={() => null}
					/>
				</View>

			</TouchableWithoutFeedback>
		</GestureRecognizer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		position: "relative",
		display: "flex",
		flexDirection: "row",
		backgroundColor: "gray",
		padding: 10
	},
	searchContainer: {
		flex: 1,
		paddingRight: 10,
		borderRightWidth: 1,
		borderRightColor: "#ddd",
	},
	input: {
		flex: 1,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 5,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		color: "white",
	},
	suggestionContainer: {
		flex: 1,
		backgroundColor: "white",
		position: "absolute",
		width: "100%",
		zIndex: 10,
		borderWidth: 1,
		borderColor: "#ddd",
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5,
		maxHeight: 300,
	},
	suggestionName: {
		fontWeight: "bold",
		color: "black",
	},
	suggestionDetails: {
		color: "gray",
	},
	suggestionText: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		fontSize: 16,
	},
	textContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	text: {
		fontSize: 20,
		textAlign: "center",
	},
	errorText: {
		fontSize: 18,
		color: "red",
		textAlign: "center",
	},
});

