/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React from "react";

import { IconInfo } from "@api-playground/assets/svgs";
import { Flex, Radio, RadioGroupField } from "@aws-amplify/ui-react";
import { Tooltip } from "react-tooltip";

import "./styles.scss";
import { Content } from "../Content";

export interface CustomRadioButtonProps {
	name: string;
	value: string;
	labelText: string;
	checked?: boolean;
	disabled?: boolean;
	onChange?: (value: string) => void;
	className?: string;
}

export const RadioButton: React.FC<CustomRadioButtonProps> = ({
	name,
	value,
	labelText,
	checked = false,
	disabled = false,
	onChange,
	className = ""
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	return (
		<Radio
			className={`custom-radio ${className}`}
			name={name}
			value={value}
			labelPosition="end"
			isDisabled={disabled}
			checked={checked}
			onChange={handleChange}
		>
			{labelText}
		</Radio>
	);
};

export interface RadioOption<T extends string> {
	label: string;
	value: T;
	disabled?: boolean;
	tooltipText?: string;
}

export interface RadioButtonGroupProps<T extends string> {
	name: string;
	options: ReadonlyArray<RadioOption<T>>;
	defaultValue?: T;
	value?: T;
	onChange?: (value: T) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
}

export const RadioButtonGroup = <T extends string>({
	name,
	options,
	defaultValue,
	value,
	onChange,
	label,
	disabled = false,
	className = ""
}: RadioButtonGroupProps<T>): React.ReactElement => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value as T);
	};

	if (defaultValue && !options.some(opt => opt.value === defaultValue)) {
		throw new Error(
			`Invalid defaultValue "${defaultValue}". Must be one of: ${options.map(opt => `"${opt.value}"`).join(", ")}`
		);
	}

	if (value && !options.some(opt => opt.value === value)) {
		throw new Error(`Invalid value "${value}". Must be one of: ${options.map(opt => `"${opt.value}"`).join(", ")}`);
	}

	return (
		<Flex direction="column" className={`radio-group ${className}`}>
			{label && (
				<Flex alignItems="center" gap="0.5rem" className="radio-group__label-container">
					<Content type="text" items={[{ text: label }]} />
				</Flex>
			)}
			<RadioGroupField name={name} defaultValue={defaultValue} value={value} onChange={handleChange} legend="">
				{options.map(option => (
					<Flex alignItems="center" key={option.value} className="radio-option">
						<Radio className="custom-radio" value={option.value} isDisabled={disabled || option.disabled}>
							{option.label}
						</Radio>
						{option.tooltipText && (
							<>
								<IconInfo data-tooltip-id={`radio-option-${name}-${option.value}`} className="radio-group__info-icon" />
								<Tooltip id={`radio-option-${name}-${option.value}`} className="react-tooltip" place="right">
									{option.tooltipText}
								</Tooltip>
							</>
						)}
					</Flex>
				))}
			</RadioGroupField>
		</Flex>
	);
};

export default RadioButtonGroup;
