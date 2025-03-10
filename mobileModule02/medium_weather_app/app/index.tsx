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
import {GestureHandlerRootView, PanGestureHandler} from "react-native-gesture-handler";

export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [locationPressed, setLocationPressed] = useState(false);
	const [text, setText] = useState("Currently");
	const [errorMsg, setErrorMsg] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [response, setResponse] = useState(null);
	const [lastResponse, setLastResponse] = useState(null);
	const [index, setIndex] = useState(0);
	const [weather, setWeather] = useState({
		current: null,
		daily: null,
		weekly: null
	});
	const [isSwiping, setIsSwiping] = useState(false);
	const [swipeTimeout, setSwipeTimeout] = useState(null);

	const routes = [
		{key: "currently", title: "Currently", focusedIcon: "calendar-today"},
		{key: "today", title: "Today", focusedIcon: "calendar-week"},
		{key: "weekly", title: "Weekly", focusedIcon: "calendar-month"},
	];

	const getWeatherDescription = (code: number) => {
		switch (code) {
			case 0:
				return "Clear";

			case 1:
			case 2:
			case 3:
				return "Partly cloudy";

			case 45:
			case 48:
				return "Fog";

			case 51:
			case 53:
			case 55:
				return "Drizzle";

			case 56:
			case 57:
				return "Freezing drizzle"

			case 61:
			case 63:
			case 65:
				return "Rain";

			case 66:
			case 67:
				return "Freezing rain";

			case 71:
			case 73:
			case 75:
				return "Snow fall";

			case 77:
				return "Snow grains";

			case 80:
			case 81:
			case 82:
				return "Rain showers";

			case 85:
			case 86:
				return "Rain showers";

			case 95:
				return "Thunderstorm";

			case 96:
			case 99:
				return "Thunderstorm and hail";

			default:
				return "Unkown";
		}
	};

	const handlePanGesture = (event) => {
		const { translationX, translationY } = event.nativeEvent;
		const SENSITIVITY_THRESHOLD = 50;

		if (!isSwiping && Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > SENSITIVITY_THRESHOLD) {
			setIsSwiping(true);

			if (swipeTimeout) clearTimeout(swipeTimeout);

			const newIndex = translationX < 0 ? index + 1 : index - 1;

			const timeout = setTimeout(() => {
				handleIndexChange(newIndex);
				setIsSwiping(false);
			}, 100);

			setSwipeTimeout(timeout);
		}
	};


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
			const [weeklyResponse, dailyResponse] = await Promise.all([
				fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min`),
				fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=1`)
			]);

			const [weeklyData, dailyData] = await Promise.all([
				weeklyResponse.json(),
				dailyResponse.json()
			]);

			setWeather({
				current: weeklyData.current,
				daily: dailyData.hourly,
				weekly: weeklyData.daily
			});

		} catch (error) {
			setErrorMsg("Error while fetching the weather data.");
		}
	};

	const fetchCities = async (query: string, count: number) => {
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
		<GestureHandlerRootView style={{flex: 1}}>
			<PanGestureHandler onHandlerStateChange={handlePanGesture}>
				<View style={{flex: 1}}>
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
															<Text
																style={styles.suggestionDetails}>, {item.country}</Text>
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
											) : index === 0 && weather && weather.current ? (
												<Text style={styles.text}>
													{weather.current.temperature_2m}°C{"\n"}
													{getWeatherDescription(weather.current.weather_code)}{"\n"}
													{weather.current.wind_speed_10m}km/h
												</Text>
											) : index === 1 && weather && weather.daily && weather.daily.time ? (
												weather.daily.time.map((entry, index) => (
													<Text key={index} style={styles.text}>
														{entry.split("T")[1]} {weather.daily.temperature_2m[index]}°C {getWeatherDescription(weather.daily.weather_code[index])} {weather.daily.wind_speed_10m[index]} km/h
													</Text>
												))
											) : index === 2 && weather && weather.weekly && weather.weekly.time && (
												weather.weekly.time.map((entry, index) => (
													<Text key={index} style={styles.text}>
														{entry.split("T")[0]} {weather.weekly.temperature_2m_min[index]}°C {weather.weekly.temperature_2m_max[index]}°C {getWeatherDescription(weather.weekly.weather_code[index])}
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
								activeColor="white"
								inactiveColor="white"
							/>
						</ImageBackground>
					</TouchableWithoutFeedback>
				</View>
			</PanGestureHandler>
		</GestureHandlerRootView>
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
		backgroundColor: "transparent",
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

