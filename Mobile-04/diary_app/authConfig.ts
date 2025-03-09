import {auth, GithubAuthProvider, GoogleAuthProvider, signInWithCredential} from "@/firebaseConfig";
import {CodeChallengeMethod, Prompt, useAuthRequest} from "expo-auth-session";
import { router } from 'expo-router';

const redirectUri = `https://monapp.eu.ngrok.io/redirect`;

const GOOGLE_CLIENT_ID = "188341974524-opv42atf95tnuk83jch9mcvaqg6jtmpk.apps.googleusercontent.com";
const discoveryGoogle = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
	revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const GITHUB_CLIENT_ID = "Iv23liZfm8ySS5jErag5";
const discoveryGitHub = {
	authorizationEndpoint: "https://github.com/login/oauth/authorize",
	tokenEndpoint: "https://github.com/login/oauth/access_token",
	revocationEndpoint: "https://github.com/settings/connections/applications/{client_id}",
};

async function fetchGoogleIdToken(code: string, codeVerifier: string) {
	const params = new URLSearchParams();
	params.append("client_id", GOOGLE_CLIENT_ID);
	params.append("client_secret", "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");
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
	params.append("client_secret", "b05519a5f24800f4a060a406488addbc89887d15");
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
	const data = await response.json(); // 👈 Avec l'header 'Accept: application/json', ça fonctionnera

	console.log("Réponse complète :", data);
	return data.access_token;
}

function handleGoogleAuthentication(requestGoogle: any, responseGoogle: any, onLoginSuccess: () => void) {
	if (responseGoogle?.type === 'success') {
		const {code} = responseGoogle.params;  // Récupérer le code d'autorisation
		fetchGoogleIdToken(code, requestGoogle.codeVerifier)
			.then(id_token => {
				const credential = GoogleAuthProvider.credential(id_token);
				signInWithCredential(auth, credential)
					.then(userCredential => {
						console.log("Connexion Google réussie :", userCredential.user);
						onLoginSuccess();
					})
					.catch(error => console.error("Erreur Google :", error));
			})
			.catch(error => console.error("Erreur d'échange du code Google :", error));
	}
}

function handleGithubAuthentication(responseGitHub: any, onLoginSuccess: () => void) {
	if (responseGitHub?.type === 'success') {
		const {code} = responseGitHub.params;
		console.log("GitHub code :", code);
		fetchGitHubToken(code)
			.then(token => {
				console.log("GitHub token :", code, " ", token);
				const credential = GithubAuthProvider.credential(token);
				signInWithCredential(auth, credential)
					.then(userCredential => {
						console.log("Connexion GitHub réussie :", userCredential.user);
						onLoginSuccess();
					})
					.catch(error => console.error("Erreur GitHub :", error));
			})
			.catch(error => console.error("Erreur de récupération du token GitHub :", error));
	}
}

function useGithubAuthRequest() {
	return useAuthRequest(
		{
			clientId: GITHUB_CLIENT_ID,
			scopes: ['email'],
			redirectUri,
			prompt:Prompt.SelectAccount
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
			prompt:Prompt.SelectAccount
		},
		discoveryGoogle
	);
}

export {handleGithubAuthentication, handleGoogleAuthentication, useGithubAuthRequest, useGoogleAuthRequest};