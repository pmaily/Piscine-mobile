import { initializeApp } from "firebase/app";
import { initializeAuth, signInWithCredential, getReactNativePersistence, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
	apiKey: "AIzaSyBi4rA9W98VUFQdpuakDLBhlz8ioW5S9PI",
	authDomain: "diaryapp-6dc9a.firebaseapp.com",
	projectId: "diaryapp-6dc9a",
	storageBucket: "diaryapp-6dc9a.firebasestorage.app",
	messagingSenderId: "188341974524",
	appId: "1:188341974524:web:b8a446240cbae177b12e79",
	measurementId: "G-EL5WR89KN1"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(app);

export { auth, firestore, signInWithCredential, GoogleAuthProvider, GithubAuthProvider };