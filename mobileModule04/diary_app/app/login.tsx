import React, {useEffect, useState} from 'react';
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
import ErrorModal from "@/components/ErrorModal";
import {auth} from "@/firebaseConfig";


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
	const router = useRouter();
	const [requestGoogle, responseGoogle, promptAsyncGoogle] = useGoogleAuthRequest();
	const [requestGitHub, responseGitHub, promptAsyncGitHub] = useGithubAuthRequest();
	const [error, setError] = useState<string | null>(null);
	const [modalErrorVisible, setModalErrorVisible] = useState<boolean>(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(user => {
			if (user) {
				console.log(user)
				router.push('/profil');
			}
		});

		return () => unsubscribe();
	}, []);

	const handleGoogleLogin = async () => {
		if (isAuthenticating) return;
		setIsAuthenticating(true);
		try {
			await promptAsyncGoogle();
		} finally {
			setIsAuthenticating(false);
		}
	};

	const handleGitHubLogin = async () => {
		if (isAuthenticating) return;
		setIsAuthenticating(true);
		try {
			await promptAsyncGitHub();
		} finally {
			setIsAuthenticating(false);
		}
	};

	const onErrorModalClose = () => {
		setModalErrorVisible(false);
		setError(null);
	}

	useEffect(() => {
		if (error) {
			setModalErrorVisible(true);
		}
	}, [error]);

	const onLoginSuccess = () => {
		router.push('/profil');
	}

	useEffect(() => {
		handleGoogleAuthentication(requestGoogle, responseGoogle, onLoginSuccess, setError);
	}, [responseGoogle]);

	useEffect(() => {
		handleGithubAuthentication(responseGitHub, onLoginSuccess, setError);
	}, [responseGitHub]);

	return (
		<View style={styles.container}>
			<View style={styles.buttonContainer}>
				<View style={styles.googleButton}>
					<MaterialCommunityIcons name="google" size={24} color="white" style={styles.icon}/>
					<Text style={styles.buttonText} onPress={() => handleGoogleLogin()}>
						Se connecter avec Google
					</Text>
				</View>

				<View style={styles.githubButton}>
					<FontAwesome name="github" size={24} color="white" style={styles.icon}/>
					<Text style={styles.buttonText} onPress={() => handleGitHubLogin()}>
						Se connecter avec GitHub
					</Text>
				</View>
			</View>
			<ErrorModal visible={modalErrorVisible} error={error} onClose={onErrorModalClose} />
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
