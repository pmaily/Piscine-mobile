import {StyleSheet} from "react-native";

export const stylesModal = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		width: "80%",
		height: "60%",
		minHeight: 350,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 10,
	},
	input: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
	feelingsContainer: {
		flexDirection: "row",
		marginBottom: 10,
	},
	feelingButton: {
		marginHorizontal: 10,
		padding: 5,
	},
	selectedFeeling: {
		borderWidth: 2,
		borderRadius: 5,
	},
	textArea: {
		flex: 1,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	modalDate: {
		fontSize: 14,
		color: "#555",
		marginBottom: 10,
	},
	modalText: {
		flex: 1,
		fontSize: 16,
		marginBottom: 20,
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
	},
});