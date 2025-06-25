/* eslint-disable @typescript-eslint/no-explicit-any */
/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { FormField } from "@api-playground/atomicui/molecules/FormRender";
import { CodeSnippetConfig, FormContentConfig, FormFieldConfig } from "@api-playground/types/ApiPlaygroundTypes";

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
		className: fieldConfig.className
	};

	const value = urlState?.[fieldConfig.name] || fieldConfig.value || fieldConfig.defaultValue;

	switch (fieldConfig.type) {
		case "text":
			return {
				...baseField,
				type: "text" as const,
				value: value as string
			};

		case "number":
			return {
				...baseField,
				type: "number" as const,
				value: value as number,
				min: fieldConfig.min,
				max: fieldConfig.max
			};

		case "textarea":
			return {
				...baseField,
				type: "textarea" as const,
				value: value as string
			};

		case "address":
			return {
				...baseField,
				type: "address" as const
			};

		case "latLonInput":
			return {
				...baseField,
				type: "latLonInput" as const,
				defaultValue: value as string
			};

		case "slider":
			return {
				...baseField,
				type: "slider" as const,
				value: value as number,
				min: fieldConfig.min!,
				max: fieldConfig.max!,
				step: fieldConfig.step
			};

		case "sliderWithInput":
			return {
				...baseField,
				type: "sliderWithInput" as const,
				value: value as number,
				min: fieldConfig.min!,
				max: fieldConfig.max!,
				step: fieldConfig.step
			};

		case "radio":
			return {
				...baseField,
				type: "radio" as const,
				value: value as string,
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
				value: value as string,
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
				value: value as string[],
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
				values: Array.isArray(value) ? value : []
			};

		case "lngLatInput":
			return {
				...baseField,
				type: "lngLatInput" as const,
				value: Array.isArray(value) ? value : []
			};

		default:
			return {
				...baseField,
				type: "text" as const,
				value: value as string
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
				if (!value || (Array.isArray(value) && value.length === 0)) {
					errors[rule.field] = rule.message;
				}
				break;
			case "minLength":
				if (value && value.length < parseInt(rule.message)) {
					errors[rule.field] = rule.message;
				}
				break;
			case "maxLength":
				if (value && value.length > parseInt(rule.message)) {
					errors[rule.field] = rule.message;
				}
				break;
			case "pattern":
				if (value && !new RegExp(rule.message).test(value)) {
					errors[rule.field] = rule.message;
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

	console.log("formData", formData);
	console.log("paramMapping", paramMapping);

	Object.entries(paramMapping).forEach(([formField, apiParam]) => {
		const value = formData[formField];
		// Only skip undefined/null, but allow empty arrays/strings if needed
		if (value !== undefined && value !== null) {
			const keys = apiParam.split(".");
			let current = apiParams;
			keys.forEach((key, idx) => {
				if (idx === keys.length - 1) {
					current[key] = value;
				} else {
					if (!current[key]) current[key] = {};
					current = current[key];
				}
			});
		}
	});

	console.log("apiParams", apiParams);

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
			const replacementValue =
				value !== undefined && value !== null && value !== ""
					? formatValueForSnippet(value, placeholder)
					: defaultValue;

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
		default:
			return String(value);
	}
};
