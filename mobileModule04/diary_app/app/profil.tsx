import React, {useEffect, useState} from 'react';
import {
	Button,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import {addNote, deleteNote, getUserNotes} from "@/diaryManager";
import {Appbar, Icon} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const feelings = [
	{id: "happy", icon: "emoticon-happy-outline", color: "green"},
	{id: "neutral", icon: "emoticon-neutral-outline", color: "yellow"},
	{id: "sad", icon: "emoticon-sad-outline", color: "red"},
];

const BOTTOM_APPBAR_HEIGHT = 70;

export default function ProfilScreen() {
	const [notes, setNotes] = useState<any[]>([]);
	const [selectedNote, setSelectedNote] = useState<any | null>(null);
	const [selectedNoteModalVisible, setSelectedNoteModalVisible] = useState(false);
	const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newFeeling, setNewFeeling] = useState(feelings[0].id); // Feeling par défaut
	const [newContent, setNewContent] = useState("");
	const [index, setIndex] = useState(0);
	const {bottom} = useSafeAreaInsets();

	const isAddDisabled = newTitle.trim() === "" || newContent.trim() === "";

	const fetchNotes = async () => {
		try {
			const userNotes = await getUserNotes();
			userNotes.sort((a, b) => {
				return b.date.toDate().getTime() - a.date.toDate().getTime();
			});
			setNotes(userNotes);
		} catch (error) {
			console.error("Erreur lors de la récupération des notes :", error);
		}
	};

	useEffect(() => {
		fetchNotes();
	}, []);

	const handleDeleteNote = async (noteId: string) => {
		try {
			setSelectedNoteModalVisible(false);
			await deleteNote(noteId);
			setNotes(notes.filter(note => note.id !== noteId));
		} catch (error) {
			console.error("Error while deleting note :", error);
		}
	};

	const handleAddNote = async () => {
		try {
			setAddNoteModalVisible(false);
			setNewContent("");
			setNewTitle("");
			setNewFeeling(feelings[0].id);
			await addNote(newTitle, newFeeling, newContent);
			fetchNotes();
		} catch (error) {
			console.error("Error while adding note :", error);
		}
	};

	const openNoteDetails = (note: any) => {
		setSelectedNote(note);
		setSelectedNoteModalVisible(true);
	};

	return (
		<View style={styles.container}>
			<Appbar.Header style={{backgroundColor: "transparent"}}>
				<Appbar.Content title="Profil" titleStyle={{fontSize: 30}}/>
			</Appbar.Header>

			<ScrollView contentContainerStyle={styles.notesContainer}>
				{notes.length > 0 ? (
					notes.map((note, index) => {
						const feelingData = feelings.find(f => f.id === note.feeling);
						return (
							<TouchableOpacity key={index} style={styles.noteCard} onPress={() => openNoteDetails(note)}>
								<View style={{
									flex: 1,
									display: 'flex',
									justifyContent: "center",
									alignItems: "center"
								}}>
									<Icon
										source={feelingData?.icon}
										size={30}
										color={feelingData?.color || "gray"}
									/>
								</View>
								<View style={{
									flex: 6,
									display: 'flex',
									flexDirection: 'row',
									justifyContent: "space-between",
									alignItems: "center"
								}}>
									<Text numberOfLines={1} ellipsizeMode="tail"
										  style={styles.noteTitle}>{note.title}</Text>
									<Text style={styles.noteDate}>
										{note.date.toDate().toLocaleDateString()}
									</Text>
								</View>
							</TouchableOpacity>
						)
					})
				) : (
					<Text style={styles.noNotes}>Aucune note trouvée.</Text>
				)}
			</ScrollView>

			<Appbar
				style={[
					styles.bottom,
					{
						height: BOTTOM_APPBAR_HEIGHT + bottom,
						backgroundColor: "transparent",
						justifyContent: "center", // Centre horizontalement
						alignItems: "center", // Centre verticalement
					},
				]}
				safeAreaInsets={{bottom}}
			>
				<TouchableOpacity
					style={{
						paddingVertical: 10,
						paddingHorizontal: 20,
						backgroundColor: "white",
						borderRadius: 5,
					}}
					onPress={() => setAddNoteModalVisible(true)}
				>
					<Text style={{fontSize: 18, fontWeight: "bold", color: "black"}}>Ajouter une note</Text>
				</TouchableOpacity>
			</Appbar>

			<Modal
				animationType="slide"
				transparent={true}
				visible={selectedNoteModalVisible}
				onRequestClose={() => setSelectedNoteModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{selectedNote && (
							<>
							<ScrollView style={{width: "100%"}} contentContainerStyle={{flex: 1}}>
								<View style={{
									display: 'flex',
									justifyContent: "center",
									alignItems: "center"
								}}>
								{selectedNote.feeling && (
									(() => {
										const feeling = feelings.find(f => f.id === selectedNote.feeling);
										return feeling ? (
											<Icon
												source={feeling.icon}
												size={30}
												color={feeling.color}
											/>
										) : null;
									})()
								)}
							</View>
								<Text style={styles.modalTitle}>{selectedNote.title}</Text>
								<Text style={styles.modalDate}>{selectedNote.date.toDate().toLocaleDateString()}</Text>
								<Text style={styles.modalText}>{selectedNote.content}</Text>
							</ScrollView>
								<View style={styles.modalButtons}>
									<Button title="Fermer" onPress={() => setSelectedNoteModalVisible(false)}/>
									<Button title="Supprimer" color="red"
											onPress={() => handleDeleteNote(selectedNote.id)}/>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>

			<Modal
				animationType="slide"
				transparent={true}
				visible={addNoteModalVisible}
				onRequestClose={() => setAddNoteModalVisible(false)}
			>
				<KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View style={styles.modalOverlay}>
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>Add Note</Text>

								<TextInput
									style={styles.input}
									placeholder="Title"
									placeholderTextColor={"#ddd"}
									value={newTitle}
									onChangeText={setNewTitle}
								/>

								<View style={styles.feelingsContainer}>
									{feelings.map(feeling => (
										<TouchableOpacity
											key={feeling.id}
											style={[
												styles.feelingButton,
												newFeeling === feeling.id ? styles.selectedFeeling : {},
												{borderColor: feeling.color}
											]}
											onPress={() => setNewFeeling(feeling.id)}
										>
											<Icon source={feeling.icon} size={30}
												  color={newFeeling === feeling.id ? feeling.color : "black"}/>
										</TouchableOpacity>
									))}
								</View>

								<TextInput
									style={[styles.input, styles.textArea]}
									placeholder="Content"
									placeholderTextColor={"#ddd"}
									value={newContent}
									onChangeText={setNewContent}
									multiline
								/>

								<View style={styles.modalButtons}>
									<Button title="Annuler" onPress={() => setAddNoteModalVisible(false)}/>
									<Button title="Ajouter" disabled={isAddDisabled} onPress={handleAddNote}/>
								</View>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
	,
	notesContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 20,
	}
	,
	noteCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
		padding: 10,
		marginBottom: 5,
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'row',
	}
	,
	noteTitle: {
		flexShrink: 1,
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 5,
	}
	,
	noteFeeling: {
		fontSize: 16,
		fontStyle: 'italic',
		marginBottom: 5,
	}
	,
	noteContent: {
		flex: 1,
		fontSize: 14,
		marginBottom: 5,
	}
	,
	noteDate: {
		fontSize: 12,
		color: '#555',
	}
	,
	deleteButtonText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
	}
	,
	noNotes: {
		fontSize: 18,
		textAlign: 'center',
	}
	,
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	}
	,
	modalContent: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		width: '80%',
		height: '60%',
		minHeight: 350,
		alignItems: 'center',
	}
	,
	modalTitle: {
		textAlign: 'center',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 10,
	}
	,
	modalDate: {
		textAlign: 'center',
		fontSize: 14,
		color: '#555',
		marginBottom: 10,
	}
	,
	modalText: {
		flex: 1,
		textAlign: 'left',
		fontSize: 16,
		marginBottom: 20,
	}
	,
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	}
	,
	input: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	}
	,
	textArea: {
		flex: 1,
	}
	,
	feelingsContainer: {
		flexDirection: 'row',
		marginBottom: 10,
	}
	,
	feelingButton: {
		marginHorizontal: 10,
		padding: 5,
	}
	,
	selectedFeeling: {
		borderWidth: 2,
		borderRadius: 5,
	}
	,
	bottom: {
		backgroundColor: 'aquamarine',
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	}
});
