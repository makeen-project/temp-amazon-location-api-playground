import { fireEvent, render, screen } from "@testing-library/react";

import LngLat from "./LngLatInput";

// Mock the map store
jest.mock("@api-playground/stores/useMapStore", () => ({
	__esModule: true,
	default: () => ({
		viewpoint: { longitude: 0, latitude: 0 }
	})
}));

describe("LngLat", () => {
	const mockOnChange = jest.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	it("renders with default values", () => {
		render(<LngLat onChange={mockOnChange} />);

		expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
		expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
	});
});
