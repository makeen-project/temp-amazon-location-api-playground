import { fireEvent, render, screen } from "@testing-library/react";

import { Accordion } from "./Accordion";

describe("<Accordion />", () => {
	const defaultProps = {
		title: "Test Accordion",
		children: <div>Test Content</div>
	};

	it("renders with basic props", () => {
		render(<Accordion {...defaultProps} />);

		expect(screen.getByText("Test Accordion")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	it("renders with custom icons", () => {
		const openIcon = <div data-testid="open-icon">Open</div>;
		const closeIcon = <div data-testid="close-icon">Close</div>;

		render(<Accordion {...defaultProps} openIcon={openIcon} closeIcon={closeIcon} />);
		expect(screen.getByTestId("close-icon")).toBeInTheDocument();
	});

	it("starts expanded when defaultOpen is true", () => {
		render(<Accordion {...defaultProps} defaultOpen />);
		expect(screen.getByText("Test Content")).toBeVisible();
	});
});
