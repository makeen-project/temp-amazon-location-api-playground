import { render, screen } from "@testing-library/react";

import { Slider } from "./Slider";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

describe("Slider", () => {
	const defaultProps = {
		name: "volume",
		label: "Volume",
		min: 0,
		max: 100,
		step: 1
	};

	it("renders with basic props", () => {
		render(<Slider {...defaultProps} />);
		expect(screen.getByRole("slider")).toBeInTheDocument();
	});

	it("displays error message when provided", () => {
		const errorMessage = "Please select a value";
		render(<Slider {...defaultProps} error={errorMessage} />);
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("throws error when min is greater than or equal to max", () => {
		expect(() => {
			render(<Slider {...defaultProps} min={100} max={50} />);
		}).toThrow("min value must be less than max value");
	});

	it("throws error when step is less than or equal to 0", () => {
		expect(() => {
			render(<Slider {...defaultProps} step={0} />);
		}).toThrow("step value must be greater than 0");
	});
});
