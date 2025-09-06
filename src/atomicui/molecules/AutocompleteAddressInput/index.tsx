/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ChangeEvent, forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import usePlaceService from "@api-playground/services/usePlaceService";
import { useCustomRequestStore } from "@api-playground/stores";
import { errorHandler } from "@api-playground/utils/errorHandler";
import { mapFormDataToApiParams, validateNestedObjectDependencies } from "@api-playground/utils/formConfigUtils";

import { Input, Label, View } from "@aws-amplify/ui-react";

import "./styles.scss";

interface AutocompleteAddressInputProps {
	onChange?: (address: string) => void;
	placeholder?: string;
	label: string;
	isRequired?: boolean;
	initialValue?: string;
}

export interface AutocompleteAddressInputRef {
	clear: () => void;
}

const MAX_CHARACTERS = 200;

const AutocompleteAddressInput = forwardRef<AutocompleteAddressInputRef, AutocompleteAddressInputProps>(
	({ onChange, label, placeholder = "Enter an address...", isRequired, initialValue }) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const placeService = usePlaceService();
		const { setState } = useCustomRequestStore;
		const store = useCustomRequestStore();
		const { language, intendedUse, politicalView } = store;
		const [localValue, setLocalValue] = useState(initialValue || "");
		const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
		const apiPlaygroundItem = useApiPlaygroundItem("geocode");
		const autocompletePlaygroundItem = useApiPlaygroundItem("autocomplete");

		useEffect(() => {
			if (initialValue) {
				setLocalValue(initialValue);
				onChange?.(initialValue);
			} else {
				setLocalValue("");
				onChange?.("");
			}
		}, [initialValue]);

		const debouncedSearch = useCallback(
			async (value: string) => {
				if (value.trim().length === 0) {
					setState({ response: undefined });
					return;
				}

				try {
					const formFields = autocompletePlaygroundItem?.formFields || [];
					const defaultValues = formFields.reduce((acc, field) => {
						if (field.defaultValue !== undefined) {
							acc[field.name] = field.defaultValue;
						}
						return acc;
					}, {} as Record<string, any>);
					const currentValues = {
						...defaultValues,
						queryText: value,
						language,
						politicalView,
						intendedUse
					};
					const params = mapFormDataToApiParams(
						currentValues,
						autocompletePlaygroundItem?.apiHandler?.paramMapping || {}
					);

					const apiMethod = autocompletePlaygroundItem?.apiHandler?.apiMethod as keyof typeof placeService;
					let autocompleteResponse: any;
					if (typeof placeService[apiMethod] === "function") {
						autocompleteResponse = await (placeService[apiMethod] as any)(params);
					} else {
						throw new Error(`API method ${apiMethod} not found`);
					}

					if (autocompleteResponse?.ResultItems?.[0]) {
						// Use the first autocomplete result for geocoding
						const selectedText = autocompleteResponse.ResultItems[0].Address?.Label;

						// Then call geocode API with the selected result

						const currentValues = {
							...defaultValues,
							query: selectedText,
							language,
							politicalView,
							intendedUse
						};

						// Validate nested object dependencies
						const nestedValidation = validateNestedObjectDependencies(currentValues, formFields);
						if (!nestedValidation.isValid) {
							const errorMessages = Object.values(nestedValidation.errors);
							throw new Error(`Validation failed: ${errorMessages.join(", ")}`);
						}

						const params = mapFormDataToApiParams(currentValues, apiPlaygroundItem?.apiHandler?.paramMapping || {});
						const apiMethod = apiPlaygroundItem?.apiHandler?.apiMethod as keyof typeof placeService;

						if (typeof placeService[apiMethod] === "function") {
							const response = await (placeService[apiMethod] as any)(params);

							setState({
								...defaultValues,
								response: autocompleteResponse,
								error: undefined,
								position: response?.ResultItems?.[0]?.Position
							});
						} else {
							throw new Error(`API method ${apiMethod} not found`);
						}
					}
				} catch (error) {
					errorHandler(error);
					setState({
						error: error instanceof Error ? error.message : "An error occurred",
						response: undefined,
						position: []
					});
				}
			},
			[apiPlaygroundItem, placeService, language, politicalView, intendedUse, setState, store]
		);

		const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
			const newValue = target.value;
			if (newValue.length > MAX_CHARACTERS) return;

			setLocalValue(newValue);
			onChange?.(newValue);

			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}

			timeoutIdRef.current = setTimeout(() => {
				void debouncedSearch(newValue);
			}, 500);
		};

		useEffect(() => {
			return () => {
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}
			};
		}, []);

		return (
			<View>
				<Label className="address-label" htmlFor="address-input">
					{label}
				</Label>
				<Input
					ref={inputRef}
					value={localValue}
					onChange={handleChange}
					placeholder={placeholder}
					className="address-input"
					required={isRequired}
					id="address-input"
				/>
			</View>
		);
	}
);

AutocompleteAddressInput.displayName = "AutocompleteAddressInput";

export default AutocompleteAddressInput;
