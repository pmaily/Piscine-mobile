import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
	handleGithubAuthentication,
	handleGoogleAuthentication,
	useGithubAuthRequest,
	useGoogleAuthRequest
} from '@/authConfig';
import {FontAwesome, MaterialCommunityIcons} from 'react-native-vector-icons';
import {useRouter} from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
	const [requestGoogle, responseGoogle, promptAsyncGoogle] = useGoogleAuthRequest();
	const [requestGitHub, responseGitHub, promptAsyncGitHub] = useGithubAuthRequest();

	const router = useRouter();

	const onLoginSuccess = () => {
		router.push('/profil');
	}

	useEffect(() => {
		handleGoogleAuthentication(requestGoogle, responseGoogle, onLoginSuccess);
	}, [responseGoogle]);

	useEffect(() => {
		handleGithubAuthentication(responseGitHub, onLoginSuccess);
	}, [responseGitHub]);

	return (
		<View style={styles.container}>
			<View style={styles.buttonContainer}>
				<View style={styles.googleButton}>
					<MaterialCommunityIcons name="google" size={24} color="white" style={styles.icon}/>
					<Text style={styles.buttonText} onPress={() => promptAsyncGoogle()}>
						Se connecter avec Google
					</Text>
				</View>

				<View style={styles.githubButton}>
					<FontAwesome name="github" size={24} color="white" style={styles.icon}/>
					<Text style={styles.buttonText} onPress={() => promptAsyncGitHub()}>
						Se connecter avec GitHub
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonContainer: {
		width: '80%',
	},
	googleButton: {
		flexDirection: 'row',
		backgroundColor: '#db4437', // Couleur rouge de Google
		padding: 15,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	githubButton: {
		flexDirection: 'row',
		backgroundColor: '#333', // Couleur noire de GitHub
		padding: 15,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		marginRight: 10,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
