import {auth, GithubAuthProvider, GoogleAuthProvider, signInWithCredential} from "@/conf/firebaseConfig";
import {CodeChallengeMethod, Prompt, useAuthRequest} from "expo-auth-session";
import {signOut} from "@firebase/auth";

const redirectUri = `https://monapp.eu.ngrok.io/redirect`;

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const discoveryGoogle = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
	revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
const discoveryGitHub = {
	authorizationEndpoint: "https://github.com/login/oauth/authorize",
	tokenEndpoint: "https://github.com/login/oauth/access_token",
	revocationEndpoint: "https://github.com/settings/connections/applications/{client_id}",
};

async function fetchGoogleIdToken(code: string, codeVerifier: string) {
	const params = new URLSearchParams();
	params.append("client_id", GOOGLE_CLIENT_ID);
	params.append("client_secret", process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET);
	params.append("code", code);
	params.append("redirect_uri", redirectUri);
	params.append("grant_type", "authorization_code");
	params.append("code_verifier", codeVerifier);

	const requestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	};
	const response = await fetch('https://oauth2.googleapis.com/token', requestOptions);
	const data = await response.json();

	if (!response.ok) {
		console.log(`Erreur API Google: ${data.error} - ${data.error_description}`);
	}

	return data.id_token;
}

async function fetchGitHubToken(code: string) {
	const params = new URLSearchParams();
	params.append("client_id", GITHUB_CLIENT_ID);
	params.append("client_secret", process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET);
	params.append("code", code);
	params.append("redirect_uri", redirectUri);

	const requestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		body: params.toString(),
	};

	const response = await fetch('https://github.com/login/oauth/access_token', requestOptions);
	const data = await response.json();

	return data.access_token;
}

function handleGoogleAuthentication(requestGoogle: any, responseGoogle: any, onLoginSuccess: (username: string) => void, onError: (error: string) => void) {
	if (responseGoogle?.type === 'success') {
		const {code} = responseGoogle.params;
		fetchGoogleIdToken(code, requestGoogle.codeVerifier)
			.then(id_token => {
				const credential = GoogleAuthProvider.credential(id_token);
				signInWithCredential(auth, credential)
					.then(userCredential => {
						onLoginSuccess(userCredential?._tokenResponse?.displayName || "Unknown");
					})
					.catch(error => onError("Error during Google authentication"));
			})
			.catch(error => onError("Error retrieving Google token"));
	}
}

function handleGithubAuthentication(responseGitHub: any, onLoginSuccess: (username: string) => void, onError: (error: string) => void) {
	if (responseGitHub?.type === 'success') {
		const {code} = responseGitHub.params;
		fetchGitHubToken(code)
			.then(token => {
				const credential = GithubAuthProvider.credential(token);
				signInWithCredential(auth, credential)
					.then(userCredential => {
						onLoginSuccess(userCredential?._tokenResponse?.screenName || "Unknown");
					})
					.catch(error => onError("Account with the same email address already exists"));
			})
			.catch(error => onError("Error retrieving GitHub token"));
	}
}

function useGithubAuthRequest() {
	return useAuthRequest(
		{
			clientId: GITHUB_CLIENT_ID,
			scopes: ['email'],
			redirectUri,
			prompt: Prompt.SelectAccount
		},
		discoveryGitHub
	);
}

function useGoogleAuthRequest() {
	return useAuthRequest(
		{
			clientId: GOOGLE_CLIENT_ID,
			scopes: ['openid', 'profile', 'email'],
			redirectUri,
			codeChallengeMethod: CodeChallengeMethod.S256,
			prompt: Prompt.SelectAccount
		},
		discoveryGoogle
	);
}

function logout(onLogoutSuccess: () => void) {
	signOut(auth)
		.then(() => {
			onLogoutSuccess();
		})
		.catch((error) => {
			console.error("Logout error", error);
		});
}

export {handleGithubAuthentication, handleGoogleAuthentication, useGithubAuthRequest, useGoogleAuthRequest, logout};