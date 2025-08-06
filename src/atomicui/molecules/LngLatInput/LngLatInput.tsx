/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ChangeEvent, useEffect, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";
import usePlace from "@api-playground/hooks/usePlace";

import { Button, Flex, Input, Label } from "@aws-amplify/ui-react";
import "./styles.scss";

interface LngLatProps {
	onChange?: (position: number[]) => void;
	defaultValue?: number[];
	value?: number[];
	isRequired?: boolean;
	isDisabled?: boolean;
	name?: string;
}

export default function LngLat({ onChange, defaultValue, value, isRequired, isDisabled, name }: LngLatProps) {
	const { clickedPosition } = usePlace();

	const [coordinates, setCoordinates] = useState<[string, string]>([
		value?.[0]?.toString() || defaultValue?.[0]?.toString() || "",
		value?.[1]?.toString() || defaultValue?.[1]?.toString() || ""
	]);

	// Helper function to check if a coordinate value is empty
	const isCoordinateEmpty = (coord: string | undefined): boolean => {
		return !coord || coord === "" || coord === "0" || coord === "0.0" || parseFloat(coord) === 0;
	};

	// Use clickedPosition from place store when both inputs are empty and field is required
	useEffect(() => {
		if (clickedPosition && clickedPosition.length === 2 && isRequired) {
			const [clickedLng, clickedLat] = clickedPosition;
			setTimeout(() => {
				setCoordinates([clickedLng.toString(), clickedLat.toString()]);
				onChange?.([parseFloat(clickedLng.toString()), parseFloat(clickedLat.toString())]);
			}, 100);
		}
	}, [clickedPosition, isRequired]);

	// Update internal state when value prop changes
	useEffect(() => {
		if (value) {
			setCoordinates([value[0]?.toString() || "", value[1]?.toString() || ""]);
		}
	}, [value]);

	// Update internal state when defaultValue changes
	useEffect(() => {
		if (defaultValue && !value) {
			setCoordinates([defaultValue[0]?.toString() || "", defaultValue[1]?.toString() || ""]);
		}
	}, [defaultValue, value]);

	const handleCoordinateChange = (index: 0 | 1) => (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const newCoordinates: [string, string] = [...coordinates] as [string, string];
		newCoordinates[index] = newValue;
		setCoordinates(newCoordinates);

		if (onChange) {
			// Only convert to numbers if both values are present
			if (newCoordinates[0] && newCoordinates[1]) {
				const [lng, lat] = newCoordinates.map(coord => parseFloat(coord));
				onChange([lng, lat]);
			}
		}
	};

	const clearCoordinate = (index: 0 | 1) => () => {
		const newCoordinates: [string, string] = [...coordinates] as [string, string];
		newCoordinates[index] = "";
		setCoordinates(newCoordinates);

		if (onChange) {
			// Only call onChange if both values are present
			if (newCoordinates[0] && newCoordinates[1]) {
				const [lng, lat] = newCoordinates.map(coord => parseFloat(coord));
				onChange([lng, lat]);
			}
		}
	};

	const [lng, lat] = coordinates;

	return (
		<Flex direction="column" gap="0.1rem">
			<div className="lnglat-container">
				<div className="input-wrapper">
					<Label htmlFor={`${name}-latitude-input`} className="input-label">
						Latitude
					</Label>
					<div className="coord-input-container">
						<Input
							id={`${name}-latitude-input`}
							name={`${name}-latitude`}
							type="number"
							inputMode="decimal"
							className="input-field"
							value={lat}
							onChange={handleCoordinateChange(1)}
							required={isRequired}
							disabled={isDisabled}
							placeholder="Enter latitude"
							min="-90"
							max="90"
							step="any"
						/>
						{lat && (
							<Button className="clear-button" onClick={clearCoordinate(1)} size="small">
								<IconClose />
							</Button>
						)}
					</div>
				</div>
				<div className="input-wrapper">
					<Label htmlFor={`${name}-longitude-input`} className="input-label">
						Longitude
					</Label>
					<div className="coord-input-container">
						<Input
							id={`${name}-longitude-input`}
							name={`${name}-longitude`}
							type="number"
							inputMode="decimal"
							className="input-field"
							value={lng}
							onChange={handleCoordinateChange(0)}
							required={isRequired}
							disabled={isDisabled}
							placeholder="Enter longitude"
							min="-180"
							max="180"
							step="any"
						/>
						{lng && (
							<Button className="clear-button" onClick={clearCoordinate(0)} size="small">
								<IconClose />
							</Button>
						)}
					</div>
				</div>
			</div>
		</Flex>
	);
}
