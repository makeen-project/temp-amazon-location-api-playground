/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

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

	it.skip("applies custom styles", () => {
		const customStyles = {
			backgroundColor: "red",
			border: "2px solid blue",
			opacity: "0.8"
		};
		render(<HintModal {...defaultProps} customStyles={customStyles} />);
		const modal = screen.getByTestId("hint-modal");
		expect(modal).toHaveStyle({
			backgroundColor: "red",
			borderWidth: "2px",
			borderStyle: "solid"
		});
	});
});
