/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { fireEvent, render, screen } from "@testing-library/react";

import AddressInput from "./index";

// Mock the usePlace hook
jest.mock("@api-playground/hooks/usePlace", () => ({
	__esModule: true,
	default: () => ({
		suggestions: {
			list: [
				{
					id: "1",
					label: "123 Main St, New York, NY",
					country: "USA",
					region: "New York"
				},
				{
					id: "2",
					label: "456 Park Ave, New York, NY",
					country: "USA",
					region: "New York"
				}
			]
		},
		search: jest.fn(),
		isSearching: false,
		setSuggestions: jest.fn(),
		setHoveredMarker: jest.fn()
	})
}));

describe("AddressInput", () => {
	const mockOnChange = jest.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	it("renders with label and placeholder", () => {
		render(<AddressInput label="Address" placeholder="Enter address" onChange={mockOnChange} />);

		expect(screen.getByLabelText("Address")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter address")).toBeInTheDocument();
	});

	it("clears input and calls onChange with empty string when cleared", () => {
		render(<AddressInput label="Address" onChange={mockOnChange} />);

		const input = screen.getByLabelText("Address");
		fireEvent.change(input, { target: { value: "Test Address" } });

		const clearButton = screen.getByRole("button", { name: /clear/i });
		fireEvent.click(clearButton);

		expect(input).toHaveValue("");
		expect(mockOnChange).toHaveBeenCalledWith("");
	});
});
