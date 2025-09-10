/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { fireEvent, render, screen } from "@testing-library/react";

import MultiSelectDropdown from "./index";

describe("MultiSelectDropdown", () => {
	const mockOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
		{ label: "French", value: "fr" }
	] as const;

	const defaultProps = {
		name: "languages",
		label: "Languages",
		options: mockOptions
	};

	it("renders with basic props", () => {
		render(<MultiSelectDropdown {...defaultProps} />);
		expect(screen.getByLabelText("Languages")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toBeInTheDocument();
	});

	it("displays all options initially", () => {
		render(<MultiSelectDropdown {...defaultProps} />);
		const select = screen.getByRole("combobox");

		mockOptions.forEach(option => {
			expect(select).toContainHTML(option.label);
		});
	});

	it("adds selected item and displays it as a button", () => {
		const onChange = vi.fn();
		render(<MultiSelectDropdown {...defaultProps} onChange={onChange} />);

		// Select an option
		fireEvent.focus(screen.getByRole("combobox"));
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "es" } });

		// Check if button was created
		const selectedButton = screen.getByRole("button", { name: /Spanish/i });
		expect(selectedButton).toBeInTheDocument();

		// Verify onChange was called with correct array
		expect(onChange).toHaveBeenCalledWith(["es"]);
	});

	it("removes selected item when clicking remove button", () => {
		const onChange = vi.fn();
		render(<MultiSelectDropdown {...defaultProps} defaultValue={["es"]} onChange={onChange} />);

		// Initial selected button should exist
		const selectedButton = screen.getByRole("button", { name: /Spanish/i });
		expect(selectedButton).toBeInTheDocument();

		// Click remove button
		fireEvent.click(selectedButton);

		// Button should be removed
		expect(screen.queryByRole("button", { name: /Spanish/i })).not.toBeInTheDocument();

		// Verify onChange was called with empty array
		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("respects minSelected validation", () => {
		render(<MultiSelectDropdown {...defaultProps} minSelected={2} />);

		// Select one option
		fireEvent.focus(screen.getByRole("combobox"));
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "es" } });

		// Should show error message
		expect(screen.getByText("Select at least 2")).toBeInTheDocument();
	});

	it("can be disabled", () => {
		render(<MultiSelectDropdown {...defaultProps} disabled defaultValue={["es"]} />);

		// Dropdown should be disabled
		expect(screen.getByRole("combobox")).toBeDisabled();

		// Remove button should be disabled
		const selectedButton = screen.getByRole("button", { name: /Spanish/i });
		expect(selectedButton).toHaveAttribute("disabled");
	});

	it("removes selected options from dropdown list", () => {
		render(<MultiSelectDropdown {...defaultProps} defaultValue={["es"]} />);
		const select = screen.getByRole("combobox");

		// Spanish should not be in dropdown options
		expect(select).not.toContainHTML("Spanish");
		// But other options should remain
		expect(select).toContainHTML("English");
		expect(select).toContainHTML("French");
	});
});
