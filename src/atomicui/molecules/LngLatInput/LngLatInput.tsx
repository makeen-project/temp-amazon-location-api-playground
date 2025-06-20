import { ChangeEvent, useEffect, useRef, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";

import useMapStore from "@api-playground/stores/useMapStore";
import { ViewPointType } from "@api-playground/types";
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
	const [lng, setLng] = useState<string>(value?.[0]?.toString() || defaultValue?.[0]?.toString() || "");
	const [lat, setLat] = useState<string>(value?.[1]?.toString() || defaultValue?.[1]?.toString() || "");
	const [focusedInput, setFocusedInput] = useState<"lng" | "lat" | null>(null);
	const lngInputRef = useRef<HTMLInputElement>(null);
	const latInputRef = useRef<HTMLInputElement>(null);
	const { viewpoint } = useMapStore();
	const prevViewpointRef = useRef<ViewPointType>(viewpoint);

	// Update state when value prop changes
	useEffect(() => {
		if (value) {
			setLng(value[0]?.toString() || "");
			setLat(value[1]?.toString() || "");
		}
	}, [value]);

	useEffect(() => {
		if (
			focusedInput &&
			(prevViewpointRef.current.longitude !== viewpoint.longitude ||
				prevViewpointRef.current.latitude !== viewpoint.latitude)
		) {
			const { longitude, latitude } = viewpoint;
			if (focusedInput === "lng") {
				setLng(longitude.toString());
				onChange?.([longitude, parseFloat(lat) || 0]);
			} else if (focusedInput === "lat") {
				setLat(latitude.toString());
				onChange?.([parseFloat(lng) || 0, latitude]);
			}
		}
		prevViewpointRef.current = viewpoint;
	}, [viewpoint]);

	const handleLngChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLng(value);

		// Only call onChange when we have valid coordinates
		const numValue = parseFloat(value);
		const currentLat = parseFloat(lat);

		if (!isNaN(numValue) && !isNaN(currentLat)) {
			// Both values are valid, update both
			onChange?.([numValue, currentLat]);
		} else if (!isNaN(numValue)) {
			// Only lng is valid, keep existing lat value if available
			const existingLat = defaultValue?.[1] || 0;
			onChange?.([numValue, existingLat]);
		}
		// Don't call onChange if the value is invalid or empty
	};

	const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLat(value);

		// Only call onChange when we have valid coordinates
		const numValue = parseFloat(value);
		const currentLng = parseFloat(lng);

		if (!isNaN(numValue) && !isNaN(currentLng)) {
			// Both values are valid, update both
			onChange?.([currentLng, numValue]);
		} else if (!isNaN(numValue)) {
			// Only lat is valid, keep existing lng value if available
			const existingLng = defaultValue?.[0] || 0;
			onChange?.([existingLng, numValue]);
		}
		// Don't call onChange if the value is invalid or empty
	};

	const clearLng = () => {
		setLng("");
		// Keep the current lat value when clearing lng
		const currentLat = parseFloat(lat);
		onChange?.([0, isNaN(currentLat) ? 0 : currentLat]);
	};

	const clearLat = () => {
		setLat("");
		// Keep the current lng value when clearing lat
		const currentLng = parseFloat(lng);
		onChange?.([isNaN(currentLng) ? 0 : currentLng, 0]);
	};

	return (
		<Flex direction="column" gap="0.1rem">
			<div className="lnglat-container">
				<div className="input-wrapper">
					<Label htmlFor={`${name}-longitude-input`} className="input-label">
						Longitude
					</Label>
					<div className="input-container">
						<Input
							ref={lngInputRef}
							id={`${name}-longitude-input`}
							name={`${name}-longitude`}
							type="text"
							inputMode="decimal"
							className="input-field"
							value={lng}
							onChange={handleLngChange}
							onFocus={() => setFocusedInput("lng")}
							onBlur={() => setFocusedInput(null)}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., -122.4194"
						/>
						{lng && (
							<Button className="clear-button" onClick={clearLng} size="small">
								<IconClose />
							</Button>
						)}
					</div>
				</div>
				<div className="input-wrapper">
					<Label htmlFor={`${name}-latitude-input`} className="input-label">
						Latitude
					</Label>
					<div className="input-container">
						<Input
							ref={latInputRef}
							id={`${name}-latitude-input`}
							name={`${name}-latitude`}
							type="text"
							inputMode="decimal"
							className="input-field"
							value={lat}
							onChange={handleLatChange}
							onFocus={() => setFocusedInput("lat")}
							onBlur={() => setFocusedInput(null)}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., 37.7749"
						/>
						{lat && (
							<Button className="clear-button" onClick={clearLat} size="small">
								<IconClose />
							</Button>
						)}
					</div>
				</div>
			</div>
		</Flex>
	);
}
