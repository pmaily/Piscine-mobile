import React, {useEffect, useState} from "react";
import {
	FlatList,
	ImageBackground,
	Keyboard,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import {Appbar, BottomNavigation, Icon} from "react-native-paper";
import * as Location from "expo-location";
import {GestureHandlerRootView, PanGestureHandler} from "react-native-gesture-handler";
import {BlurView} from "expo-blur";
import {LineChart} from "react-native-chart-kit";

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
	const [containerWidth, setContainerWidth] = useState(0);
	const [scrollParentenabled, setScrollParentEnabled] = useState(true);

	const getDailyData = () => {
		return {
			labels: weather.daily.time,
			datasets: [
				{
					data: weather.daily.temperature_2m,
					color: (opacity = 1) => `rgba(0, 255, 150, ${opacity})`, // optional
					strokeWidth: 2
				}
			],
			legend: ["Temperature"]
		}
	};

	const getWeeklyData = () => {
		return {
			labels: weather.weekly.time,
			datasets: [
				{
					data: weather.weekly.temperature_2m_min,
					color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`, // optional
					strokeWidth: 2
				},
				{
					data: weather.weekly.temperature_2m_max,
					color: (opacity = 1) => `#ff4200`, // optional
					strokeWidth: 2
				}
			],
			legend: ["T min", "T max"]
		}
	};

	const chartConfig = {
		color: (opacity = 1) => `white`,
		strokeWidth: 0,
		backgroundGradientFromOpacity: 0,
		backgroundGradientToOpacity: 0,
		propsForBackgroundLines: {
			strokeWidth: 0,
			strokeDasharray: "4"
		}
	};

	const routes = [
		{key: "currently", title: "Currently", focusedIcon: "calendar-today"},
		{key: "today", title: "Today", focusedIcon: "calendar-week"},
		{key: "weekly", title: "Weekly", focusedIcon: "calendar-month"},
	];

	const getWeatherIconAndColor = (code: number) => {
		switch (code) {
			case 0:
				return {icon: "weather-sunny", color: "yellow", description: "Clear"};
			case 1:
			case 2:
				return {icon: "weather-partly-cloudy", color: "yellow", description: "Partly cloudy"};
			case 3:
				return {icon: "weather-cloudy", color: "lightgray", description: "Cloudy"};
			case 45:
			case 48:
				return {icon: "weather-fog", color: "gray", description: "Fog"};
			case 51:
			case 53:
			case 55:
			case 56:
			case 57:
				return {icon: "weather-hail", color: "blue", description: "Drizzle"};
			case 61:
			case 63:
			case 65:
			case 66:
			case 67:
				return {icon: "weather-rainy", color: "blue", description: "Rainy"};
			case 71:
			case 73:
			case 75:
			case 77:
				return {icon: "weather-snowy-heavy", color: "lightblue", description: "Snowy"};
			case 80:
			case 81:
			case 82:
			case 85:
			case 86:
				return {icon: "weather-pouring", color: "blue", description: "Heavy rain"};
			case 95:
				return {icon: "weather-lightning", color: "#404344", description: "Thunderstorm"};
			case 96:
			case 99:
				return {icon: "weather-lightning-rainy", color: "#404344", description: "Thunderstorm with rain"};
			default:
				return {icon: "weather-cloudy", color: "gray", description: "Unknown"};
		}
	};


	const handlePanGesture = (event) => {
		const {translationX, translationY} = event.nativeEvent;
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
		fetchCities(searchQuery, 5);
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

	const onLayout = (event) => {
		const {width} = event.nativeEvent.layout;
		setContainerWidth(width);
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
								<SafeAreaView style={{flex: 1}}>
									<ScrollView
										onTouchStart={() => setScrollParentEnabled(true)}
										keyboardShouldPersistTaps="handled"
										scrollEnabled={scrollParentenabled}
										style={{flex: 1}}
										contentContainerStyle={{flexGrow: 1}}>

										<View style={{flex: 1, padding: 20}}>
											{!errorMsg && <Text style={[styles.text, {fontSize: 40}]}>{text}</Text>}
											{!errorMsg && locationPressed ?
												(<Text style={[styles.text, {fontSize: 20}]}>
													Your position
												</Text>) : !errorMsg && lastResponse &&
												(<Text style={[styles.text, {fontSize: 20}]}>
													<Text style={{fontWeight: "bold"}}>
														{lastResponse.name}{" "}
													</Text>
													{lastResponse.admin1}{lastResponse.admin1 && ","} {lastResponse.country}
												</Text>)
											}
											{
												errorMsg ? (
													<View style={{flex: 1, justifyContent: "center"}}>
														<Text style={styles.errorText}>{errorMsg}</Text>
													</View>
												) : index === 0 && weather && weather.current ? (
													<View style={{flex: 1, marginTop: 50}}>
														<View style={{display: "flex", flexDirection: "row"}}>
															<View style={{flex: 4}}>
																<BlurView
																	intensity={30}
																	tint="dark"
																	style={styles.blurview}
																>
																	<Icon
																		source="thermometer"
																		color={weather.current.temperature_2m > 20 ? "red" : weather.current.temperature_2m > 12 ? "orange" : "#00d0f5"}
																		size={80}
																	/>
																	<Text style={styles.blurtext}>
																		{weather.current.temperature_2m}
																		<Icon size={20} source="temperature-celsius"
																			  color={"white"}/>
																	</Text>

																</BlurView>
															</View>
															<View style={{flex: 3}}>
																<BlurView intensity={30} tint="dark"
																		  style={[styles.blurview, {justifyContent: "center"}]}>
																	{(() => {
																		const {
																			icon,
																			color,
																			description
																		} = getWeatherIconAndColor(weather.current.weather_code);
																		return (
																			<View>
																				<Icon
																					source={icon}
																					color={color}
																					size={80}
																				/>
																				<Text style={{
																					textAlign: "center",
																					color: "white"
																				}}>{description}</Text>
																			</View>
																		);
																	})()}
																</BlurView>
															</View>
														</View>
														<View>
															<BlurView
																intensity={30}
																tint="dark"
																style={styles.blurview}
															>
																<Icon
																	source="weather-windy"
																	color={"lightgray"}
																	size={80}
																/>
																<Text style={styles.blurtext}>
																	{weather.current.wind_speed_10m} km/h
																</Text>
															</BlurView>
														</View>
													</View>
												) : index === 1 && weather && weather.daily && weather.daily.time ? (
													<View style={{flex: 1}}>

														<BlurView intensity={30} tint="dark" onLayout={onLayout}
																  style={{
																	  overflow: "hidden",
																	  borderRadius: 10,
																	  marginTop: 20
																  }}>
															<LineChart
																data={getDailyData()}
																width={containerWidth}
																height={256}
																verticalLabelRotation={30}
																chartConfig={chartConfig}
																formatXLabel={(label) => {
																	const hour = label.split('T')[1];
																	const test = parseInt(hour.split(':')[0]);
																	return test % 4 === 0 ? hour : '';
																}}
																formatYLabel={(value) => `${Math.round(value)}°C`}
																bezier
															/>
														</BlurView>
														<View style={{maxHeight: 160, paddingTop: 10}}>
															<ScrollView
																keyboardShouldPersistTaps="handled"
																onTouchStart={() => setScrollParentEnabled(false)}
																onMomentumScrollEnd={() => setScrollParentEnabled(true)}
																contentContainerStyle={{flexGrow: 1}}>
																{weather.daily.time.map((item, index) => {
																	const {
																		icon,
																		color
																	} = getWeatherIconAndColor(weather.daily.weather_code[index]);

																	return (
																		<View key={index}
																			  style={{marginBottom: 3}}>
																			<View style={{flex: 1}}>
																				<BlurView intensity={30}
																						  tint="dark"
																						  style={[styles.blurview2]}>
																					<Text style={{
																						flex: 1,
																						textAlign: "center",
																						color: "white",
																						fontSize: 20,
																						fontWeight: "bold"
																					}}>
																						{item.split("T")[1]}
																					</Text>
																					<View style={{flex: 1, alignItems: "center"}}>
																						<Icon
																							source={icon}
																							color={color}
																							size={40}
																						/>
																					</View>
																					<Text style={{
																						flex: 1,
																						textAlign: "center",
																						color: "white",
																						fontSize: 20,
																						fontWeight: "500"
																					}}>
																						{weather.daily.temperature_2m[index]}°C
																					</Text>
																					<View style={{
																						flex: 1,
																						display: "flex",
																						flexDirection: "column",
																						alignItems: "center",
																					}}>
																						<Icon
																							source={"weather-windy"}
																							color={"lightgray"}
																							size={40}
																						/>
																						<Text style={{
																							textAlign: "center",
																							color: "white"
																						}}>
																							{weather.daily.wind_speed_10m[index]} km/h
																						</Text>
																					</View>
																				</BlurView>
																			</View>
																		</View>
																	);
																})}
															</ScrollView>
														</View>

													</View>

												) : index === 2 && weather && weather.weekly && weather.weekly.time && (
													<View style={{flex: 1}}>

														<BlurView intensity={30} tint="dark" onLayout={onLayout}
																  style={{
																	  overflow: "hidden",
																	  borderRadius: 10,
																	  marginTop: 20
																  }}>
															<LineChart
																data={getWeeklyData()}
																width={containerWidth}
																height={256}
																verticalLabelRotation={30}
																chartConfig={chartConfig}
																formatXLabel={(label) => {
																	return label.split('-')[2] + '/' + label.split('-')[1];
																}}
																formatYLabel={(value) => `${Math.round(value)}°C`}
																bezier
															/>
														</BlurView>
														<View style={{maxHeight: 160, paddingTop: 10}}>
															<ScrollView
																keyboardShouldPersistTaps="handled"
																onTouchStart={() => setScrollParentEnabled(false)}
																onMomentumScrollEnd={() => setScrollParentEnabled(true)}
																contentContainerStyle={{flexGrow: 1}}>
																{weather.weekly.time.map((item, index) => {
																	const {
																		icon,
																		color
																	} = getWeatherIconAndColor(weather.weekly.weather_code[index]);

																	return (
																		<View key={index}
																			  style={{marginBottom: 3}}>
																			<View style={{flex: 1}}>
																				<BlurView intensity={30}
																						  tint="dark"
																						  style={[styles.blurview2]}>
																					<Text style={{
																						flex: 1,
																						textAlign: "center",
																						color: "white",
																						fontSize: 20,
																						fontWeight: "bold"
																					}}>
																						{item.split("-")[2]}{"/"}{item.split("-")[1]}
																					</Text>
																					<View style={{flex: 1, alignItems: "center"}}>
																						<Icon
																							source={icon}
																							color={color}
																							size={40}
																						/>
																					</View>
																					<Text style={{
																						flex: 1,
																						textAlign: "center",
																						color: "#00aaff",
																						fontSize: 20,
																						fontWeight: "500"
																					}}>
																						{weather.weekly.temperature_2m_min[index]}°C
																					</Text>
																					<Text style={{
																						flex: 1,
																						textAlign: "center",
																						color: "#ff5900",
																						fontSize: 20,
																						fontWeight: "500"
																					}}>
																						{weather.weekly.temperature_2m_max[index]}°C
																					</Text>
																				</BlurView>
																			</View>
																		</View>
																	);
																})}
															</ScrollView>
														</View>

													</View>
												)}
										</View>
									</ScrollView>
								</SafeAreaView>
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
	)
		;
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
		fontWeight: '300',
		color: 'white',
		textAlign: "center",
	},
	errorText: {
		fontSize: 18,
		color: "red",
		textAlign: "center",
	},
	blurview: {
		overflow: "hidden",
		borderRadius: 10,
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		margin: 5,
	},
	blurview2: {
		overflow: "hidden",
		borderRadius: 10,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,

	},
	blurtext: {
		flex: 1,
		fontSize: 30,
		color: 'white',
		fontWeight: 'bold',
		textAlign: "center"
	}
});