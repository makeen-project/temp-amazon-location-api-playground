import React, { useEffect, useState } from "react";

import { Flex, Input, SwitchField } from "@aws-amplify/ui-react";

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
	onToggle?: (enabled: boolean) => void;
	disabled?: boolean;
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
	onToggle,
	disabled: propDisabled = false,
	required = false,
	error,
	className = ""
}) => {
	const [value, setValue] = useState<number>(propValue ?? defaultValue ?? min);
	const [isEnabled, setIsEnabled] = useState<boolean>(!propDisabled);

	useEffect(() => {
		if (propValue !== undefined && propValue !== value) {
			setValue(propValue);
		}
	}, [propValue]);

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

	const handleToggle = (checked: boolean) => {
		setIsEnabled(checked);
		onToggle?.(checked);
	};

	return (
		<Flex direction="column" className={`slider-with-input ${className}`}>
			<Flex className="slider-with-input__header">
				{label && <span className="slider-with-input__label">{label}</span>}
				<SwitchField
					label=""
					size="large"
					labelPosition="start"
					isChecked={isEnabled}
					onChange={e => handleToggle(e.target.checked)}
					className="slider-with-input__toggle"
				/>
			</Flex>
			<Flex className="slider-with-input__controls">
				<Slider
					name={`${name}-slider`}
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleSliderChange}
					disabled={!isEnabled}
					required={required}
					error={error}
					className="slider-with-input__slider"
				/>
				<Input
					type="number"
					name={name}
					value={value}
					onChange={handleInputChange}
					min={min}
					max={max}
					step={step}
					isDisabled={!isEnabled}
					className="slider-with-input__input"
				/>
			</Flex>
		</Flex>
	);
};

export default SliderWithInput;
