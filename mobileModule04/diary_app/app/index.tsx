import React from 'react';
import {Text, View, StyleSheet, ImageBackground} from 'react-native';
import {Link} from "expo-router";

export default function IndexScreen() {
	return (
		<View style={styles.container}>
			<Text style={{fontSize:40, textAlign: "center"}}>Welcome to your Diary</Text>
			<Link style={styles.button} href="/login">Login</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	button: {
		borderWidth: 1,
		borderRadius: 10,
		backgroundColor: '#04b355',
		color: 'white',
		padding: 8,
		marginTop: 20,
		fontSize:18
	}
});