import React from "react";

import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { Button, Divider, Flex, TextAreaField, TextField } from "@aws-amplify/ui-react";

import { Accordion } from "../../atoms/Accordion";
import { Content } from "../../atoms/Content";
import { Dropdown, DropdownOption } from "../../atoms/Dropdown/Dropdown";
import { RadioButtonGroup } from "../../atoms/RadioButton/RadioButton";
import { Slider } from "../../atoms/Slider/Slider";
import AddressInput from "../AddressInput";
import { AutoCompleteLatLonInput } from "../AutoCompleteLatLonInput";
import CheckboxGroup from "../CheckboxGroup";
import MultiSelectDropdown from "../MultiSelectDropdown";
import { SliderWithInput } from "../SliderWithInput/SliderWithInput";

import "./style.scss";

// Base field interface
interface BaseField {
	name: string;
	label: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	placeholder?: string;
	className?: string;
}

// Text field specific interface
interface TextFieldConfig extends BaseField {
	type: "text";
	defaultValue?: string;
	value?: string;
}

// Number field specific interface
interface NumberFieldConfig extends BaseField {
	type: "number";
	defaultValue?: number;
	value?: number;
	min?: number;
	max?: number;
}

// Textarea field specific interface
interface TextareaFieldConfig extends BaseField {
	type: "textarea";
	defaultValue?: string;
	value?: string;
}

// Slider field specific interface
interface SliderFieldConfig extends BaseField {
	type: "slider";
	defaultValue?: number;
	value?: number;
	min: number;
	max: number;
	step?: number;
}

// Radio field specific interface
interface RadioFieldConfig extends BaseField {
	type: "radio";
	defaultValue?: string;
	value?: string;
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
		tooltipText?: string;
	}>;
}

// Dropdown field specific interface
interface DropdownFieldConfig extends BaseField {
	type: "dropdown";
	defaultValue?: string;
	value?: string;
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
	}>;
}

// Checkbox field specific interface
interface CheckboxFieldConfig extends BaseField {
	type: "checkbox";
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
	}>;
	values: string[];
}

// Address field specific interface
interface AddressFieldConfig extends BaseField {
	type: "address";
}

// SliderWithInput field specific interface
interface SliderWithInputFieldConfig extends BaseField {
	type: "sliderWithInput";
	defaultValue?: number;
	value?: number;
	min: number;
	max: number;
	step?: number;
	onToggle?: (enabled: boolean) => void;
}

// MultiSelect field specific interface
interface MultiSelectFieldConfig extends BaseField {
	type: "multiSelect";
	defaultValue?: string[];
	value?: string[];
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
	}>;
	minSelected?: number;
	maxSelected?: number;
}

// LatLonInput field specific interface
interface LatLonInputFieldConfig extends BaseField {
	type: "latLonInput";
	defaultValue?: string;
}

// Union type for all field configurations
export type FormField =
	| TextFieldConfig
	| NumberFieldConfig
	| TextareaFieldConfig
	| SliderFieldConfig
	| RadioFieldConfig
	| DropdownFieldConfig
	| CheckboxFieldConfig
	| AddressFieldConfig
	| SliderWithInputFieldConfig
	| MultiSelectFieldConfig
	| LatLonInputFieldConfig;

interface FormRenderProps {
	fields: FormField[];
	onSubmit?: (formData: Record<string, unknown>) => void;
	onChange?: (props: { name: string; value: unknown }) => void;
	className?: string;
	submitButtonText?: string;
	content?: ContentProps;
}

export const FormRender: React.FC<FormRenderProps> = ({
	fields,
	onSubmit,
	onChange,
	className = "",
	submitButtonText = "Submit",
	content
}) => {
	const handleChange = (name: string, value: unknown) => {
		onChange?.({
			name,
			value
		});
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const data: Record<string, unknown> = {};

		fields.forEach(field => {
			const value = formData.get(field.name);
			if (value !== null) {
				data[field.name] = value;
			}
		});

		onSubmit?.(data);
	};

	const renderField = (field: FormField) => {
		const commonProps = {
			key: field.name,
			name: field.name,
			label: field.label,
			isRequired: field.required,
			isDisabled: field.disabled,
			hasError: !!field.error,
			errorMessage: field.error,
			className: field.className
		};

		switch (field.type) {
			case "text":
				return (
					<TextField
						{...commonProps}
						placeholder={field.placeholder}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={e => handleChange(field.name, e.target.value)}
					/>
				);

			case "number":
				return (
					<TextField
						{...commonProps}
						type="number"
						placeholder={field.placeholder}
						defaultValue={field.defaultValue}
						value={field.value}
						min={field.min}
						max={field.max}
						className="text-input"
						onChange={e => handleChange(field.name, Number(e.target.value))}
					/>
				);

			case "textarea":
				return (
					<TextAreaField
						{...commonProps}
						placeholder={field.placeholder}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={e => handleChange(field.name, e.target.value)}
					/>
				);

			case "slider":
				return (
					<Slider
						{...commonProps}
						min={field.min}
						max={field.max}
						step={field.step}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={value => handleChange(field.name, value)}
					/>
				);

			case "radio":
				return (
					<RadioButtonGroup
						{...commonProps}
						options={field.options}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={value => handleChange(field.name, value)}
					/>
				);

			case "dropdown":
				return (
					<Dropdown
						{...commonProps}
						options={field.options as DropdownOption<string>[]}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={value => handleChange(field.name, value)}
					/>
				);

			case "checkbox":
				return (
					<CheckboxGroup
						{...commonProps}
						title={field.label}
						options={field.options}
						values={field.values}
						onChange={(values: string[]) => handleChange(field.name, values)}
					/>
				);

			case "address":
				return (
					<AddressInput
						{...commonProps}
						placeholder={field.placeholder}
						onChange={value => handleChange(field.name, value)}
					/>
				);

			case "sliderWithInput":
				return (
					<SliderWithInput
						{...commonProps}
						min={field.min}
						max={field.max}
						step={field.step}
						defaultValue={field.defaultValue}
						value={field.value}
						onChange={value => handleChange(field.name, value)}
						onToggle={field.onToggle}
					/>
				);

			case "multiSelect":
				return (
					<MultiSelectDropdown
						{...commonProps}
						options={field.options as DropdownOption<string>[]}
						defaultValue={field.defaultValue}
						value={field.value}
						minSelected={field.minSelected}
						maxSelected={field.maxSelected}
						onChange={(values: string[]) => handleChange(field.name, values)}
					/>
				);

			case "latLonInput":
				return (
					<AutoCompleteLatLonInput
						{...commonProps}
						placeholder={field.placeholder}
						onChange={value => handleChange(field.name, value)}
						defaultValue={field.defaultValue}
					/>
				);

			default:
				return null;
		}
	};

	// Split fields into required and optional
	const requiredFields = fields.filter(field => field.required);
	const optionalFields = fields.filter(field => !field.required);

	return (
		<Accordion title="Customize Request">
			<form onSubmit={handleSubmit} className={`form-render ${className}`}>
				<Flex direction="column" padding="1rem" gap="1rem">
					{content && <Content {...content} />}
					{requiredFields.map(renderField)}
				</Flex>

				{optionalFields.length > 0 && (
					<Flex direction={"column"} gap={0}>
						<Divider />
						<Accordion shadowEnabled={false} title="Optional Parameters">
							<Flex direction="column" padding="1rem" gap="1rem">
								{optionalFields.map(renderField)}
							</Flex>
						</Accordion>
					</Flex>
				)}

				{onSubmit && <Button type="submit">{submitButtonText}</Button>}
			</form>
		</Accordion>
	);
};
