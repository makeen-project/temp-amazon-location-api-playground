/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ChangeEvent, useEffect, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";
import usePlace from "@api-playground/hooks/usePlace";
import { Button, Input, Label, Text } from "@aws-amplify/ui-react";

import "./styles.scss";

interface BoundingBoxProps {
	onChange?: (boundingBox: number[]) => void;
	defaultValue?: number[];
	value?: number[];
	isRequired?: boolean;
	isDisabled?: boolean;
	name?: string;
	label?: string;
}

interface ValidationResult {
	isValid: boolean;
	errorMessage?: string;
}

export default function BoundingBox({
	onChange,
	defaultValue,
	value,
	isRequired,
	isDisabled,
	name,
	label = "Bounding Box"
}: BoundingBoxProps) {
	const { clickedPosition } = usePlace();
	const [westLng, setWestLng] = useState<string>("");
	const [southLat, setSouthLat] = useState<string>("");
	const [eastLng, setEastLng] = useState<string>("");
	const [northLat, setNorthLat] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	// Parse bounding box array to individual coordinate strings
	// Input: [westLng, southLat, eastLng, northLat] (AWS format)
	// Output: individual coordinate strings
	const boundingBoxToStrings = (
		coords: number[] | undefined
	): { west: string; south: string; east: string; north: string } => {
		if (!coords || coords.length !== 4) {
			return { west: "", south: "", east: "", north: "" };
		}
		return {
			west: coords[0].toString(),
			south: coords[1].toString(),
			east: coords[2].toString(),
			north: coords[3].toString()
		};
	};

	// Validate a single coordinate value
	const validateCoordinate = (value: string, type: "latitude" | "longitude"): ValidationResult => {
		if (!value.trim()) return { isValid: true };

		// Allow incomplete decimal numbers (e.g., "40.", "40.7", "-74.")
		const isValidNumber = (str: string): boolean => {
			return /^[-+]?(\d*\.?\d*)$/.test(str);
		};

		if (!isValidNumber(value)) {
			return { isValid: false, errorMessage: `Please enter a valid number for ${type}` };
		}

		const num = parseFloat(value);

		// Only validate ranges if we have a complete number (not ending with decimal point)
		if (!isNaN(num) && !value.endsWith(".")) {
			if (type === "latitude" && (num < -90 || num > 90)) {
				return { isValid: false, errorMessage: "Latitude must be between -90 and 90 degrees" };
			}
			if (type === "longitude" && (num < -180 || num > 180)) {
				return { isValid: false, errorMessage: "Longitude must be between -180 and 180 degrees" };
			}
		}

		return { isValid: true };
	};

	// Validate the complete bounding box
	const validateBoundingBox = (): ValidationResult => {
		const west = parseFloat(westLng);
		const south = parseFloat(southLat);
		const east = parseFloat(eastLng);
		const north = parseFloat(northLat);

		// Check if all values are complete numbers
		const hasCompleteValues =
			!isNaN(west) &&
			!isNaN(south) &&
			!isNaN(east) &&
			!isNaN(north) &&
			!westLng.endsWith(".") &&
			!southLat.endsWith(".") &&
			!eastLng.endsWith(".") &&
			!northLat.endsWith(".");

		if (hasCompleteValues) {
			// Validate bounding box logic
			if (south >= north) {
				return { isValid: false, errorMessage: "South latitude must be less than north latitude" };
			}

			// Note: West can be greater than East for bounding boxes that cross the antimeridian
			// So we don't validate west < east
		}

		return { isValid: true };
	};

	// Parse individual coordinate strings to bounding box array
	// Output: [westLng, southLat, eastLng, northLat] (AWS format)
	const parseBoundingBox = (): number[] | null => {
		const west = parseFloat(westLng);
		const south = parseFloat(southLat);
		const east = parseFloat(eastLng);
		const north = parseFloat(northLat);

		// Check if all values are valid numbers and complete (not ending with decimal point)
		const hasCompleteValues =
			!isNaN(west) &&
			!isNaN(south) &&
			!isNaN(east) &&
			!isNaN(north) &&
			westLng.trim() !== "" &&
			southLat.trim() !== "" &&
			eastLng.trim() !== "" &&
			northLat.trim() !== "" &&
			!westLng.endsWith(".") &&
			!southLat.endsWith(".") &&
			!eastLng.endsWith(".") &&
			!northLat.endsWith(".");

		if (hasCompleteValues) {
			// Validate ranges
			if (south < -90 || south > 90 || north < -90 || north > 90) return null;
			if (west < -180 || west > 180 || east < -180 || east > 180) return null;
			if (south >= north) return null; // South must be less than North

			return [west, south, east, north];
		}

		return null;
	};

	// Update internal state when value prop changes
	useEffect(() => {
		if (value && value.length === 4) {
			const coords = boundingBoxToStrings(value);
			setWestLng(coords.west);
			setSouthLat(coords.south);
			setEastLng(coords.east);
			setNorthLat(coords.north);
		} else if (defaultValue && defaultValue.length === 4) {
			const coords = boundingBoxToStrings(defaultValue);
			setWestLng(coords.west);
			setSouthLat(coords.south);
			setEastLng(coords.east);
			setNorthLat(coords.north);
		} else {
			setWestLng("");
			setSouthLat("");
			setEastLng("");
			setNorthLat("");
		}
		// Clear error when value is set externally
		setErrorMessage("");
	}, [value, defaultValue]);

	// Use clickedPosition from place store when inputs are empty and field is required
	useEffect(() => {
		if (clickedPosition && clickedPosition.length === 2 && isRequired) {
			const [clickedLng, clickedLat] = clickedPosition;
			// Create a small bounding box around the clicked position (±0.01 degrees)
			const offset = 0.01;
			const west = parseFloat(clickedLng.toString()) - offset;
			const south = parseFloat(clickedLat.toString()) - offset;
			const east = parseFloat(clickedLng.toString()) + offset;
			const north = parseFloat(clickedLat.toString()) + offset;

			setTimeout(() => {
				onChange?.([west, south, east, north]);
			}, 1);
		}
	}, [clickedPosition, isRequired]);

	const handleInputChange = (type: "west" | "south" | "east" | "north") => (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		// Update the appropriate state
		switch (type) {
			case "west":
				setWestLng(newValue);
				break;
			case "south":
				setSouthLat(newValue);
				break;
			case "east":
				setEastLng(newValue);
				break;
			case "north":
				setNorthLat(newValue);
				break;
		}

		// Validate individual coordinate
		const coordinateType = type === "west" || type === "east" ? "longitude" : "latitude";
		const validation = validateCoordinate(newValue, coordinateType);

		if (!validation.isValid) {
			setErrorMessage(validation.errorMessage || "");
		} else {
			// Clear individual coordinate errors and validate the complete bounding box
			const boundingBoxValidation = validateBoundingBox();
			setErrorMessage(boundingBoxValidation.errorMessage || "");
		}

		// Try to parse and call onChange if we have valid coordinates
		if (onChange) {
			// Use a timeout to ensure state is updated before parsing
			setTimeout(() => {
				const parsedBoundingBox = parseBoundingBox();
				if (parsedBoundingBox) {
					onChange(parsedBoundingBox);
				} else {
					// Check if all inputs are empty
					const allEmpty = !westLng.trim() && !southLat.trim() && !eastLng.trim() && !northLat.trim();
					if (allEmpty) {
						onChange([]);
					}
				}
			}, 0);
		}
	};

	const clearInput = () => {
		setWestLng("");
		setSouthLat("");
		setEastLng("");
		setNorthLat("");
		setErrorMessage("");
		if (onChange) {
			onChange([]);
		}
	};

	const hasAnyValue = westLng || southLat || eastLng || northLat;

	return (
		<div className="bounding-box-container">
			<div className="input-wrapper">
				<Label htmlFor={`${name}-bounding-box`} className="input-label">
					{label}
				</Label>
				<div className="bounding-box-inputs">
					{/* North Latitude */}
					<div className="bounding-box-input-group">
						<Input
							id={`${name}-north-lat`}
							name={`${name}-north`}
							type="text"
							className="playground-input-field"
							value={northLat}
							onChange={handleInputChange("north")}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., 40.7829"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							hasError={!!errorMessage}
						/>
					</div>

					{/* West Longitude */}
					<div className="bounding-box-input-group">
						<Input
							id={`${name}-west-lng`}
							name={`${name}-west`}
							type="text"
							className="playground-input-field"
							value={westLng}
							onChange={handleInputChange("west")}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., -74.0560"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							hasError={!!errorMessage}
						/>
					</div>

					{/* East Longitude */}
					<div className="bounding-box-input-group">
						<Input
							id={`${name}-east-lng`}
							name={`${name}-east`}
							type="text"
							className="playground-input-field"
							value={eastLng}
							onChange={handleInputChange("east")}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., -73.9560"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							hasError={!!errorMessage}
						/>
					</div>

					{/* South Latitude */}
					<div className="bounding-box-input-group">
						<Input
							id={`${name}-south-lat`}
							name={`${name}-south`}
							type="text"
							className="playground-input-field"
							value={southLat}
							onChange={handleInputChange("south")}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., 40.7489"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							hasError={!!errorMessage}
						/>
					</div>
				</div>

				{hasAnyValue && (
					<Button className="clear-button" onClick={clearInput} size="small">
						<IconClose />
					</Button>
				)}

				{errorMessage && (
					<Text color="red.60" fontSize="0.75rem" marginTop="0.25rem">
						{errorMessage}
					</Text>
				)}
			</div>
		</div>
	);
}
