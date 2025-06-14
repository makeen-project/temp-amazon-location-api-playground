import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

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
}

export default function AddressInput({ onChange, label, placeholder = "Enter an address..." }: AddressInputProps) {
	const autocompleteRef = useRef<HTMLInputElement>(null);
	const { suggestions, search, isSearching } = usePlace();
	const [value, setValue] = useState("");
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
	const optionDataMap = useRef<Map<string, OptionData>>(new Map());

	const handleSearch = useCallback(
		async (searchValue: string) => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}

			timeoutIdRef.current = setTimeout(async () => {
				try {
					if (searchValue) {
						await search(searchValue, { longitude: 0, latitude: 0 }, undefined);
					}
				} catch (error) {
					console.error("Search failed:", error);
				}
			}, 200);
		},
		[search]
	);

	const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
		setValue(value);
		handleSearch(value);
	};

	const onSelectSuggestion = useCallback(
		(option: ComboBoxOption) => {
			setValue(option.label);
			onChange?.(option.label);
		},
		[onChange]
	);

	const renderOption = (option: ComboBoxOption) => {
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

	const options = (suggestions?.list || []).map((suggestion: BaseSuggestion) => {
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

	return (
		<View>
			<Label className="address-label" htmlFor="autocomplete-input">
				{label}
			</Label>
			<Autocomplete
				ref={autocompleteRef}
				label={label}
				hasSearchIcon={false}
				value={value}
				onClear={() => {
					setValue("");
					onChange?.("");
				}}
				options={options}
				placeholder={placeholder}
				onChange={handleChange}
				onSelect={onSelectSuggestion}
				renderOption={renderOption}
				isLoading={isSearching}
				className="address-autocomplete"
				borderRadius={"20px"}
			/>
		</View>
	);
}
