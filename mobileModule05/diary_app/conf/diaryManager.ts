import {auth, firestore} from './firebaseConfig';
import {addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, where} from "@firebase/firestore";

const addNote = async (title: string, feeling: string, content: string) => {
	try {
		const email = auth.currentUser?.email;

		const entryData = {
			title,
			feeling,
			content,
			date: serverTimestamp(),
			email
		};

		const entriesCollection = collection(firestore, 'notes');
		const docRef = await addDoc(entriesCollection, entryData);

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
				notes.push({...doc.data(), id: doc.id});
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

const getNotesByDate = async (selectedDate: Date) => {
	try {
		const email = auth.currentUser?.email;

		if (email) {
			const notesCollection = collection(firestore, 'notes');

			const startOfDay = new Date(selectedDate);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(selectedDate);
			endOfDay.setHours(23, 59, 59, 999);

			const q = query(
				notesCollection,
				where("email", "==", email),
				where("date", ">=", startOfDay),
				where("date", "<=", endOfDay),
				orderBy("date", "desc")
			);

			const querySnapshot = await getDocs(q);
			const notes = [];

			querySnapshot.forEach((doc) => {
				notes.push({...doc.data(), id: doc.id});
			});

			return notes;
		} else {
			console.error("Aucun utilisateur connecté.");
			return [];
		}
	} catch (error) {
		console.error("Erreur lors de la récupération des notes par date : ", error);
		return [];
	}
};


const deleteNote = async (noteId: string) => {
	try {
		const noteRef = doc(firestore, 'notes', noteId);
		await deleteDoc(noteRef);
	} catch (error) {
		console.error('Erreur lors de la suppression de la note : ', error);
	}
};

export {addNote, getUserNotes, deleteNote, getNotesByDate};