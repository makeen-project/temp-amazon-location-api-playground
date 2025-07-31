/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ChangeEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { IconLocationPin } from "@api-playground/assets/svgs";
import usePlace from "@api-playground/hooks/usePlace";

import { Autocomplete, Label, Text, View } from "@aws-amplify/ui-react";
import type { ComboBoxOption } from "@aws-amplify/ui-react/dist/types/primitives/types/autocomplete";

import "./styles.scss";

// Basic suggestion type matching the API response
interface BaseSuggestion {
	id: string;
	queryId?: string;
	placeId?: string;
	position?: number[];
	label?: string;
	country?: string;
	region?: string;
	hash?: string;
}

// Additional data we want to store for each option
interface OptionData {
	position?: number[];
	country?: string;
	region?: string;
}

interface AddressInputProps {
	onChange?: (address: string) => void;
	placeholder?: string;
	label: string;
	isRequired?: boolean;
	initialValue?: string;
}

export interface AddressInputRef {
	clear: () => void;
}

const MAX_CHARACTERS = 200;

const AddressInput = forwardRef<AddressInputRef, AddressInputProps>(
	({ onChange, label, placeholder = "Enter an address...", isRequired, initialValue }, ref) => {
		const autocompleteRef = useRef<HTMLInputElement>(null);
		const { suggestions, search, isSearching } = usePlace();
		const [localValue, setLocalValue] = useState(initialValue || "");
		const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
		const optionDataMap = useRef<Map<string, OptionData>>(new Map());

		const clearInput = useCallback(() => {
			setLocalValue("");
			onChange?.("");
		}, [onChange]);

		useImperativeHandle(
			ref,
			() => ({
				clear: clearInput
			}),
			[clearInput]
		);

		const handleSearch = useCallback(
			async (searchValue: string) => {
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}

				timeoutIdRef.current = setTimeout(async () => {
					try {
						if (searchValue && searchValue.trim().length > 0) {
							await search(searchValue, { longitude: 0, latitude: 0 }, undefined);
						}
					} catch (error) {
						console.error("Search failed:", error);
					}
				}, 200);
			},
			[search]
		);

		const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
			const newValue = target.value;

			// Validate character limit - silently prevent input if exceeded
			if (newValue.length > MAX_CHARACTERS) {
				return; // Don't update the value if it exceeds the limit
			}

			setLocalValue(newValue);
			handleSearch(newValue);
		};

		const onSelectSuggestion = useCallback(
			(option: ComboBoxOption) => {
				const selectedValue = option.label;

				// Validate character limit for selected suggestion - silently prevent if exceeded
				if (selectedValue.length > MAX_CHARACTERS) {
					return;
				}

				setLocalValue(selectedValue);
				onChange?.(selectedValue);
			},
			[onChange]
		);

		const renderOption = (option: ComboBoxOption) => {
			// Check if this is a fallback option (user's input)
			const isFallbackOption = option.value.startsWith("fallback-");

			if (isFallbackOption) {
				return (
					<View key={option.value} data-testid={`fallback-${option.value}`} className="option-details fallback-option">
						<IconLocationPin />
						<View className="content-wrapper">
							<Text>Use: {option.label}</Text>
							<Text variation="tertiary">No matches found</Text>
						</View>
					</View>
				);
			}

			// Regular suggestion option
			const optionData = optionDataMap.current.get(option.value);
			const separateIndex = option.label.indexOf(",");
			const title = separateIndex > -1 ? option.label.substring(0, separateIndex) : option.label;

			return (
				<View key={option.value} data-testid={`suggestion-${option.value}`} className="option-details">
					<IconLocationPin />
					<View className="content-wrapper">
						<Text>{title}</Text>
						{optionData?.region && optionData?.country && (
							<Text variation="tertiary">{`${optionData.region}, ${optionData.country}`}</Text>
						)}
					</View>
				</View>
			);
		};

		useEffect(() => {
			return () => {
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}
			};
		}, []);

		// Create options from suggestions
		const suggestionOptions = (suggestions?.list || []).map((suggestion: BaseSuggestion) => {
			const option: ComboBoxOption = {
				label: suggestion.label || "",
				value: suggestion.id,
				id: suggestion.id
			};

			// Store additional data in the Map
			optionDataMap.current.set(suggestion.id, {
				position: suggestion.position,
				country: suggestion.country,
				region: suggestion.region
			});

			return option;
		});

		const hasSearchResults = suggestionOptions.length > 0;
		const hasUserInput = localValue.trim().length > 0;
		const filteredSuggestionOptions = hasUserInput
			? suggestionOptions.filter(option => option.label.toLowerCase().includes(localValue.toLowerCase()))
			: suggestionOptions;

		// Show fallback option only when no search results exist
		const shouldShowFallback = !isSearching && hasUserInput && !hasSearchResults;

		const fallbackOption: ComboBoxOption = {
			label: localValue,
			value: `fallback-${localValue}`,
			id: `fallback-${localValue}`
		};

		// Use filtered search results if available, otherwise show fallback
		let options = filteredSuggestionOptions;

		// Show fallback when no search results exist and user has typed something
		if (shouldShowFallback) {
			options = [fallbackOption];
		}

		// Ensure we always have options when user has typed something
		if (hasUserInput && options.length === 0) {
			options = [fallbackOption];
		}

		return (
			<View>
				<Label className="address-label" htmlFor="autocomplete-input">
					{label}
				</Label>
				<Autocomplete
					ref={autocompleteRef}
					label={label}
					hasSearchIcon={false}
					value={localValue}
					onClear={clearInput}
					options={options}
					placeholder={placeholder}
					onChange={handleChange}
					onSelect={onSelectSuggestion}
					renderOption={renderOption}
					isLoading={isSearching}
					className="address-autocomplete"
					borderRadius={"20px"}
					required={isRequired}
				/>
			</View>
		);
	}
);

export default AddressInput;
