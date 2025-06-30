import { ChangeEvent, useEffect, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";
import { useMap } from "@api-playground/hooks";

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
	const { clickedPosition } = useMap();

	useEffect(() => {
		if (defaultValue) {
			setLng(defaultValue[0]?.toString() || "");
			setLat(defaultValue[1]?.toString() || "");
		}
	}, [defaultValue]);

	useEffect(() => {
		if (value) {
			setLng(value[0]?.toString() || "");
			setLat(value[1]?.toString() || "");
		}
	}, [value]);

	// Use clickedPosition from map store when both inputs are empty
	useEffect(() => {
		const isLngEmpty = !lng || lng === "0" || lng === "0.0" || parseFloat(lng) === 0;
		const isLatEmpty = !lat || lat === "0" || lat === "0.0" || parseFloat(lat) === 0;

		if (clickedPosition && clickedPosition.length === 2 && isLngEmpty && isLatEmpty && onChange) {
			const [clickedLng, clickedLat] = clickedPosition;
			setLng(clickedLng.toString());
			setLat(clickedLat.toString());
			onChange([clickedLng, clickedLat]);
		}
	}, [clickedPosition, lng, lat, onChange]);

	const handleLngChange = (e: ChangeEvent<HTMLInputElement>) => {
		const lngValue = e.target.value;
		setLng(lngValue);
		if (onChange) {
			const lngNum = parseFloat(lngValue);
			const latNum = parseFloat(lat);
			const newPosition = [isNaN(lngNum) ? 0 : lngNum, isNaN(latNum) ? 0 : latNum];
			onChange(newPosition);
		}
	};

	const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
		const latValue = e.target.value;
		setLat(latValue);
		if (onChange) {
			const lngNum = parseFloat(lng);
			const latNum = parseFloat(latValue);
			const newPosition = [isNaN(lngNum) ? 0 : lngNum, isNaN(latNum) ? 0 : latNum];
			onChange(newPosition);
		}
	};

	const clearLng = () => {
		setLng("");
		if (onChange) {
			const latNum = parseFloat(lat);
			const newPosition = [0, isNaN(latNum) ? 0 : latNum];
			onChange(newPosition);
		}
	};

	const clearLat = () => {
		setLat("");
		if (onChange) {
			const lngNum = parseFloat(lng);
			const newPosition = [isNaN(lngNum) ? 0 : lngNum, 0];
			onChange(newPosition);
		}
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
							id={`${name}-longitude-input`}
							name={`${name}-longitude`}
							type="number"
							inputMode="decimal"
							className="input-field"
							value={lng}
							onChange={handleLngChange}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., -122.4194"
							min="-180"
							max="180"
							step="any"
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
							id={`${name}-latitude-input`}
							name={`${name}-latitude`}
							type="number"
							inputMode="decimal"
							className="input-field"
							value={lat}
							onChange={handleLatChange}
							required={isRequired}
							disabled={isDisabled}
							placeholder="e.g., 37.7749"
							min="-90"
							max="90"
							step="any"
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
