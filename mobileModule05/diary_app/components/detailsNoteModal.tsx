import React from "react";
import {Button, Modal, ScrollView, Text, View} from "react-native";
import {Icon} from "react-native-paper";
import {feelings} from "@/constants/feelings";
import {stylesModal} from "@/components/stylesModal";

interface DetailsNoteModalProps {
	visible: boolean;
	note: any | null;
	onClose: () => void;
	onDelete: (noteId: string) => void;
}

const DetailsNoteModal: React.FC<DetailsNoteModalProps> = ({visible, note, onClose, onDelete}) => {
	if (!note) return null;

	const feeling = feelings.find((f) => f.id === note.feeling);

	return (
		<Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
			<View style={stylesModal.modalOverlay}>
				<View style={stylesModal.modalContent}>
					<ScrollView style={{width: "100%"}} contentContainerStyle={{flex: 1}}>
						<View style={stylesModal.iconContainer}>
							{feeling && <Icon source={feeling.icon} size={30} color={feeling.color}/>}
						</View>
						<Text style={stylesModal.modalTitle}>{note.title}</Text>
						<Text style={stylesModal.modalDate}>{note.date.toDate().toLocaleDateString()}</Text>
						<Text style={stylesModal.modalText}>{note.content}</Text>
					</ScrollView>
					<View style={stylesModal.modalButtons}>
						<Button title="Close" onPress={onClose}/>
						<Button title="Delete" color="red" onPress={() => onDelete(note.id)}/>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default DetailsNoteModal;