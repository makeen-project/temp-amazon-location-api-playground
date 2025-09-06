/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ChangeEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { IconLocationPin } from "@api-playground/assets/svgs";
import usePlace from "@api-playground/hooks/usePlace";
import { useCustomRequestStore } from "@api-playground/stores";

import { Autocomplete, Label, Text, View } from "@aws-amplify/ui-react";
import type { ComboBoxOption } from "@aws-amplify/ui-react/dist/types/primitives/types/autocomplete";

import "./styles.scss";

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
		const { suggestions, search, isSearching, setSuggestions, setHoveredMarker } = usePlace();
		const { setState } = useCustomRequestStore;
		const [localValue, setLocalValue] = useState(initialValue || "");
		const [localIsSearching, setLocalIsSearching] = useState(false);
		const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
		const optionDataMap = useRef<Map<string, OptionData>>(new Map());

		const clearInput = useCallback(() => {
			setLocalValue("");
			onChange?.("");
			setSuggestions();
			setLocalIsSearching(false);
			setState({ response: undefined });
		}, [onChange, setSuggestions]);

		useImperativeHandle(
			ref,
			() => ({
				clear: clearInput
			}),
			[clearInput]
		);

		const handleSearch = useCallback(
			async (searchValue: string) => {
				setState({ response: undefined });
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}

				setLocalIsSearching(true);

				timeoutIdRef.current = setTimeout(async () => {
					try {
						if (searchValue && searchValue.trim().length > 0) {
							await search(searchValue, { longitude: 0, latitude: 0 }, undefined);
						}
					} catch (error) {
						console.error("Search failed:", error);
					} finally {
						setLocalIsSearching(false);
					}
				}, 500);
			},
			[search]
		);

		const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
			const newValue = target.value;
			if (newValue.length > MAX_CHARACTERS) return;

			if (suggestions?.list?.length) {
				setSuggestions();
			}

			setLocalValue(newValue);
			onChange?.(newValue);
			if (newValue.trim().length === 0) {
				setSuggestions();
				setLocalIsSearching(false);
				return;
			}
			void handleSearch(newValue);
		};

		const onSelectSuggestion = useCallback(
			(option: ComboBoxOption) => {
				const selectedValue = option.label;

				if (selectedValue.length > MAX_CHARACTERS) {
					return;
				}

				setLocalValue(selectedValue);
				onChange?.(selectedValue);
			},
			[onChange]
		);

		const renderOption = (option: ComboBoxOption) => {
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

			const optionData = optionDataMap.current.get(option.value);
			const separateIndex = option.label.indexOf(",");
			const title = separateIndex > -1 ? option.label.substring(0, separateIndex) : option.label;
			const suggestionItem = suggestions?.list?.find(s => s.id === option.value);

			return (
				<View
					key={option.value}
					data-testid={`suggestion-${option.value}`}
					className="option-details"
					onMouseEnter={() => {
						if (suggestionItem) {
							setHoveredMarker(suggestionItem);
						}
					}}
					onMouseLeave={() => setHoveredMarker()}
				>
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

		const suggestionOptions = (suggestions?.list || []).map((suggestion: BaseSuggestion) => {
			const option: ComboBoxOption = {
				label: suggestion.label || "",
				value: suggestion.id,
				id: suggestion.id
			};

			optionDataMap.current.set(suggestion.id, {
				position: suggestion.position,
				country: suggestion.country,
				region: suggestion.region
			});

			return option;
		});

		const hasUserInput = localValue?.trim().length > 0;
		const filteredSuggestionOptions = hasUserInput
			? suggestionOptions.filter(option => option.label.toLowerCase().includes(localValue.toLowerCase()))
			: suggestionOptions;

		const isCurrentlySearching = isSearching || localIsSearching;
		const fallbackOption: ComboBoxOption = {
			label: localValue,
			value: `fallback-${localValue}`,
			id: `fallback-${localValue}`
		};

		const options: ComboBoxOption[] = (() => {
			if (!isCurrentlySearching && hasUserInput) {
				return filteredSuggestionOptions.length > 0 ? filteredSuggestionOptions : [fallbackOption];
			}
			return [];
		})();

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
					isLoading={isCurrentlySearching}
					className="address-autocomplete"
					borderRadius={"20px"}
					required={isRequired}
				/>
			</View>
		);
	}
);

export default AddressInput;
