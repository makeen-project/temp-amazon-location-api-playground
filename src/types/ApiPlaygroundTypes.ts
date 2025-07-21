/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type ApiPlaygroundDetailsType = {
	id: string;
	title: string;
	imageSource?: string;
	publishedOn?: string;
	updatedOn?: string;
	tags?: string[];
	tabs?: {
		title: string;
		content: string;
	}[];
	bodyText?: string;
	clone?: string;
	deploy?: string;
	testing?: string;
	tabsTitle?: string;
	cloudformationUrl?: string;
	setup?: string;
	cleanup?: string;
	githubLink?: string;
};

export interface ApiPlaygroundListFilter {
	searchText?: string;
	features?: string[];
	language?: string[];
	platform?: string[];
}

export interface LocationPopupConfig {
	showPlaceId?: boolean;
	showLatitude?: boolean;
	showLongitude?: boolean;
}

// Form field configuration types
export interface FormFieldOption {
	label: string;
	value: string | number | boolean;
	disabled?: boolean;
	tooltipText?: string;
}

export interface FormFieldConfig {
	type:
		| "text"
		| "number"
		| "textarea"
		| "slider"
		| "radio"
		| "dropdown"
		| "checkbox"
		| "address"
		| "sliderWithInput"
		| "multiSelect"
		| "latLonInput"
		| "lngLatInput";
	inputType?: "text" | "password";
	name: string;
	label: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	// Field-specific properties
	defaultValue?: string | number | boolean | string[] | number[];
	value?: string | number | boolean | string[] | number[];
	min?: number;
	max?: number;
	step?: number;
	options?: FormFieldOption[];
	minSelected?: number;
	maxSelected?: number;
	onToggle?: boolean;
	hiddenFromUI?: boolean;
}

export interface FormContentConfig {
	type: "list" | "text";
	items?: Array<{
		text: string;
	}>;
	text?: string;
}

export interface ApiHandlerConfig {
	apiMethod: string;
	paramMapping: Record<string, string>;
	validationRules?: Array<{
		field: string;
		rule: string;
		message: string;
	}>;
	transformResponse?: (response: any) => any;
}

export interface CodeSnippetConfig {
	JavaScript: string;
	Python: string;
	Ruby: string;
	paramPlaceholders?: Record<string, string>;
}

export interface ApiPlaygroundItem {
	id: string;
	title: string;
	imageSource: string;
	description: string;
	submitButtonText?: string;
	tags: string[];
	category: string;
	type: string;
	shouldRenderMap?: boolean;
	requestParams?: any[];
	locationPopupConfig?: LocationPopupConfig;
	buildSampleButton?: {
		text: string;
		link: string;
	};
	relatedResources?: { text: string; link: string }[];
	// New properties for dynamic form generation
	formFields?: FormFieldConfig[];
	formContent?: FormContentConfig;
	apiHandler?: ApiHandlerConfig;
	codeSnippets?: CodeSnippetConfig;
	missingFieldsMessage?: string;
	showLocalMarkerOnMapClick?: "single" | "multiple";
}

export type ApiPlaygroundList = ApiPlaygroundItem[];
