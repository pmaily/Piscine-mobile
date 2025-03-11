import { firestore, auth } from './firebaseConfig';
import {addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where} from "@firebase/firestore";

const addNote = async (title: string, feeling: string, content: string) => {
	try {
		const email = auth.currentUser?.email; // Récupère l'ID de l'utilisateur connecté

		const entryData = {
			title,
			feeling,
			content,
			date: serverTimestamp(),
			email
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
		const email = auth.currentUser?.email;

		if (email) {
			const notesCollection = collection(firestore, 'notes');
			const q = query(notesCollection, where("email", "==", email));

			const querySnapshot = await getDocs(q);
			const notes = [];

			querySnapshot.forEach((doc) => {
				notes.push({ ...doc.data(), id: doc.id });
			});

			return notes;
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
		const noteRef = doc(firestore, 'notes', noteId);
		await deleteDoc(noteRef);
		console.log('Note supprimée avec succès.');
	} catch (error) {
		console.error('Erreur lors de la suppression de la note : ', error);
	}
};

export { addNote, getUserNotes, deleteNote };