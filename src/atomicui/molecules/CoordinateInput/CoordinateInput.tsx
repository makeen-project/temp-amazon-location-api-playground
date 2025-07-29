import { ChangeEvent, useEffect, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";

import { Button, Flex, Input, Label } from "@aws-amplify/ui-react";
import "./styles.scss";

interface CoordinateInputProps {
	onChange?: (position: number[]) => void;
	defaultValue?: number[];
	value?: number[];
	isRequired?: boolean;
	isDisabled?: boolean;
	name?: string;
	placeholder?: string;
}

export default function CoordinateInput({
	onChange,
	defaultValue,
	value,
	isRequired,
	isDisabled,
	name,
	placeholder = "Enter latitude, longitude (e.g., 40.7128, -74.0060)"
}: CoordinateInputProps) {
	const [coordinateString, setCoordinateString] = useState<string>("");

	// Parse coordinates from array to string format
	// Input: [longitude, latitude] (AWS format)
	// Output: "latitude, longitude" (user-friendly format)
	const coordinatesToString = (coords: number[] | undefined): string => {
		if (!coords || coords.length !== 2) return "";
		return `${coords[1]}, ${coords[0]}`; // lat, lng
	};

	// Parse string to coordinates array
	// Input: "latitude, longitude" (user-friendly format)
	// Output: [longitude, latitude] (AWS format)
	const parseCoordinateString = (input: string): number[] | null => {
		if (!input.trim()) return null;

		const parts = input.split(",").map(part => part.trim());
		if (parts.length !== 2) return null;

		const lat = parseFloat(parts[0]);
		const lng = parseFloat(parts[1]);

		// Validate coordinates
		if (isNaN(lat) || isNaN(lng)) return null;
		if (lat < -90 || lat > 90) return null; // Latitude range
		if (lng < -180 || lng > 180) return null; // Longitude range

		return [lng, lat]; // Return as [longitude, latitude] for AWS API
	};

	// Update internal state when value prop changes
	useEffect(() => {
		if (value) {
			setCoordinateString(coordinatesToString(value));
		} else if (defaultValue) {
			setCoordinateString(coordinatesToString(defaultValue));
		} else {
			setCoordinateString("");
		}
	}, [value, defaultValue]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setCoordinateString(newValue);

		if (onChange) {
			const parsedCoords = parseCoordinateString(newValue);
			if (parsedCoords) {
				onChange(parsedCoords);
			} else if (!newValue.trim()) {
				// If input is empty, pass empty array
				onChange([]);
			}
		}
	};

	const clearInput = () => {
		setCoordinateString("");
		if (onChange) {
			onChange([]);
		}
	};

	return (
		<Flex direction="column" gap="0.1rem">
			<div className="coordinate-input-container">
				<Label htmlFor={`${name}-coordinate-input`} className="input-label">
					{name === "biasPosition" ? "BiasPosition" : "Coordinates"}
				</Label>
				<div className="input-container">
					<Input
						id={`${name}-coordinate-input`}
						name={name}
						type="text"
						className="input-field"
						value={coordinateString}
						onChange={handleInputChange}
						required={isRequired}
						disabled={isDisabled}
						placeholder={placeholder}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
					/>
					{coordinateString && (
						<Button className="clear-button" onClick={clearInput} size="small">
							<IconClose />
						</Button>
					)}
				</div>
			</div>
		</Flex>
	);
}
