import { firestore, auth } from './firebaseConfig';
import {addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where} from "@firebase/firestore";

const addNote = async (title: string, feeling: string, content: string) => {
	try {
		const userId = auth.currentUser?.uid; // Récupère l'ID de l'utilisateur connecté

		const entryData = {
			title,
			feeling,
			content,
			date: serverTimestamp(),
			userId
		};

		const entriesCollection = collection(firestore, 'notes');
		const docRef = await addDoc(entriesCollection, entryData);

		console.log("Entrée du journal ajoutée avec succès, ID du document : ", docRef.id);
	} catch (error) {
		console.error("Erreur lors de l'ajout de l'entrée : ", error);
	}
};

const getUserNotes = async () => {
	try {
		const userId = auth.currentUser?.uid; // Récupère l'ID de l'utilisateur connecté

		if (userId) {
			const notesCollection = collection(firestore, 'notes');
			const q = query(notesCollection, where("userId", "==", userId)); // Crée une requête pour récupérer les notes de cet utilisateur

			const querySnapshot = await getDocs(q); // Exécute la requête
			const notes = [];

			querySnapshot.forEach((doc) => {
				notes.push({ ...doc.data(), id: doc.id }); // Ajoute les données de chaque document dans un tableau
			});

			return notes; // Retourne les notes récupérées
		} else {
			console.error("Aucun utilisateur connecté.");
			return [];
		}
	} catch (error) {
		return [];
	}
};

const deleteNote = async (noteId: string) => {
	try {
		const noteRef = doc(firestore, 'notes', noteId);  // Référence au document à supprimer
		await deleteDoc(noteRef);  // Suppression du document
		console.log('Note supprimée avec succès.');
	} catch (error) {
		console.error('Erreur lors de la suppression de la note : ', error);
	}
};

export { addNote, getUserNotes, deleteNote };