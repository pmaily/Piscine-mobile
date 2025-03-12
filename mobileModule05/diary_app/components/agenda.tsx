import React, {useEffect, useState} from "react";
import {View} from "react-native";
import {Calendar} from "react-native-calendars";
import {NotesListe} from "@/components/notesListe";
import {getNotesByDate} from "@/conf/diaryManager";

interface NotesListeProps {
	notes: any[];
	setNotes: (notes: any[]) => void;
	openNoteDetails: (note: any) => void;
}

export const Agenda: React.FC<NotesListeProps> = ({notes, setNotes, openNoteDetails}) => {
	const [selected, setSelected] = useState<string>(new Date().toISOString().split('T')[0]);

	useEffect(() => {
		const fetchNotes = async () => {
			try {
				const userNotes = await getNotesByDate(new Date(selected));
				userNotes.sort((a, b) => {
					return b.date.toDate().getTime() - a.date.toDate().getTime();
				});
				setNotes(userNotes);
			} catch (error) {
				console.error("Erreur lors de la récupération des notes :", error);
			}
		};
		fetchNotes();
	}, [selected]);

	return (
		<View style={{flex: 1}}>
			<View style={{paddingVertical: 10, paddingHorizontal: 20}}>
				<Calendar
					current={selected}
					onDayPress={day => {
						setSelected(day.dateString);
					}}
					markedDates={{
						[selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
					}}
				/>
			</View>
			<NotesListe notes={notes} openNoteDetails={openNoteDetails}/>
		</View>
	);
}
