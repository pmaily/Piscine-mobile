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
import {GestureHandlerRootView, PanGestureHandler} from "react-native-gesture-handler";

export default function Index() {
	const [searchQuery, setSearchQuery] = useState("");
	const [text, setText] = useState("Currently");
	const [text2, setText2] = useState("");
	const [index, setIndex] = useState(0);
	const [isSwiping, setIsSwiping] = useState(false);
	const [swipeTimeout, setSwipeTimeout] = useState(null);

	const routes = [
		{key: "currently", title: "Currently", focusedIcon: "calendar-today"},
		{key: "today", title: "Today", focusedIcon: "calendar-week"},
		{key: "weekly", title: "Weekly", focusedIcon: "calendar-month"},
	];

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


	const handleSearchPress = () => {
		setText2(searchQuery);
		setSearchQuery("");
	}


	const handleGeolocationPress = async () => {
		setText2("Geolocation");
	};

	return (
		<GestureHandlerRootView style={{flex: 1}}>
			<PanGestureHandler onHandlerStateChange={handlePanGesture}>
				<View style={{flex: 1}}>
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
										/>
									</View>
								</View>
								<Appbar.Action color={"white"} icon="crosshairs-gps" onPress={handleGeolocationPress}/>
							</Appbar.Header>
							<View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
								<Text style={{fontSize: 30}}>{text}</Text>
								<Text style={{fontSize: 30}}>{text2}</Text>
							</View>

							<BottomNavigation
								barStyle={{backgroundColor: "lightblue"}}
								style={{flex: 0}}
								navigationState={{index, routes}}
								onIndexChange={handleIndexChange}
								renderScene={() => null}
								activeColor="white"
								inactiveColor="white"
							/>
						</View>
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
		backgroundColor: "lightblue",
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
});

