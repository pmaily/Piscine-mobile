import React, {useEffect, useState} from "react";
import {
	FlatList,
	ImageBackground,
	Keyboard,
	ScrollView,
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
import GestureHandler from "react-native-gesture-handler/lib/typescript/web/handlers/GestureHandler";

// https://api.open-meteo.com/v1/forecast?latitude=45.6958&longitude=-0.3287&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min // currently + weekly
// https://api.open-meteo.com/v1/forecast?latitude=45.6958&longitude=-0.3287&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=1 // today per hour
export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [locationPressed, setLocationPressed] = useState(false);
	const [text, setText] = useState("Currently");
	const [errorMsg, setErrorMsg] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [response, setResponse] = useState(null);
	const [lastResponse, setLastResponse] = useState(null);
	const [index, setIndex] = useState(0);
	const [currentWeeklyWeather, setCurrentWeeklyWeather] = useState(null);
	const [dailyWeather, setDailyWeather] = useState(null);

	const routes = [
		{key: "currently", title: "Currently", focusedIcon: "calendar-today"},
		{key: "today", title: "Today", focusedIcon: "calendar-week"},
		{key: "weekly", title: "Weekly", focusedIcon: "calendar-month"},
	];

	const handleIndexChange = (newIndex: number) => {
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

	const fetchWeather = async (latitude: number, longitude: number) => {
		try {
			let response = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min`
			);
			let data = await response.json();
			if (data) {
				setCurrentWeeklyWeather(data);
			} else {
				setErrorMsg("Error while fetching the weather data.");
				return;
			}
			response = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=1`
			);
			data = await response.json();
			if (data) {
				setDailyWeather(data);
			} else {
				setErrorMsg("Error while fetching the weather data.");
				return;
			}
		} catch (error) {
			setErrorMsg("Error while fetching the weather data.");
		}
	}

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
			setErrorMsg("Error while fetching cities.");
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
		setLastResponse(response);
		if (!response) {
			setErrorMsg(`Nothing found for \"${searchQuery}\".`);
		} else {
			setErrorMsg("");
			fetchWeather(response.latitude, response.longitude)
		}
		setSearchQuery("");
		setSuggestions([]);
	};

	const handleGeolocationPress = async () => {
		setLocationPressed(true);
		setErrorMsg("");

		let {status} = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Location is disabled. Please enable it in the settings.");
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		await fetchWeather(location.coords.latitude, location.coords.longitude)
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
			waitFor={GestureHandler.ScrollView}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ImageBackground
					source={{uri: 'https://cdn.futura-sciences.com/cdn-cgi/image/width=1920,quality=60,format=auto/sources/images/actu/ciel-bleu_01.jpg'}}
					resizeMode="cover"
					style={styles.container}>
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
						<ScrollView contentContainerStyle={{flexGrow: 1}}>
							<View style={{flex: 1, padding: 20}} onStartShouldSetResponder={() => true}>
								{!errorMsg && <Text style={styles.text}>{text}</Text>}
								{!errorMsg && locationPressed ?
									(<Text style={styles.text}>
										Your position
									</Text>) : !errorMsg && lastResponse &&
									(<Text style={styles.text}>
										{lastResponse.name}{"\n"}
										{lastResponse.admin1}{"\n"}
										{lastResponse.country}
									</Text>)
								}
								{
									errorMsg ? (
										<View style={{flex: 1, justifyContent: "center"}}>
											<Text style={styles.errorText}>{errorMsg}</Text>
										</View>
									) : index === 0 && currentWeeklyWeather && currentWeeklyWeather.current ? (
										<Text style={styles.text}>
											{currentWeeklyWeather.current.temperature_2m}°C{"\n"}
											{currentWeeklyWeather.current.weather_code}{"\n"}
											{currentWeeklyWeather.current.wind_speed_10m}km/h
										</Text>
									) : index === 1 && dailyWeather && dailyWeather.hourly && dailyWeather.hourly.time ? (
										dailyWeather.hourly.time.map((entry, index) => (
											<Text key={index} style={styles.text}>
												{entry.split("T")[1]} {dailyWeather.hourly.temperature_2m[index]}°C {dailyWeather.hourly.weather_code[index]} {dailyWeather.hourly.wind_speed_10m[index]} km/h
											</Text>
										))
									) : index === 2 && currentWeeklyWeather && currentWeeklyWeather.daily && currentWeeklyWeather.daily.time && (
										currentWeeklyWeather.daily.time.map((entry, index) => (
											<Text key={index} style={styles.text}>
												{entry.split("T")[0]} {currentWeeklyWeather.daily.temperature_2m_min[index]}°C {currentWeeklyWeather.daily.temperature_2m_max[index]}°C {currentWeeklyWeather.daily.weather_code[index]}
											</Text>
										))
									)}
							</View>
						</ScrollView>
					</View>

					<BottomNavigation
						barStyle={{backgroundColor: 'transparent'}}
						style={{flex: 0}}
						navigationState={{index, routes}}
						onIndexChange={handleIndexChange}
						renderScene={() => null}
					/>
				</ImageBackground>

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

