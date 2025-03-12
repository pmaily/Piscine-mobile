import React from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {feelings} from "@/constants/feelings";
import {BlurView} from "expo-blur";
import {Icon} from "react-native-paper";

interface NotesListeProps {
	notes: any[];
	openNoteDetails: (note: any) => void;
}

export const NotesListe: React.FC<NotesListeProps> = ({notes, openNoteDetails}) => {
	return (
		<ScrollView contentContainerStyle={styles.notesContainer}>
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
				<Text style={styles.noNotes}>No notes found.</Text>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	notesContainer: {
		flexGrow: 1,
		paddingHorizontal: 20,
		justifyContent: 'center',
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


