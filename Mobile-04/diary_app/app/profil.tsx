import React, {useEffect, useState} from 'react';
import {Button, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {addNote, deleteNote, getUserNotes} from "@/diaryManager";
import {Icon, IconButton} from "react-native-paper";

export default function ProfilScreen() {
	const [notes, setNotes] = useState<any[]>([]);

	useEffect(() => {
		const fetchNotes = async () => {
			try {
				const userNotes = await getUserNotes();
				userNotes.sort((a, b) => {
					return a.date.toDate().getTime() - b.date.toDate().getTime();
				});
				setNotes(userNotes);
			} catch (error) {
				console.error("Erreur lors de la récupération des notes :", error);
			}
		};

		fetchNotes();
	}, []);

	// Fonction pour supprimer une note
	const handleDeleteNote = async (noteId: string) => {
		try {
			await deleteNote(noteId);
			setNotes(notes.filter(note => note.id !== noteId));
			console.log("Note supprimée avec succès.");
		} catch (error) {
			console.error("Erreur lors de la suppression de la note :", error);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={{fontSize: 40, textAlign: "center", color: '#fff', marginBottom: 20}}>Profil</Text>

			<ScrollView contentContainerStyle={styles.notesContainer}>
				{notes.length > 0 ? (
					notes.map((note, index) => (
						<View key={index} style={styles.noteCard}>
							<View style={{flex: 5, display: 'flex', flexDirection: 'column'}}>
								<View style={{flex: 1, display: 'flex', flexDirection: 'row', justifyContent: "space-between", alignItems: "center"}}>
									<Text style={styles.noteTitle}>{note.title}</Text>
									<Text style={styles.noteDate}>
										{note.date.toDate().toLocaleDateString()}
									</Text>
									<Icon source={note.feeling} size={15} color="green" />
								</View>
								<Text style={styles.noteContent}>{note.content}</Text>
							</View>

							<IconButton
								icon="delete-outline"
								iconColor="red"
								size={30}
								onPress={() => handleDeleteNote(note.id)}
								style={{flex: 1}}
							/>
						</View>
					))
				) : (
					<Text style={styles.noNotes}>Aucune note trouvée.</Text>
				)}
			</ScrollView>

			<Button title={"Ajouter une entrée"} onPress={() => addNote("test", "emoticon-outline", "olololo")}/>
			<Button title={"Récupérer les notes"} onPress={() => console.log(notes)}/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	notesContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	noteCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
		padding: 10,
		marginBottom: 5,
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'row',
	},
	noteTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	noteFeeling: {
		fontSize: 16,
		fontStyle: 'italic',
		marginBottom: 5,
	},
	noteContent: {
		flex: 1,
		fontSize: 14,
		marginBottom: 5,
	},
	noteDate: {
		fontSize: 12,
		color: '#555',
	},
	deleteButtonText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
	},
	noNotes: {
		fontSize: 18,
		textAlign: 'center',
		color: '#fff',
	},
});
