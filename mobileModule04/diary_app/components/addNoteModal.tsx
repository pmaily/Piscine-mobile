import React, {useState} from "react";
import {
	Button,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import {Icon} from "react-native-paper";
import {feelings} from "@/constants/feelings";
import {addNote} from "@/conf/diaryManager";
import {stylesModal} from "@/components/stylesModal";

interface AddNoteModalProps {
	visible: boolean;
	onClose: () => void;
	onAdd: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({visible, onClose, onAdd}) => {
	const [newTitle, setNewTitle] = useState("");
	const [newFeeling, setNewFeeling] = useState(feelings[0].id);
	const [newContent, setNewContent] = useState("");

	const isAddDisabled = newTitle.trim() === "" || newContent.trim() === "";

	const handleAddNote = async () => {
		try {
			onClose();
			setNewContent("");
			setNewTitle("");
			setNewFeeling(feelings[0].id);
			await addNote(newTitle, newFeeling, newContent);
			onAdd();
		} catch (error) {
			console.error("Error while adding note :", error);
		}
	};

	return (
		<Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
			<KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={stylesModal.modalOverlay}>
						<View style={stylesModal.modalContent}>
							<Text style={stylesModal.modalTitle}>Ajouter une note</Text>

							<TextInput
								style={stylesModal.input}
								placeholder="Titre"
								placeholderTextColor="#ddd"
								value={newTitle}
								onChangeText={setNewTitle}
							/>

							<View style={stylesModal.feelingsContainer}>
								{feelings.map((feeling) => (
									<TouchableOpacity
										key={feeling.id}
										style={[
											stylesModal.feelingButton,
											newFeeling === feeling.id ? stylesModal.selectedFeeling : {},
											{borderColor: feeling.color},
										]}
										onPress={() => setNewFeeling(feeling.id)}
									>
										<Icon source={feeling.icon} size={30}
											  color={newFeeling === feeling.id ? feeling.color : "black"}/>
									</TouchableOpacity>
								))}
							</View>

							<TextInput
								style={[stylesModal.input, stylesModal.textArea]}
								placeholder="Contenu"
								placeholderTextColor="#ddd"
								value={newContent}
								onChangeText={setNewContent}
								multiline
							/>

							<View style={stylesModal.modalButtons}>
								<Button title="Annuler" onPress={onClose}/>
								<Button title="Ajouter" disabled={isAddDisabled} onPress={handleAddNote}/>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default AddNoteModal;