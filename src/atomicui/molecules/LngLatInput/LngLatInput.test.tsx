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

	it("renders with provided default values", () => {
		render(<LngLat onChange={mockOnChange} defaultValue={[-122.4194, 37.7749]} />);

		const lngInput = screen.getByLabelText("Longitude");
		const latInput = screen.getByLabelText("Latitude");

		expect(lngInput).toHaveValue("-122.4194");
		expect(latInput).toHaveValue("37.7749");
	});

	it("calls onChange when longitude is changed", () => {
		render(<LngLat onChange={mockOnChange} />);

		const lngInput = screen.getByLabelText("Longitude");
		fireEvent.change(lngInput, { target: { value: "-122.4194" } });

		expect(mockOnChange).toHaveBeenCalledWith([-122.4194, 0]);
	});

	it("calls onChange when latitude is changed", () => {
		render(<LngLat onChange={mockOnChange} />);

		const latInput = screen.getByLabelText("Latitude");
		fireEvent.change(latInput, { target: { value: "37.7749" } });

		expect(mockOnChange).toHaveBeenCalledWith([0, 37.7749]);
	});
});
