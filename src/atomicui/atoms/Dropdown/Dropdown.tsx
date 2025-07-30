/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React from "react";

import { IconChevronDown } from "@api-playground/assets/svgs";
import { Flex, SelectField } from "@aws-amplify/ui-react";
import "./styles.scss";

export interface DropdownOption<T extends string> {
	label: string;
	value: T;
	disabled?: boolean;
}

export interface DropdownConfig<T extends string> {
	name: string;
	label?: string;
	placeholder?: string;
	options: ReadonlyArray<DropdownOption<T>>;
	defaultValue?: T;
	disabled?: boolean;
	required?: boolean;
	className?: string;
}

export interface DropdownProps<T extends string> extends DropdownConfig<T> {
	value?: T;
	onChange?: (value: T) => void;
	error?: string;
}

export const Dropdown = <T extends string>({
	name,
	label,
	placeholder,
	options,
	defaultValue,
	value,
	onChange,
	disabled = false,
	required = false,
	error,
	className = ""
}: DropdownProps<T>): React.ReactElement => {
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange?.(e.target.value as T);
	};

	if (defaultValue && !options.some(opt => opt.value === defaultValue)) {
		throw new Error(
			`Invalid defaultValue "${defaultValue}". Must be one of: ${options.map(opt => `"${opt.value}"`).join(", ")}`
		);
	}

	return (
		<Flex direction="column" className={`dropdown ${className}`}>
			<SelectField
				className="dropdown__select"
				name={name}
				label={label}
				placeholder={placeholder}
				defaultValue={defaultValue}
				value={value}
				onChange={handleChange}
				isDisabled={disabled}
				required={required}
				hasError={!!error}
				errorMessage={error}
				icon={<IconChevronDown />}
			>
				{options.map(option => (
					<option key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</option>
				))}
			</SelectField>
		</Flex>
	);
};

export const createDropdown = <T extends string>(config: DropdownConfig<T>) => {
	return (props: Omit<DropdownProps<T>, keyof DropdownConfig<T>>) => <Dropdown<T> {...config} {...props} />;
};

export default Dropdown;
