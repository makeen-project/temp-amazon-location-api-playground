import { ChangeEvent, useEffect, useState } from "react";

import { IconClose } from "@api-playground/assets/svgs";

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

	useEffect(() => {
		if (defaultValue) {
			console.log("defaultValue", defaultValue);
			setLng(defaultValue[0]?.toString() || "");
			setLat(defaultValue[1]?.toString() || "");
		}
	}, [defaultValue]);

	const handleLngChange = (e: ChangeEvent<HTMLInputElement>) => {
		const lngValue = e.target.value;
		setLng(lngValue);
		if (onChange) {
			const lngNum = parseFloat(lngValue);
			const latNum = parseFloat(lat);
			onChange([lngNum, latNum]);
		}
	};

	const handleLatChange = (e: ChangeEvent<HTMLInputElement>) => {
		const latValue = e.target.value;
		setLat(latValue);
		if (onChange) {
			const lngNum = parseFloat(lng);
			const latNum = parseFloat(latValue);
			onChange([lngNum, latNum]);
		}
	};

	const clearLng = () => {
		setLng("");
		if (onChange) {
			const latNum = parseFloat(lat);
			onChange([0, isNaN(latNum) ? 0 : latNum]);
		}
	};

	const clearLat = () => {
		setLat("");
		if (onChange) {
			const lngNum = parseFloat(lng);
			onChange([isNaN(lngNum) ? 0 : lngNum, 0]);
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
