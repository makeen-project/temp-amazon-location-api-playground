import { Dispatch, FC, SetStateAction } from "react";

import { useMediaQuery } from "@demo/hooks";
import { BottomSheet as ReactSpringBottomSheet } from "react-spring-bottom-sheet";
import "./styles.scss";

interface BottomSheetProps {
	showBottomSheet: boolean;
	setShowBottomSheet: Dispatch<SetStateAction<boolean>>;
	header: JSX.Element;
	content: JSX.Element;
	footer: JSX.Element;
}

const BottomSheet: FC<BottomSheetProps> = ({ showBottomSheet, setShowBottomSheet, header, content, footer }) => {
	const isTablet = useMediaQuery("(max-width: 844px)");

	if (isTablet) {
		import("react-spring-bottom-sheet/dist/style.css");
	}

	return isTablet && showBottomSheet ? (
		<ReactSpringBottomSheet
			className="bottom-sheet"
			open={showBottomSheet}
			onDismiss={() => setShowBottomSheet(false)}
			// snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
			// snapPoints={() => (!!bottomSheet?.snapshot?.length ? bottomSheet.snapshot : 300)}
			snapPoints={({ maxHeight }) => [maxHeight - 50]}
			header={header}
			footer={footer}
		>
			{content}
		</ReactSpringBottomSheet>
	) : null;
};

export default BottomSheet;
