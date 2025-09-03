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
	allowClear?: boolean;
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
	className = "",
	allowClear = false
}) => {
	const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);
	const [inputValue, setInputValue] = useState<string>(defaultValue?.toString() ?? "");
	const value = propValue !== undefined ? propValue : internalValue;

	useEffect(() => {
		if (isDisabled) {
			setInternalValue(defaultValue);
			setInputValue(defaultValue?.toString() ?? "");
		}
	}, [isDisabled, defaultValue]);

	useEffect(() => {
		if (propValue) {
			setInputValue(propValue.toString());
		} else if (!allowClear) {
			setInputValue(min.toString());
		}
	}, [propValue, allowClear, min]);

	const handleSliderChange = (newValue: number) => {
		if (propValue === undefined) {
			setInternalValue(newValue);
		}
		setInputValue(newValue.toString());
		onChange?.(newValue);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value: newInputValue } = e.target;
		setInputValue(newInputValue);

		if (newInputValue === "") {
			if (allowClear) {
				onChange?.(undefined as unknown as number);
				setInternalValue(undefined);
				return;
			} else {
				const defaultVal = min;
				setInputValue(defaultVal.toString());
				onChange?.(defaultVal);
				setInternalValue(defaultVal);
				return;
			}
		}

		if (Number(newInputValue) < min || Number(newInputValue) > max) {
			return;
		}

		const newValue = Number(newInputValue);
		if (!isNaN(newValue) && newValue >= min && newValue <= max) {
			if (propValue === undefined) {
				setInternalValue(newValue);
			}
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
					value={inputValue}
					min={min}
					onChange={handleInputChange}
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
