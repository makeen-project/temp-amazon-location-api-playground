/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import RadioButtonGroup from "./RadioButton";

type TestOption = "option1" | "option2" | "option3";

const mockOptions: ReadonlyArray<{
	label: string;
	value: TestOption;
	disabled?: boolean;
}> = [
	{ label: "Option 1", value: "option1" },
	{ label: "Option 2", value: "option2" },
	{ label: "Option 3", value: "option3", disabled: true }
];

describe("RadioButtonGroup", () => {
	it("renders all options with correct labels", () => {
		render(<RadioButtonGroup<TestOption> name="test-group" options={mockOptions} label="Test Group" />);

		mockOptions.forEach(option => {
			expect(screen.getByText(option.label)).toBeInTheDocument();
		});
	});

	it("handles option selection", () => {
		const handleChange = vi.fn();
		render(<RadioButtonGroup<TestOption> name="test-group" options={mockOptions} onChange={handleChange} />);

		fireEvent.click(screen.getByText("Option 1"));
		expect(handleChange).toHaveBeenCalledWith("option1");
	});

	it("respects disabled state", () => {
		render(<RadioButtonGroup<TestOption> name="test-group" options={mockOptions} disabled={true} />);

		const radioButtons = screen.getAllByRole("radio");
		radioButtons.forEach(radio => {
			expect(radio).toBeDisabled();
		});
	});

	it("respects individual option disabled state", () => {
		render(<RadioButtonGroup<TestOption> name="test-group" options={mockOptions} />);

		const disabledOption = screen.getByLabelText("Option 3");
		expect(disabledOption).toBeDisabled();
	});

	it("sets default value correctly", () => {
		render(<RadioButtonGroup<TestOption> name="test-group" options={mockOptions} defaultValue="option2" />);

		const selectedOption = screen.getByLabelText("Option 2") as HTMLInputElement;
		expect(selectedOption.checked).toBe(true);
	});
});
