/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useState } from "react";

import { Flex, Input } from "@aws-amplify/ui-react";

import { Slider } from "../../atoms/Slider/Slider";
import "./styles.scss";

export interface SliderWithInputProps {
	name: string;
	label?: string;
	min?: number;
	max?: number;
	step?: number;
	defaultValue?: number;
	value?: number;
	onChange?: (value: number) => void;
	isDisabled?: boolean;
	required?: boolean;
	error?: string;
	className?: string;
}

export const SliderWithInput: React.FC<SliderWithInputProps> = ({
	name,
	label,
	min = 0,
	max = 100,
	step = 1,
	defaultValue,
	value: propValue,
	onChange,
	isDisabled = false,
	required = false,
	error,
	className = ""
}) => {
	const [value, setValue] = useState<number | undefined>(defaultValue ?? propValue);

	useEffect(() => {
		console.log("Name", name, "defaultValue", defaultValue);
		console.log("Name", name, "propValue", propValue);
		setValue(defaultValue ?? propValue);
	}, [propValue, defaultValue]);

	useEffect(() => {
		// Reset value to default when disabled
		if (isDisabled) {
			setValue(defaultValue);
		}
	}, [isDisabled, defaultValue]);

	const handleSliderChange = (newValue: number) => {
		setValue(newValue);
		onChange?.(newValue);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value);
		if (!isNaN(newValue) && newValue >= min && newValue <= max) {
			setValue(newValue);
			onChange?.(newValue);
		}
	};

	return (
		<Flex direction="column" className={`slider-with-input ${className}`}>
			<Flex className="slider-with-input__header">
				{label && <span className="slider-with-input__label">{label}</span>}
			</Flex>
			<Flex className="slider-with-input__controls">
				<Slider
					name={name}
					min={min}
					max={max}
					step={step}
					value={value ?? min}
					onChange={handleSliderChange}
					disabled={isDisabled}
					required={required}
					error={error}
					className="slider-with-input__slider"
				/>
				<Input
					type="number"
					value={value === undefined ? "" : value}
					onChange={handleInputChange}
					min={min}
					max={max}
					step={step}
					isDisabled={isDisabled}
					className="slider-with-input__input"
				/>
			</Flex>
		</Flex>
	);
};

export default SliderWithInput;
