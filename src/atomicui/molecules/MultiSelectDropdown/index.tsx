import React, { useEffect, useState } from "react";

import { IconChevronDown } from "@api-playground/assets/svgs";
import { Button, Flex, SelectField } from "@aws-amplify/ui-react";

import { DropdownOption } from "../../atoms/Dropdown/Dropdown";
import "./styles.scss";

interface Props<T extends string> {
	name: string;
	label?: string;
	placeholder?: string;
	options: ReadonlyArray<DropdownOption<T>>;
	defaultValue?: T[];
	value?: T[];
	onChange?: (value: T[]) => void;
	disabled?: boolean;
	required?: boolean;
	error?: string;
	minSelected?: number;
	maxSelected?: number;
}

export default function MultiSelectDropdown<T extends string>({
	name,
	label,
	placeholder,
	options,
	defaultValue,
	value,
	onChange,
	disabled = false,
	required = false,
	error: propError,
	minSelected,
	maxSelected
}: Props<T>) {
	const [selected, setSelected] = useState<T[]>(value || defaultValue || []);
	const [error, setError] = useState<string | undefined>(propError);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (value !== undefined) setSelected(value);
	}, [value]);

	const handleRemove = (valueToRemove: T) => {
		const newSelected = selected.filter(v => v !== valueToRemove);
		setSelected(newSelected);
		onChange?.(newSelected);
	};

	const getOptionLabel = (value: T) => {
		return options.find(opt => opt.value === value)?.label || value;
	};

	useEffect(() => {
		if (required && selected.length === 0) setError("This field is required");
		else if (minSelected && selected.length < minSelected) setError(`Select at least ${minSelected}`);
		else if (maxSelected && selected.length > maxSelected) setError(`Select at most ${maxSelected}`);
		else setError(propError);
	}, [selected, required, minSelected, maxSelected, propError]);

	return (
		<Flex direction="column" gap="0.5rem" className="dropdown">
			<SelectField
				name={name}
				label={label}
				placeholder={placeholder || "Select..."}
				value={isOpen ? "" : undefined}
				onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
					const selectedValue = e.target.value as T;
					if (!selected.includes(selectedValue)) {
						const newSelected = [...selected, selectedValue];
						setSelected(newSelected);
						onChange?.(newSelected);
					}
					setIsOpen(false);
				}}
				isDisabled={disabled}
				required={required}
				hasError={!!error}
				errorMessage={error}
				icon={<IconChevronDown />}
				onFocus={() => setIsOpen(true)}
			>
				<option value="" disabled>
					{placeholder || "Select..."}
				</option>
				{options
					.filter(option => !selected.includes(option.value))
					.map(option => (
						<option key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</option>
					))}
			</SelectField>

			{selected.length > 0 && (
				<Flex direction="row" gap="0.5rem" wrap="wrap">
					{selected.map(value => (
						<Button
							key={value}
							size="small"
							variation="primary"
							isDisabled={disabled}
							onClick={() => handleRemove(value)}
						>
							{getOptionLabel(value)} ✕
						</Button>
					))}
				</Flex>
			)}
		</Flex>
	);
}
