/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

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
		
		// Allow partial input like "30," or "30, " or ", 40"
		if (parts.length === 0 || parts.length > 2) return null;
		
		// Handle case where user just typed comma
		if (parts.length === 1 && input.endsWith(",")) {
			return null; // Allow this case, don't reset
		}
		
		// Handle case where user typed comma at the beginning
		if (parts.length === 1 && input.startsWith(",")) {
			return null; // Allow this case, don't reset
		}

		// Check if the parts are valid number strings (including incomplete decimals)
		const latStr = parts[0] || "";
		const lngStr = parts[1] || "";
		
		// Allow incomplete decimal numbers (e.g., "40.", "40.7", "-74.")
		const isValidNumber = (str: string): boolean => {
			return str === "" || /^[-+]?(\d*\.?\d*)$/.test(str);
		};

		if (!isValidNumber(latStr) || !isValidNumber(lngStr)) return null;

		const lat = parseFloat(latStr);
		const lng = parseFloat(lngStr);

		// Only validate ranges if we have complete numbers (not ending with decimal point)
		if (!isNaN(lat) && !isNaN(lng)) {
			// Check if the original strings end with a decimal point (incomplete numbers)
			const isLatIncomplete = latStr.endsWith(".");
			const isLngIncomplete = lngStr.endsWith(".");
			
			// Only validate ranges for complete numbers
			if (!isLatIncomplete && latStr !== "" && (lat < -90 || lat > 90)) return null; // Latitude range
			if (!isLngIncomplete && lngStr !== "" && (lng < -180 || lng > 180)) return null; // Longitude range
		}

		// Return coordinates even if they're incomplete (NaN values will be handled by the API)
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
				// Check if we have valid numbers (not NaN) and complete numbers
				const [lng, lat] = parsedCoords;
				const parts = newValue.split(",").map(part => part.trim());
				const isLatIncomplete = parts[0]?.endsWith(".");
				const isLngIncomplete = parts[1]?.endsWith(".");
				
				// Check if both parts are non-empty and complete
				const hasLat = parts[0] && parts[0] !== "";
				const hasLng = parts[1] && parts[1] !== "";
				
				if (!isNaN(lng) && !isNaN(lat) && !isLatIncomplete && !isLngIncomplete && hasLat && hasLng) {
					// Only pass complete coordinates
					onChange(parsedCoords);
				} else {
					// If coordinates are incomplete, don't call onChange (allow continued typing)
					// Only call onChange with empty array if input is completely empty
					if (!newValue.trim()) {
						onChange([]);
					}
				}
			} else {
				// If parsing failed, only call onChange if input is completely empty
				if (!newValue.trim()) {
					onChange([]);
				}
				// Otherwise, don't call onChange at all (allow continued typing)
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
