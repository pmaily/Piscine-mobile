import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {deleteNote} from "@/conf/diaryManager";
import {Appbar, BottomNavigation} from "react-native-paper";
import AddNoteModal from "@/components/addNoteModal";
import DetailsNoteModal from "@/components/detailsNoteModal";
import {logout} from "@/conf/authConfig";
import {useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ProfileContent} from "@/components/profilContent";
import {Agenda} from "@/components/agenda";

export default function ProfilScreen() {
	const router = useRouter();
	const [notes, setNotes] = useState<any[]>([]);
	const [selectedNote, setSelectedNote] = useState<any | null>(null);
	const [selectedNoteModalVisible, setSelectedNoteModalVisible] = useState(false);
	const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
	const [username, setUsername] = useState("");
	const [refreshTrigger, setRefreshTrigger] = useState(false);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const fetchUsername = async () => {
			const storedUsername = await AsyncStorage.getItem('username');
			if (storedUsername) setUsername(storedUsername);
		};
		fetchUsername();
	}, []);

	const routes = [
		{key: "profile", title: "Profile", focusedIcon: "calendar-today"},
		{key: "agenda", title: "Agenda", focusedIcon: "calendar-week"},
	];

	const handleIndexChange = (newIndex: number) => {
		if (newIndex < 0) {
			newIndex = 1;
		} else if (newIndex > 1) {
			newIndex = 0;
		}
		setIndex(newIndex);
	};

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
				<Appbar.Content title={username} titleStyle={{fontSize: 30}}/>
				<Appbar.Action icon={'logout-variant'} onPress={() => logout(() => router.push('/'))}/>
			</Appbar.Header>

			{index === 1 ? (
				<Agenda
					notes={notes}
					setNotes={setNotes}
					openNoteDetails={openNoteDetails}
				/>
			) : index === 0 && (
				<ProfileContent
					notes={notes}
					setNotes={setNotes}
					openNoteDetails={openNoteDetails}
					openAddNote={() => setAddNoteModalVisible(true)}
					refreshTrigger={refreshTrigger}
				/>
			)}

			<AddNoteModal
				visible={addNoteModalVisible}
				onClose={() => setAddNoteModalVisible(false)}
				onAdd={() => setRefreshTrigger(!refreshTrigger)}
			/>
			<DetailsNoteModal
				visible={selectedNoteModalVisible}
				note={selectedNote}
				onClose={() => setSelectedNoteModalVisible(false)}
				onDelete={handleDeleteNote}
			/>

			<BottomNavigation
				barStyle={{backgroundColor: 'transparent'}}
				style={{flex: 0}}
				navigationState={{index, routes}}
				onIndexChange={handleIndexChange}
				renderScene={() => null}
				activeColor="black"
				inactiveColor="black"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
