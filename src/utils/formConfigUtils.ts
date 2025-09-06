/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { FormField } from "@api-playground/atomicui/molecules/FormRender";
import { CodeSnippetConfig, FormContentConfig, FormFieldConfig } from "@api-playground/types/ApiPlaygroundTypes";

const parseValue = (value: any, type: string, defaultValue: any = undefined): any => {
	if (value === undefined || value === null) {
		return defaultValue;
	}

	try {
		switch (type) {
			case "number":
				return typeof value === "number" ? value : Number(value);
			case "array":
				return Array.isArray(value) ? value : [];
			case "boolean":
				return typeof value === "boolean" ? value : value === "true";
			case "string":
				return String(value);
			default:
				return value;
		}
	} catch {
		return defaultValue;
	}
};

export const convertFormFieldConfigToFormField = (
	fieldConfig: FormFieldConfig,
	urlState: Record<string, any> = {}
): FormField => {
	const baseField = {
		name: fieldConfig.name,
		label: fieldConfig.label,
		required: fieldConfig.required,
		disabled: fieldConfig.disabled,
		placeholder: fieldConfig.placeholder,
		className: fieldConfig.className,
		hiddenFromUI: fieldConfig.hiddenFromUI
	};

	const rawValue = urlState?.[fieldConfig.name] !== undefined ? urlState[fieldConfig.name] : fieldConfig.value;

	switch (fieldConfig.type) {
		case "text":
			return {
				...baseField,
				type: "text" as const,
				value: parseValue(rawValue, "string", ""),
				inputType: fieldConfig.inputType
			};

		case "number":
			return {
				...baseField,
				type: "number" as const,
				value: parseValue(rawValue, "number", 0),
				min: fieldConfig.min,
				max: fieldConfig.max
			};

		case "textarea":
			return {
				...baseField,
				type: "textarea" as const,
				value: parseValue(rawValue, "string", "")
			};

		case "address":
			return {
				...baseField,
				type: "address" as const,
				value: parseValue(rawValue, "string", "")
			};

		case "autocompleteAddress":
			return {
				...baseField,
				type: "autocompleteAddress" as const,
				value: parseValue(rawValue, "string", "")
			};

		case "latLonInput":
			return {
				...baseField,
				type: "latLonInput" as const,
				defaultValue: parseValue(rawValue, "string", "")
			};

		case "slider":
			return {
				...baseField,
				type: "slider" as const,
				value: parseValue(rawValue, "number", fieldConfig.defaultValue ?? fieldConfig.min),
				min: fieldConfig.min!,
				max: fieldConfig.max!,
				step: fieldConfig.step
			};

		case "sliderWithInput":
			return {
				...baseField,
				type: "sliderWithInput" as const,
				value: parseValue(rawValue, "number", fieldConfig.defaultValue ?? undefined),
				min: fieldConfig.min!,
				max: fieldConfig.max!,
				step: fieldConfig.step,
				disabled: fieldConfig.disabled,
				defaultValue: fieldConfig.defaultValue as any,
				allowClear: fieldConfig.allowClear,
				onToggle: fieldConfig.onToggle,
				showToggle: fieldConfig.showToggle
			};

		case "radio":
			return {
				...baseField,
				type: "radio" as const,
				value: parseValue(rawValue, "string", ""),
				options: (fieldConfig.options || []).map(opt => ({
					label: opt.label,
					value: String(opt.value),
					disabled: opt.disabled,
					tooltipText: opt.tooltipText
				}))
			};

		case "dropdown":
			return {
				...baseField,
				type: "dropdown" as const,
				value: parseValue(rawValue, "string", fieldConfig.defaultValue || ""),
				defaultValue: String(fieldConfig.defaultValue || ""),
				options: (fieldConfig.options || []).map(opt => ({
					label: opt.label,
					value: String(opt.value),
					disabled: opt.disabled
				}))
			};

		case "multiSelect":
			return {
				...baseField,
				type: "multiSelect" as const,
				value: parseValue(rawValue, "array", []),
				options: (fieldConfig.options || []).map(opt => ({
					label: opt.label,
					value: String(opt.value),
					disabled: opt.disabled
				})),
				minSelected: fieldConfig.minSelected,
				maxSelected: fieldConfig.maxSelected
			};

		case "checkbox":
			return {
				...baseField,
				type: "checkbox" as const,
				options: (fieldConfig.options || []).map(opt => ({
					label: opt.label,
					value: String(opt.value),
					disabled: opt.disabled
				})),
				values: parseValue(rawValue, "array", [])
			};

		case "lngLatInput":
			return {
				...baseField,
				type: "lngLatInput" as const,
				value: parseValue(rawValue, "array", [])
			};

		case "coordinateInput":
			return {
				...baseField,
				type: "coordinateInput" as const,
				value: parseValue(rawValue, "array", [])
			};

		case "boundingBox":
			return {
				...baseField,
				type: "boundingBox" as const,
				value: parseValue(rawValue, "array", [])
			};

		default:
			return {
				...baseField,
				type: "text" as const,
				value: parseValue(rawValue, "string", "")
			};
	}
};

export const convertFormContentConfigToContentProps = (contentConfig: FormContentConfig): ContentProps => {
	return {
		type: contentConfig.type,
		items: contentConfig.items || []
	};
};

export const createFormFieldsFromConfig = (
	formFields: FormFieldConfig[],
	urlState: Record<string, any> = {}
): FormField[] => {
	return formFields.map(fieldConfig => convertFormFieldConfigToFormField(fieldConfig, urlState));
};

export const validateFormData = (
	formData: Record<string, any>,
	validationRules: Array<{ field: string; rule: string; message: string }>
): { isValid: boolean; errors: Record<string, string> } => {
	const errors: Record<string, string> = {};

	validationRules.forEach(rule => {
		const value = formData[rule.field];

		switch (rule.rule) {
			case "required":
				if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
					errors[rule.field] = rule.message;
				}
				break;
			case "minLength":
				const minLength = parseInt(rule.message);
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						if (value.length < minLength) {
							errors[rule.field] = `Minimum ${minLength} items required`;
						}
					} else if (String(value).length < minLength) {
						errors[rule.field] = `Minimum length of ${minLength} required`;
					}
				}
				break;
			case "maxLength":
				const maxLength = parseInt(rule.message);
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						if (value.length > maxLength) {
							errors[rule.field] = `Maximum ${maxLength} items allowed`;
						}
					} else if (String(value).length > maxLength) {
						errors[rule.field] = `Maximum length of ${maxLength} allowed`;
					}
				}
				break;
			case "pattern":
				if (value !== undefined && value !== null && value !== "") {
					try {
						const regex = new RegExp(rule.message);
						if (!regex.test(String(value))) {
							errors[rule.field] = "Invalid format";
						}
					} catch {
						errors[rule.field] = "Invalid pattern";
					}
				}
				break;
		}
	});

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
};

export const mapFormDataToApiParams = (
	formData: Record<string, any>,
	paramMapping: Record<string, string>
): Record<string, any> => {
	const apiParams: Record<string, any> = {};

	Object.entries(paramMapping).forEach(([formField, apiParam]) => {
		let value = formData[formField];

		// Skip empty values but allow 0
		if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
			return;
		}

		// Handle type conversions
		if (Array.isArray(value)) {
			// Keep arrays as is
			value = [...value];
		} else if (typeof value === "string" && !isNaN(Number(value))) {
			// Convert numeric strings to numbers
			value = Number(value);
		}

		// Map to nested structure if needed
		const keys = apiParam.split(".");
		let current = apiParams;
		keys.forEach((key, idx) => {
			if (idx === keys.length - 1) {
				current[key] = value;
			} else {
				current[key] = current[key] || {};
				current = current[key];
			}
		});
	});

	return apiParams;
};

export const generateCodeSnippets = (
	codeSnippets: CodeSnippetConfig,
	formData: Record<string, any>
): Record<string, string> => {
	const snippets: Record<string, string> = {};

	Object.entries(codeSnippets).forEach(([language, snippet]) => {
		if (language === "paramPlaceholders") return;

		let processedSnippet = snippet as string;

		// Replace placeholders with actual values or defaults
		Object.entries(codeSnippets.paramPlaceholders || {}).forEach(([placeholder, defaultValue]) => {
			const value = formData[placeholder];
			let replacementValue = defaultValue;

			if (value !== undefined && value !== null && value !== "") {
				const formattedValue = formatValueForSnippet(value, placeholder);
				// For array fields, if the formatted value is empty, use the default
				if (formattedValue !== "" || !isArrayField(placeholder)) {
					replacementValue = formattedValue;
				}
			}

			processedSnippet = processedSnippet.replace(new RegExp(`{{${placeholder}}}`, "g"), replacementValue);
		});

		snippets[language] = processedSnippet;
	});

	return snippets;
};

const formatValueForSnippet = (value: any, placeholder: string): string => {
	// Handle special formatting for different field types
	switch (placeholder) {
		case "queryPosition":
		case "biasPosition":
			if (Array.isArray(value)) {
				return value.join(", ");
			}
			return String(value);
		case "maxResults":
			return String(value);
		case "language":
		case "politicalView":
		case "query":
			return String(value);
		case "includeCountries":
		case "includePlaceTypes":
		case "additionalFeatures":
			if (Array.isArray(value)) {
				return value.map(v => `"${v}"`).join(", ");
			}
			return String(value);

		default:
			return String(value);
	}
};

const isArrayField = (placeholder: string): boolean => {
	return ["additionalFeatures", "includeCountries", "includePlaceTypes"].includes(placeholder);
};

/**
 * Groups form fields by their nested object prefix
 */
export const groupFieldsByNestedObject = (formFields: FormFieldConfig[]): Map<string, FormFieldConfig[]> => {
	const groups = new Map<string, FormFieldConfig[]>();

	formFields.forEach(field => {
		if (field.name.includes(".")) {
			// Extract the nested object prefix (e.g., "filter.circle" from "filter.circle.center")
			const parts = field.name.split(".");
			if (parts.length >= 2) {
				const prefix = parts.slice(0, -1).join(".");
				if (!groups.has(prefix)) {
					groups.set(prefix, []);
				}
				groups.get(prefix)!.push(field);
			}
		}
	});

	return groups;
};

/**
 * Validates nested object dependencies in form data
 * Only validates fields that have explicit dependsOn or nestedObjectDependency configuration
 */
export const validateNestedObjectDependencies = (
	formData: Record<string, any>,
	formFields: FormFieldConfig[]
): { isValid: boolean; errors: Record<string, string> } => {
	const errors: Record<string, string> = {};

	// Only check fields that have explicit dependency configuration
	const fieldsWithDependencies = formFields.filter(field => field.dependsOn || field.nestedObjectDependency);

	fieldsWithDependencies.forEach(field => {
		// Get the dependency field name
		let dependsOnField: string | undefined;

		if (field.dependsOn) {
			dependsOnField = field.dependsOn;
		} else if (field.nestedObjectDependency) {
			dependsOnField = field.nestedObjectDependency.dependsOn;
		}

		if (!dependsOnField) return;
		const dependencyValue = formData[dependsOnField];
		const currentValue = formData[field.name];

		// If the dependency field has a value, this field becomes required
		const hasDependencyValue =
			dependencyValue !== undefined &&
			dependencyValue !== null &&
			dependencyValue !== "" &&
			(!Array.isArray(dependencyValue) || dependencyValue.length > 0);

		const currentIsEmpty =
			currentValue === undefined ||
			currentValue === null ||
			currentValue === "" ||
			(Array.isArray(currentValue) && currentValue.length === 0);

		if (hasDependencyValue && currentIsEmpty) {
			errors[field.name] = `${field.label} is required when ${dependsOnField} is specified`;
		}
	});

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
};

/**
 * Checks if a field should be disabled based on nested object dependencies
 */
export const shouldFieldBeDisabled = (field: FormFieldConfig, formData: Record<string, any>): boolean => {
	if (!field.nestedObjectDependency) {
		return field.disabled || false;
	}

	const { dependsOn } = field.nestedObjectDependency;
	const dependencyValue = formData[dependsOn];

	if (
		dependencyValue === undefined ||
		dependencyValue === null ||
		dependencyValue === "" ||
		(Array.isArray(dependencyValue) && dependencyValue.length === 0)
	) {
		return true;
	}

	return field.disabled || false;
};

/**
 * Determines if a field should be marked as required based on nested object dependencies
 * Only applies when dependsOn or nestedObjectDependency is explicitly configured
 */
export const getEffectiveRequiredStatus = (field: FormFieldConfig, formData: Record<string, any>): boolean => {
	// First check if it's explicitly required
	if (field.required) {
		return true;
	}

	// Check for simple dependsOn configuration
	let dependsOnField: string | undefined;

	if (field.dependsOn) {
		dependsOnField = field.dependsOn;
	} else if (field.nestedObjectDependency) {
		dependsOnField = field.nestedObjectDependency.dependsOn;
	}

	// Only apply effective validation if dependency is explicitly configured
	if (!dependsOnField) {
		return false;
	}

	// Check if the dependency field has a value
	const dependencyValue = formData[dependsOnField];
	const hasDependencyValue =
		dependencyValue !== undefined &&
		dependencyValue !== null &&
		dependencyValue !== "" &&
		(!Array.isArray(dependencyValue) || dependencyValue.length > 0);

	// If the dependency field has a value, this field becomes required
	return hasDependencyValue;
};
