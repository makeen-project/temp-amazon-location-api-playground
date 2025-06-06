import { render, screen } from "@testing-library/react";

import HintModal from "./HintModal";

describe("<HintModal />", () => {
	const defaultProps = {
		text: "Test Modal Content",
		isVisible: true
	};

	it("renders the modal when isVisible is true", () => {
		render(<HintModal {...defaultProps} />);
		expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
	});

	it("does not render the modal when isVisible is false", () => {
		render(<HintModal {...defaultProps} isVisible={false} />);
		expect(screen.queryByText(defaultProps.text)).not.toBeInTheDocument();
	});

	it("displays the correct text content", () => {
		const customText = "This is a custom message for the modal.";
		render(<HintModal {...defaultProps} text={customText} />);
		expect(screen.getByText(customText)).toBeInTheDocument();
	});

	it("applies custom styles", () => {
		const customStyles = {
			backgroundColor: "red",
			border: "2px solid blue",
			opacity: "0.8"
		};
		render(<HintModal {...defaultProps} customStyles={customStyles} />);
		const modal = screen.getByText(defaultProps.text).closest("div");
		expect(modal).toHaveStyle("background-color: red");
		expect(modal).toHaveStyle("border: 2px solid blue");
		expect(modal).toHaveStyle("opacity: 0.8");
	});
});
