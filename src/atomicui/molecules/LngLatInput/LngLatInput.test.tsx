import { fireEvent, render, screen } from "@testing-library/react";

import LngLat from "./LngLatInput";

// Mock the map store
jest.mock("@api-playground/stores/useMapStore", () => ({
	__esModule: true,
	default: () => ({
		viewpoint: { longitude: 0, latitude: 0 },
		clickedPosition: []
	})
}));

// Mock the useMap hook
jest.mock("@api-playground/hooks/useMap", () => ({
	__esModule: true,
	default: jest.fn(() => ({
		clickedPosition: []
	}))
}));

describe("LngLat", () => {
	const mockOnChange = jest.fn();
	let mockUseMap: jest.MockedFunction<any>;

	beforeEach(() => {
		mockOnChange.mockClear();
		// Get the mocked function
		mockUseMap = require("@api-playground/hooks/useMap").default;
		mockUseMap.mockClear();
		// Default mock return value
		mockUseMap.mockReturnValue({
			clickedPosition: []
		});
	});

	it("renders with default values", () => {
		render(<LngLat onChange={mockOnChange} />);

		expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
		expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
	});

	it("should fill inputs with clicked position when both are empty", () => {
		// Mock clickedPosition
		mockUseMap.mockReturnValue({
			clickedPosition: [-122.4194, 37.7749]
		});

		render(<LngLat onChange={mockOnChange} />);

		// Check if the inputs are filled with clicked position
		expect(screen.getByDisplayValue("-122.4194")).toBeInTheDocument();
		expect(screen.getByDisplayValue("37.7749")).toBeInTheDocument();
		expect(mockOnChange).toHaveBeenCalledWith([-122.4194, 37.7749]);
	});

	it("should fill inputs with clicked position when both are '0'", () => {
		// Mock clickedPosition
		mockUseMap.mockReturnValue({
			clickedPosition: [-122.4194, 37.7749]
		});

		render(<LngLat onChange={mockOnChange} value={[0, 0]} />);

		// Check if the inputs are filled with clicked position
		expect(screen.getByDisplayValue("-122.4194")).toBeInTheDocument();
		expect(screen.getByDisplayValue("37.7749")).toBeInTheDocument();
		expect(mockOnChange).toHaveBeenCalledWith([-122.4194, 37.7749]);
	});

	it("should NOT fill inputs when one is not empty/zero", () => {
		// Mock clickedPosition
		mockUseMap.mockReturnValue({
			clickedPosition: [-122.4194, 37.7749]
		});

		render(<LngLat onChange={mockOnChange} value={[0, 45]} />);

		// Should keep the existing values
		expect(screen.getByDisplayValue("0")).toBeInTheDocument();
		expect(screen.getByDisplayValue("45")).toBeInTheDocument();
		// Should not call onChange with clicked position
		expect(mockOnChange).not.toHaveBeenCalledWith([-122.4194, 37.7749]);
	});
});
