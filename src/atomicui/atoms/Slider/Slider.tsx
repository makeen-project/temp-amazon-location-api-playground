import React from "react";

import { Flex, SliderField } from "@aws-amplify/ui-react";
import "./styles.scss";

export interface SliderConfig {
	name: string;
	label?: string;
	min?: number;
	max?: number;
	step?: number;
	defaultValue?: number;
	disabled?: boolean;
	required?: boolean;
	formatValue?: (value: number) => string;
	className?: string;
}

export interface SliderProps extends SliderConfig {
	value?: number;
	onChange?: (value: number) => void;
	error?: string;
}

export const Slider = ({
	name,
	label,
	min = 0,
	max = 100,
	step = 1,
	defaultValue,
	value,
	onChange,
	disabled = false,
	required = false,
	formatValue,
	error,
	className = ""
}: SliderProps): React.ReactElement => {
	// Validate min/max/step values
	if (min >= max) {
		throw new Error("min value must be less than max value");
	}
	if (step <= 0) {
		throw new Error("step value must be greater than 0");
	}
	if (defaultValue !== undefined && (defaultValue < min || defaultValue > max)) {
		throw new Error(`defaultValue must be between ${min} and ${max}`);
	}
	if (value !== undefined && (value < min || value > max)) {
		throw new Error(`value must be between ${min} and ${max}`);
	}

	const handleChange = (value: number) => {
		onChange?.(value);
	};

	return (
		<Flex direction="column" className={`slider ${className}`}>
			<SliderField
				className="slider__field"
				name={name}
				label={label}
				min={min}
				max={max}
				step={step}
				defaultValue={defaultValue}
				value={value}
				onChange={handleChange}
				isDisabled={disabled}
				isRequired={required}
				hasError={!!error}
				errorMessage={error}
				labelHidden={!label}
			>
				{formatValue && (value !== undefined || defaultValue !== undefined) && (
					<div className="slider__value">{formatValue(value ?? defaultValue ?? min)}</div>
				)}
			</SliderField>
		</Flex>
	);
};

export default Slider;
