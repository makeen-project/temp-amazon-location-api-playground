import { ChangeEvent, useEffect, useRef, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";

import useMapStore from "@api-playground/stores/useMapStore";
import { ViewPointType } from "@api-playground/types";
import { Button, Flex, Input, Label } from "@aws-amplify/ui-react";
import "./styles.scss";

interface LngLatProps {
	onChange?: (position: number[]) => void;
	defaultValue?: number[];
}

export default function LngLat({ onChange, defaultValue }: LngLatProps) {
	const [lng, setLng] = useState<string>(defaultValue?.[0]?.toString() || "");
	const [lat, setLat] = useState<string>(defaultValue?.[1]?.toString() || "");
	const [focusedInput, setFocusedInput] = useState<"lng" | "lat" | null>(null);
	const lngInputRef = useRef<HTMLInputElement>(null);
	const latInputRef = useRef<HTMLInputElement>(null);
	const { viewpoint } = useMapStore();
	const prevViewpointRef = useRef<ViewPointType>(viewpoint);

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
		setLng("");
		onChange?.([0, parseFloat(lat) || 0]);
	};

	const clearLat = () => {
		setLat("");
		onChange?.([parseFloat(lng) || 0, 0]);
	};

	return (
		<Flex direction="column" gap="0.1rem">
			<div className="lnglat-container">
				<div className="input-wrapper">
					<Label htmlFor="longitude-input" className="input-label">
						Longitude
					</Label>
					<div className="input-container">
						<Input
							ref={lngInputRef}
							id="longitude-input"
							type="text"
							inputMode="decimal"
							className="input-field"
							value={lng}
							onChange={handleLngChange}
							onFocus={() => setFocusedInput("lng")}
							onBlur={() => setFocusedInput(null)}
						/>
						{lng && (
							<Button className="clear-button" onClick={clearLng} size="small">
								<IconClose />
							</Button>
						)}
					</div>
				</div>
				<div className="input-wrapper">
					<Label htmlFor="latitude-input" className="input-label">
						Latitude
					</Label>
					<div className="input-container">
						<Input
							ref={latInputRef}
							id="latitude-input"
							type="text"
							inputMode="decimal"
							className="input-field"
							value={lat}
							onChange={handleLatChange}
							onFocus={() => setFocusedInput("lat")}
							onBlur={() => setFocusedInput(null)}
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
