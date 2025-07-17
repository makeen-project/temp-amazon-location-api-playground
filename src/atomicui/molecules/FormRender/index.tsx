import React, { useRef } from "react";

import { IconReloadLined } from "@api-playground/assets/svgs";
import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { Button, Divider, Flex, TextAreaField, TextField, View } from "@aws-amplify/ui-react";

import { Accordion } from "../../atoms/Accordion";
import { Content } from "../../atoms/Content";
import { Dropdown, DropdownOption } from "../../atoms/Dropdown/Dropdown";
import { RadioButtonGroup } from "../../atoms/RadioButton/RadioButton";
import { Slider } from "../../atoms/Slider/Slider";
import AddressInput, { AddressInputRef } from "../AddressInput";
import { AutoCompleteLatLonInput } from "../AutoCompleteLatLonInput";
import CheckboxGroup from "../CheckboxGroup";
import LngLatInput from "../LngLatInput/LngLatInput";
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
	onToggle?: (enabled: boolean) => void;
	hiddenFromUI?: boolean;
}

// Text field specific interface
interface TextFieldConfig extends BaseField {
	type: "text";
	defaultValue?: string;
	value?: string;
	inputType?: "text" | "password";
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
	value: string;
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

// LngLatInput field specific interface
interface LngLatInputFieldConfig extends BaseField {
	type: "lngLatInput";
	defaultValue?: number[];
	value?: number[];
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
	| LatLonInputFieldConfig
	| LngLatInputFieldConfig;

interface FormRenderProps {
	fields: FormField[];
	onSubmit?: () => void;
	onChange?: (props: { name: string; value: unknown }) => void;
	className?: string;
	submitButtonText?: string;
	content?: ContentProps;
	submitButtonDisabled?: boolean;
	onReset?: () => void;
	onToggle?: (fieldName: string, enabled: boolean) => void;
	containerHeight?: number;
}

export const FormRender: React.FC<FormRenderProps> = ({
	fields,
	onSubmit,
	onChange,
	className = "",
	submitButtonText = "Submit",
	content,
	submitButtonDisabled = false,
	onReset,
	onToggle,
	containerHeight
}) => {
	// Create a map to store refs for address input fields
	const addressRefs = useRef<Map<string, AddressInputRef>>(new Map());

	const handleChange = (name: string, value: unknown) => {
		onChange?.({
			name,
			value
		});
	};

	const handleToggle = (fieldName: string, enabled: boolean) => {
		onToggle?.(fieldName, enabled);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit?.();
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
						type={field.inputType || "text"}
						autoComplete={field.inputType === "password" ? "new-password" : "off"}
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck="false"
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
						disabled={field.disabled}
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
						ref={ref => {
							if (ref) {
								addressRefs.current.set(field.name, ref);
							} else {
								addressRefs.current.delete(field.name);
							}
						}}
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
						onToggle={enabled => handleToggle(field.name, enabled)}
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

			case "lngLatInput":
				return (
					<LngLatInput
						{...commonProps}
						defaultValue={field.value}
						onChange={value => handleChange(field.name, value)}
						value={field.value}
						name={field.name}
						isDisabled={field.disabled}
					/>
				);

			default:
				return null;
		}
	};

	// Split fields into required and optional
	const requiredFields = fields.filter(field => field.required && !field.hiddenFromUI);
	const optionalFields = fields.filter(field => !field.required && !field.hiddenFromUI);

	const handleReset = (event?: React.MouseEvent) => {
		if (event) {
			event.preventDefault();
		}

		fields.forEach(field => {
			if (field.disabled) return;

			switch (field.type) {
				case "address":
					// Use the ref to clear the address input
					const addressRef = addressRefs.current.get(field.name);
					if (addressRef) {
						addressRef.clear();
					} else {
						// Fallback to handleChange if ref is not available
						handleChange(field.name, undefined);
					}
					break;
				case "multiSelect":
					handleChange(field.name, undefined);
					break;
				case "text":
					handleChange(field.name, field.defaultValue);
					break;
				case "checkbox":
					handleChange(field.name, []);
					break;
				case "number":
				case "slider":
				case "sliderWithInput":
					handleChange(field.name, field.min || 0);
					break;
				case "lngLatInput":
					handleChange(field.name, []);
					break;
				case "radio":
				case "dropdown":
					handleChange(field.name, "");
					break;
				case "text":
				case "textarea":
				case "address":
				case "latLonInput":
					handleChange(field.name, "");
					break;
			}
		});

		// Call the onReset callback if provided to handle NUQS state reset
		onReset?.();
	};

	return (
		<Accordion
			title={<View className="accordion-title">Customize Request</View>}
			defaultOpen={true}
			contentClassName="form-render-accordion"
		>
			<form onSubmit={handleSubmit} className={`form-render ${className}`}>
				<Flex direction="column" padding="1rem" paddingTop={0} gap="1rem">
					{content && <Content {...content} />}
					{requiredFields.map(renderField)}

					<Flex gap="1rem">
						<Button borderColor="rgba(0, 130, 150, 1)" borderWidth={1} size="small" onClick={handleReset}>
							<IconReloadLined
								width={20}
								height={20}
								style={{ stroke: "rgba(0, 130, 150, 1)", strokeWidth: 1 }}
								color="rgba(0, 130, 150, 1)"
							/>
						</Button>
						{onSubmit && (
							<Button
								width={"100%"}
								className="submit-button"
								type="submit"
								variation="primary"
								isDisabled={submitButtonDisabled}
							>
								{submitButtonText}
							</Button>
						)}
					</Flex>
				</Flex>

				{optionalFields.length > 0 && (
					<Flex direction={"column"} flex={1} gap={0}>
						<Divider />
						<Accordion
							shadowEnabled={false}
							defaultOpen={true}
							title="Optional Parameters"
							contentClassName="optional-items"
						>
							<Flex direction="column" padding="1rem" paddingTop={0} gap="1rem">
								{optionalFields.map(renderField)}
							</Flex>
						</Accordion>
					</Flex>
				)}
			</form>
		</Accordion>
	);
};
