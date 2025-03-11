import React, {useEffect, useState} from 'react';
import {Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {addNote, deleteNote, getUserNotes} from "@/conf/diaryManager";
import {Appbar, Icon} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BlurView} from "expo-blur";
import {feelings} from "@/constants/feelings";
import AddNoteModal from "@/components/addNoteModal";
import DetailsNoteModal from "@/components/detailsNoteModal";
import {logout} from "@/conf/authConfig";
import {useRouter} from "expo-router";

const BOTTOM_APPBAR_HEIGHT = 70;

export default function ProfilScreen() {
	const router = useRouter();
	const [notes, setNotes] = useState<any[]>([]);
	const [selectedNote, setSelectedNote] = useState<any | null>(null);
	const [selectedNoteModalVisible, setSelectedNoteModalVisible] = useState(false);
	const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
	const {bottom} = useSafeAreaInsets();

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

	const openNoteDetails = (note: any) => {
		setSelectedNote(note);
		setSelectedNoteModalVisible(true);
	};

	return (
		<View style={styles.container}>

			<Appbar.Header style={{backgroundColor: "transparent"}}>
				<Appbar.Content title="Profil" titleStyle={{fontSize: 30}}/>
				<Appbar.Action icon={'power'} onPress={() => logout(() => router.push('/'))}/>
			</Appbar.Header>

			<ScrollView contentContainerStyle={[styles.notesContainer, {paddingBottom: BOTTOM_APPBAR_HEIGHT + bottom}]}>
				{notes.length > 0 ? (
					notes.map((note, index) => {
						const feelingData = feelings.find(f => f.id === note.feeling);
						return (
							<TouchableOpacity key={index} style={styles.noteCard} onPress={() => openNoteDetails(note)}>
								<BlurView
									intensity={30}
									tint="extraLight"
									style={styles.blurview}
								>
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
								</BlurView>
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

			<AddNoteModal
				visible={addNoteModalVisible}
				onClose={() => setAddNoteModalVisible(false)}
				onAdd={fetchNotes}
			/>

			<DetailsNoteModal
				visible={selectedNoteModalVisible}
				note={selectedNote}
				onClose={() => setSelectedNoteModalVisible(false)}
				onDelete={handleDeleteNote}
			/>

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
	},
	noteCard: {
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'row',
	},
	noteTitle: {
		flexShrink: 1,
		fontSize: 18,
		fontWeight: '600',
	},
	noteDate: {
		fontSize: 12,
		color: '#555',
	},
	noNotes: {
		fontSize: 18,
		textAlign: 'center',
	},
	bottom: {
		backgroundColor: 'aquamarine',
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	blurview: {
		overflow: "hidden",
		borderRadius: 10,
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		margin: 2,
	},
});
