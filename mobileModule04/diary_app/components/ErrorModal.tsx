import React from "react";
import {Button, Modal, Text, View,} from "react-native";
import {stylesModal} from "@/components/stylesModal";

interface ErrorProps {
	visible: boolean;
	error: string | null;
	onClose: () => void;
}

const ErrorModal: React.FC<ErrorProps> = ({visible, error, onClose}) => {
	return (
		<Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
			<View style={stylesModal.modalOverlay}>
				<View style={stylesModal.modalContent}>
					<View style={{flex: 1, justifyContent: "center"}}>
						<Text style={{textAlign: "center", color: "red", fontSize: 20}}>{error}</Text>
					</View>
					<View style={[stylesModal.modalButtons, {justifyContent: "flex-end"}]}>
						<Button title="OK" onPress={onClose}/>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default ErrorModal;