import { fireEvent, render, screen } from "@testing-library/react";

import { Dropdown, createDropdown } from "./Dropdown";

describe("Dropdown", () => {
	const mockOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
		{ label: "French", value: "fr" }
	] as const;

	const defaultProps = {
		name: "language",
		label: "Language",
		options: mockOptions
	};

	it("renders with basic props", () => {
		render(<Dropdown {...defaultProps} />);
		expect(screen.getByLabelText("Language")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toBeInTheDocument();
	});

	it("displays all options", () => {
		render(<Dropdown {...defaultProps} />);
		const select = screen.getByRole("combobox");

		mockOptions.forEach(option => {
			expect(select).toContainHTML(option.label);
		});
	});

	it("handles value changes", () => {
		const onChange = jest.fn();
		render(<Dropdown {...defaultProps} onChange={onChange} />);

		fireEvent.change(screen.getByRole("combobox"), { target: { value: "es" } });
		expect(onChange).toHaveBeenCalledWith("es");
	});

	it("can be disabled", () => {
		render(<Dropdown {...defaultProps} disabled />);
		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("displays error message when provided", () => {
		const errorMessage = "Please select a language";
		render(<Dropdown {...defaultProps} error={errorMessage} />);
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	describe("createDropdown", () => {
		it("creates a pre-configured dropdown component", () => {
			const LanguageDropdown = createDropdown({
				name: "language",
				label: "Language",
				options: mockOptions
			});

			render(<LanguageDropdown />);
			expect(screen.getByLabelText("Language")).toBeInTheDocument();
			mockOptions.forEach(option => {
				expect(screen.getByRole("combobox")).toContainHTML(option.label);
			});
		});
	});
});
