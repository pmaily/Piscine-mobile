import React, {useEffect} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Icon, Text} from "react-native-paper";
import {NotesListe} from "@/components/notesListe";
import {getUserNotes} from "@/conf/diaryManager";
import {BlurView} from "expo-blur";
import {feelings} from "@/constants/feelings";

interface NotesListeProps {
	notes: any[];
	setNotes: (notes: any[]) => void;
	openNoteDetails: (note: any) => void;
	openAddNote: () => void;
	refreshTrigger: boolean;
}

export const ProfileContent: React.FC<NotesListeProps> = ({
															  notes,
															  setNotes,
															  openNoteDetails,
															  openAddNote,
															  refreshTrigger
														  }) => {

	useEffect(() => {
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
		fetchNotes();
	}, [refreshTrigger]);

	return (
		<View style={{flex: 1}}>
			<View style={{flex: 1, marginTop: 20}}>
				<Text style={{textAlign: "center", fontSize: "20"}}>Your last notes</Text>
				<NotesListe notes={notes.slice(0, 2)} openNoteDetails={openNoteDetails}/>
			</View>
			<View style={{flex: 2, paddingHorizontal: 20, paddingBottom: 20}}>
				<Text style={{textAlign: "center", fontSize: "20", marginBottom: 5}}>Your feel for
					your {notes.length} notes.</Text>
				<BlurView
					intensity={30}
					tint="extraLight"
					style={styles.blurview}
				>
					<View style={{
						height: "100%",
						flexDirection: "column",
						justifyContent: "space-between",
						padding: 20
					}}>
						{feelings.map((feeling) => (
							<View key={feeling.id} style={{flexDirection: "row", alignItems: "center"}}>
								<Icon source={feeling.icon} size={30} color={feeling.color}/>
								<Text>  {notes.length === 0 ? 0 : Math.round(notes.filter(note => note.feeling == feeling.id).length * 100 / notes.length)}%</Text>
							</View>
						))}
					</View>
				</BlurView>
			</View>
			<TouchableOpacity
				style={{
					paddingVertical: 10,
					paddingHorizontal: 20,
					backgroundColor: "white",
					borderRadius: 5,
					alignSelf: "center"
				}}
				onPress={openAddNote}
			>
				<Text style={{fontSize: 18, fontWeight: "bold", color: "black"}}>Add a note</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
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