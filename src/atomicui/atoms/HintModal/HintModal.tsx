import { Text, View } from "@aws-amplify/ui-react";
import "./styles.scss";

type ModalPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right"
	| "center";

interface HintModalProps {
	isVisible: boolean;
	text: string;
	position?: ModalPosition;
	customStyles?: React.CSSProperties;
}

const HintModal: React.FC<HintModalProps> = ({ isVisible, text, position = "bottom-center", customStyles }) => {
	if (!isVisible) {
		return null;
	}

	return (
		<View className={`hintModal ${position}`} style={customStyles}>
			<Text>{text}</Text>
		</View>
	);
};

export default HintModal;
