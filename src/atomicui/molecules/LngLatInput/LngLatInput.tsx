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
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			onChange?.([numValue, parseFloat(lat) || 0]);
		}
	};

	const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLat(value);
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			onChange?.([parseFloat(lng) || 0, numValue]);
		}
	};

	const clearLng = () => {
		onChange?.([0, parseFloat(lat)]);
		setLng("");
	};

	const clearLat = () => {
		onChange?.([parseFloat(lng), 0]);
		setLat("");
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
