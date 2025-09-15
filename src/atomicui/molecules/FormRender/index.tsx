/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useCallback, useMemo, useRef, useState } from "react";

import { IconChevronDown, IconChevronUp, IconReloadLined } from "@api-playground/assets/svgs";
import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { Button, Divider, Flex, TextAreaField, TextField, View } from "@aws-amplify/ui-react";
import { Field, Form } from "react-final-form";
import type { FieldRenderProps } from "react-final-form";

import { Accordion } from "../../atoms/Accordion";
import { Content } from "../../atoms/Content";
import { Dropdown, DropdownOption } from "../../atoms/Dropdown/Dropdown";
import { RadioButtonGroup } from "../../atoms/RadioButton/RadioButton";
import { Slider } from "../../atoms/Slider/Slider";
import AddressInput, { AddressInputRef } from "../AddressInput";
import { AutoCompleteLatLonInput } from "../AutoCompleteLatLonInput";
import CheckboxGroup from "../CheckboxGroup";
import { CoordinateInput } from "../CoordinateInput";
import LngLatInput from "../LngLatInput/LngLatInput";
import MultiSelectDropdown from "../MultiSelectDropdown";
import { SliderWithInput } from "../SliderWithInput/SliderWithInput";

import "./style.scss";

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

interface TextFieldConfig extends BaseField {
	type: "text";
	defaultValue?: string;
	value?: string;
	inputType?: "text" | "password";
}

interface NumberFieldConfig extends BaseField {
	type: "number";
	defaultValue?: number;
	value?: number;
	min?: number;
	max?: number;
}

interface TextareaFieldConfig extends BaseField {
	type: "textarea";
	defaultValue?: string;
	value?: string;
}

interface SliderFieldConfig extends BaseField {
	type: "slider";
	defaultValue?: number;
	value?: number;
	min: number;
	max: number;
	step?: number;
}

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

interface CheckboxFieldConfig extends BaseField {
	type: "checkbox";
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
	}>;
	values: string[];
}

interface AddressFieldConfig extends BaseField {
	type: "address";
	value: string;
}

interface SliderWithInputFieldConfig extends BaseField {
	type: "sliderWithInput";
	defaultValue?: number;
	value?: number;
	min: number;
	max: number;
	step?: number;
	allowClear?: boolean;
	showToggle?: boolean;
	onToggle?: (enabled: boolean) => void;
}

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

interface LatLonInputFieldConfig extends BaseField {
	type: "latLonInput";
	defaultValue?: string;
}

interface LngLatInputFieldConfig extends BaseField {
	type: "lngLatInput";
	defaultValue?: number[];
	value?: number[];
}

interface CoordinateInputFieldConfig extends BaseField {
	type: "coordinateInput";
	defaultValue?: number[];
	value?: number[];
}

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
	| LngLatInputFieldConfig
	| CoordinateInputFieldConfig;

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
	mapContainerHeight?: number;
	headerContent?: React.ReactNode;
	promotedFields?: string[];
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
	mapContainerHeight,
	headerContent,
	promotedFields
}) => {
	const addressRefs = useRef<Map<string, AddressInputRef>>(new Map());
	const requiredFeildsContainerRef = useRef<HTMLDivElement>(null);
	const optionalFieldsContainerRef = useRef<HTMLDivElement>(null);
	const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
	const [requiredFieldsHeight, setRequiredFieldsHeight] = useState<number>(370);

	const handleChange = (name: string, value: unknown) => {
		onChange?.({
			name,
			value
		});
	};

	const handleToggle = (fieldName: string, enabled: boolean) => {
		onToggle?.(fieldName, enabled);
	};

	const checkIfOverflowing = () => {
		if (optionalFieldsContainerRef.current) {
			const element = optionalFieldsContainerRef.current;
			const isScrollable = element.scrollHeight > element.clientHeight;
			setIsOverflowing(isScrollable);
		}
	};

	React.useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;

		const setupResizeObserver = () => {
			if (!requiredFeildsContainerRef.current) return;

			setRequiredFieldsHeight(requiredFeildsContainerRef.current.clientHeight);

			resizeObserver = new ResizeObserver(entries => {
				for (const entry of entries) {
					setRequiredFieldsHeight(entry.contentRect.height);
					setTimeout(checkIfOverflowing, 0);
				}
			});

			resizeObserver.observe(requiredFeildsContainerRef.current);
		};

		setupResizeObserver();

		if (!requiredFeildsContainerRef.current) {
			const timer = setTimeout(() => {
				setupResizeObserver();
			}, 100);

			return () => {
				clearTimeout(timer);
				if (resizeObserver) {
					resizeObserver.disconnect();
				}
			};
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, []);

	const initialValues = useMemo(() => {
		const acc: Record<string, unknown> = {};
		fields.forEach(field => {
			switch (field.type) {
				case "checkbox":
					acc[field.name] = field.values ?? [];
					break;
				case "multiSelect":
					acc[field.name] = field.value ?? field.defaultValue ?? [];
					break;
				case "lngLatInput":
				case "coordinateInput":
					acc[field.name] = field.value ?? [];
					break;
				case "latLonInput":
					acc[field.name] = field.defaultValue ?? "";
					break;
				case "number":
					acc[field.name] = field.value ?? field.defaultValue ?? field.min ?? 0;
					break;
				case "slider":
					acc[field.name] = field.value ?? field.defaultValue ?? field.min;
					break;
				case "sliderWithInput":
					acc[field.name] = field.value ?? field.defaultValue ?? field.min;
					break;
				case "radio":
				case "dropdown":
				case "textarea":
				case "text":
					acc[field.name] = field.value ?? field.defaultValue ?? "";
					break;
				case "address":
					acc[field.name] = field.value ?? "";
					break;
			}
		});
		return acc;
	}, [fields]);

	const validate = useCallback(
		(values: Record<string, unknown>) => {
			const errors: Record<string, string> = {};
			fields.forEach(field => {
				const value = values[field.name];
				if (field.required) {
					if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
						errors[field.name] = `${field.label} is required`;
					}
				}

				if (
					(field.type === "number" || field.type === "slider" || field.type === "sliderWithInput") &&
					typeof value === "number"
				) {
					if (field.min !== undefined && value < field.min) {
						errors[field.name] = `${field.label} must be ≥ ${field.min}`;
					}
					if (field.max !== undefined && value > field.max) {
						errors[field.name] = `${field.label} must be ≤ ${field.max}`;
					}
				}

				if (field.type === "multiSelect") {
					const arr = (value as unknown[]) || [];
					if (field.minSelected !== undefined && arr.length < field.minSelected) {
						errors[field.name] = `Select at least ${field.minSelected}`;
					}
					if (field.maxSelected !== undefined && arr.length > field.maxSelected) {
						errors[field.name] = `Select at most ${field.maxSelected}`;
					}
				}

				if ((field.type === "lngLatInput" || field.type === "coordinateInput") && field.required) {
					const arr = (value as number[]) || [];
					if (arr.length !== 2 || arr.some(v => v === undefined || v === null || Number.isNaN(v))) {
						errors[field.name] = `${field.label} must have latitude and longitude`;
					}
				}
			});
			return errors;
		},
		[fields]
	);

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
					<Field<string> name={field.name} subscription={{ value: true }}>
						{({ input, meta }: FieldRenderProps<string, HTMLInputElement>) => (
							<TextField
								{...commonProps}
								placeholder={field.placeholder}
								value={(input.value as string) ?? ""}
								onChange={e => {
									const v = (e.target as HTMLInputElement).value;
									input.onChange(v);
									handleChange(field.name, v);
								}}
								type={field.inputType || "text"}
								autoComplete={field.inputType === "password" ? "new-password" : "off"}
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
								hasError={!!(meta.touched && meta.error) || commonProps.hasError}
								errorMessage={(meta.touched && meta.error) || commonProps.errorMessage}
							/>
						)}
					</Field>
				);

			case "number":
				return (
					<Field<number> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number, HTMLInputElement>) => (
							<TextField
								{...commonProps}
								type="number"
								placeholder={field.placeholder}
								value={(input.value as number | string | undefined) ?? ""}
								min={field.min}
								max={field.max}
								className="text-input"
								onChange={e => {
									const num = Number((e.target as HTMLInputElement).value);
									input.onChange(num);
									handleChange(field.name, num);
								}}
							/>
						)}
					</Field>
				);

			case "textarea":
				return (
					<Field<string> name={field.name} subscription={{ value: true }}>
						{({ input, meta }: FieldRenderProps<string, HTMLTextAreaElement>) => (
							<TextAreaField
								{...commonProps}
								placeholder={field.placeholder}
								value={(input.value as string) ?? ""}
								onChange={e => {
									const v = (e.target as HTMLTextAreaElement).value;
									input.onChange(v);
									handleChange(field.name, v);
								}}
								hasError={!!(meta.touched && meta.error) || commonProps.hasError}
								errorMessage={(meta.touched && meta.error) || commonProps.errorMessage}
							/>
						)}
					</Field>
				);

			case "slider":
				return (
					<Field<number> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number>) => (
							<Slider
								{...commonProps}
								min={field.min}
								max={field.max}
								step={field.step}
								value={input.value as number | undefined}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
							/>
						)}
					</Field>
				);

			case "radio":
				return (
					<Field<string> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<string>) => (
							<RadioButtonGroup
								{...commonProps}
								options={field.options}
								value={(input.value as string) ?? ""}
								disabled={field.disabled}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
							/>
						)}
					</Field>
				);

			case "dropdown":
				return (
					<Field<string> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<string>) => (
							<Dropdown
								{...commonProps}
								options={field.options as DropdownOption<string>[]}
								value={(input.value as string) ?? ""}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
							/>
						)}
					</Field>
				);

			case "checkbox":
				return (
					<Field<string[]> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<string[]>) => (
							<CheckboxGroup
								{...commonProps}
								title={field.label}
								options={field.options}
								values={(input.value as string[]) ?? []}
								onChange={(values: string[]) => {
									input.onChange(values);
									handleChange(field.name, values);
								}}
							/>
						)}
					</Field>
				);

			case "address":
				return (
					<Field<string> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<string>) => (
							<AddressInput
								{...commonProps}
								placeholder={field.placeholder}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
								initialValue={(input.value as string) ?? ""}
								ref={ref => {
									if (ref) {
										addressRefs.current.set(field.name, ref);
									} else {
										addressRefs.current.delete(field.name);
									}
								}}
							/>
						)}
					</Field>
				);

			case "sliderWithInput":
				return (
					<Field<number> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number>) => (
							<SliderWithInput
								{...commonProps}
								min={field.min}
								max={field.max}
								step={field.step}
								value={input.value as number | undefined}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
								isDisabled={field.disabled}
								allowClear={field.allowClear}
								showToggle={field.showToggle}
								onToggle={value => handleToggle(field.name, value)}
							/>
						)}
					</Field>
				);

			case "multiSelect":
				return (
					<Field<string[]> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<string[]>) => (
							<MultiSelectDropdown
								{...commonProps}
								options={field.options as DropdownOption<string>[]}
								value={(input.value as string[] | undefined) ?? []}
								minSelected={field.minSelected}
								maxSelected={field.maxSelected}
								onChange={(values: string[]) => {
									input.onChange(values);
									handleChange(field.name, values);
								}}
							/>
						)}
					</Field>
				);

			case "latLonInput":
				return (
					<Field<number[]> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number[]>) => (
							<AutoCompleteLatLonInput
								{...commonProps}
								placeholder={field.placeholder}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
									defaultValue={typeof field.defaultValue === "string" ? field.defaultValue : ""}
							/>
						)}
					</Field>
				);

			case "lngLatInput":
				return (
					<Field<number[]> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number[]>) => (
							<LngLatInput
								{...commonProps}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
								value={(input.value as number[] | undefined) ?? []}
								name={field.name}
								isDisabled={field.disabled}
							/>
						)}
					</Field>
				);

			case "coordinateInput":
				return (
					<Field<number[]> name={field.name} subscription={{ value: true }}>
						{({ input }: FieldRenderProps<number[]>) => (
							<CoordinateInput
								{...commonProps}
								onChange={value => {
									input.onChange(value);
									handleChange(field.name, value);
								}}
								value={(input.value as number[] | undefined) ?? []}
								name={field.name}
								isDisabled={field.disabled}
								placeholder={field.placeholder}
							/>
						)}
					</Field>
				);

			default:
				return null;
		}
	};

	const requiredFields = fields.filter(field => field.required && !field.hiddenFromUI);
	const allOptionalFields = fields.filter(field => !field.required && !field.hiddenFromUI);

	const promotedNames = new Set(promotedFields || []);
	const promotedOptionalFields = allOptionalFields.filter(f => promotedNames.has(f.name));
	const optionalFields = allOptionalFields.filter(f => !promotedNames.has(f.name));

	React.useEffect(() => {
		const timer = setTimeout(checkIfOverflowing, 100);
		return () => clearTimeout(timer);
	}, [optionalFields.length, mapContainerHeight, requiredFieldsHeight]);

	const computeResetValues = (): Record<string, unknown> => {
		const resetValues: Record<string, unknown> = {};
		fields.forEach(field => {
			if (field.disabled) return;
			switch (field.type) {
				case "address":
					resetValues[field.name] = "";
					break;
				case "multiSelect":
					resetValues[field.name] = [];
					break;
				case "text":
					resetValues[field.name] = field.defaultValue ?? "";
					break;
				case "checkbox":
					resetValues[field.name] = [];
					break;
				case "number":
				case "slider":
				case "sliderWithInput":
					resetValues[field.name] = field.min ?? 0;
					break;
				case "lngLatInput":
				case "coordinateInput":
					resetValues[field.name] = [];
					break;
				case "radio":
				case "dropdown":
					resetValues[field.name] = "";
					break;
				case "textarea":
				case "latLonInput":
					resetValues[field.name] = "";
					break;
			}
		});
		return resetValues;
	};

	return (
		<Accordion
			title={<View className="accordion-title">Customize Request</View>}
			defaultOpen={true}
			contentClassName="form-render-accordion"
		>
			<Form onSubmit={() => onSubmit?.()} initialValues={initialValues} keepDirtyOnReinitialize validate={validate}>
				{({ handleSubmit, form }) => (
					<form
						onSubmit={handleSubmit}
						className={`form-render ${className}`}
						style={{
							maxHeight: mapContainerHeight ? mapContainerHeight - 120 : "none",
							overflow: "auto"
						}}
					>
						<Flex direction="column" padding="1rem" paddingTop={0} gap="1rem" ref={requiredFeildsContainerRef}>
							{content && <Content {...content} />}
							{headerContent}
							{requiredFields.map(renderField)}
							{promotedOptionalFields.map(renderField)}

							<Flex gap="1rem">
								<Button
									borderColor="rgba(0, 130, 150, 1)"
									borderWidth={1}
									size="small"
									onClick={e => {
										e.preventDefault();
										const resetValues = computeResetValues();
										fields.forEach(field => {
											if (field.disabled) return;
											const v = resetValues[field.name];
											if (field.type === "address") {
												const addressRef = addressRefs.current.get(field.name);
												if (addressRef) addressRef.clear();
											}
											handleChange(field.name, v);
										});
										form.reset(resetValues);
										onReset?.();
									}}
								>
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
									contentClassName={`optional-items ${isOverflowing ? "" : "no-scroll-bar"}`}
									openIcon={<IconChevronUp className="chevron-up-icon" />}
									closeIcon={<IconChevronDown className="chevron-down-icon" />}
								>
									<Flex ref={optionalFieldsContainerRef} direction="column" padding="1rem" paddingTop={0} gap="1rem">
										{optionalFields.map(renderField)}
										<Divider style={{ visibility: "hidden" }} />
									</Flex>
								</Accordion>
							</Flex>
						)}
					</form>
				)}
			</Form>
		</Accordion>
	);
};
