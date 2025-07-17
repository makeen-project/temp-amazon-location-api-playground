/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useState } from "react";

import { FilterData, generateApiPlaygroundFiltersData } from "@api-playground/core/constants/apiPlaygroundFiltersData";
import appConfig from "@api-playground/core/constants/appConfig";
import {
	ApiPlaygroundItem,
	ApiPlaygroundList,
	ApiPlaygroundListFilter,
	LocationPopupConfig
} from "@api-playground/types/ApiPlaygroundTypes";
import { downloadJson } from "@api-playground/utils/downloadJsonFileUtils";
import { errorHandler } from "@api-playground/utils/errorHandler";
import { useTranslation } from "react-i18next";

const {
	ENV: { API_PLAYGROUND_LIST_FILENAME }
} = appConfig;

interface ApiConfigItem {
	id: string;
	imageSource: string;
	title: string;
	description: string;
	shouldRenderMap: boolean;
	type: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	requestParams: any[];
	buildSampleButton?: {
		text: string;
		link: string;
	};
	relatedResources?: { text: string; link: string }[];
	locationPopupConfig?: LocationPopupConfig;
}

interface ApiConfig {
	[key: string]: ApiConfigItem[];
}

function useApiPlaygroundList() {
	const [apiPlaygroundList, setApiPlaygroundsList] = useState<ApiPlaygroundList | null>(null);
	const [isLoading, setLoading] = useState(false);
	const { t } = useTranslation();

	const fetchApiPlaygroundList = useCallback(async () => {
		try {
			setLoading(true);
			const apiConfig = await downloadJson({ path: API_PLAYGROUND_LIST_FILENAME });

			const flattenedList = Object.entries(apiConfig as ApiConfig).reduce<ApiPlaygroundList>(
				(acc, [category, items]) => {
					const itemsWithCategory = items.map(item => ({
						category,
						...item
					}));
					return [...acc, ...itemsWithCategory];
				},
				[]
			);
			setApiPlaygroundsList(flattenedList);
		} catch (error) {
			errorHandler(error, t("error_handler__failed_fetch_api_playground_list.text"));
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		fetchApiPlaygroundList();
	}, [fetchApiPlaygroundList]);

	return {
		isLoading,
		data: apiPlaygroundList
	};
}

function useApiPlaygroundFilters() {
	const [filters, setFilters] = useState<ApiPlaygroundListFilter | null>(null);
	const [filterLoading, setFilterLoading] = useState(false);
	const [filteredApiPlaygroundList, setFilteredApiPlaygroundList] = useState<ApiPlaygroundList | null>(null);
	const { isLoading, data: apiPlaygroundList } = useApiPlaygroundList();

	/* NOTE: this should be removed incase of remote request
	filter useEffect */
	useEffect(() => {
		if (isLoading === false && apiPlaygroundList && Object.keys(apiPlaygroundList).length === 0) {
			return;
		}

		const noFilterInKeys = filters && Object.values(filters).flat().length === 0;
		if (!filters || noFilterInKeys) {
			setFilters(null);
			setFilteredApiPlaygroundList(null);
			return;
		}

		let filteredData = apiPlaygroundList;
		if (!filteredData) {
			return;
		}

		if (filters.searchText) {
			const searchTerm = filters.searchText.toLowerCase().trim();

			// Early return if search term is empty after trimming
			if (!searchTerm) {
				return;
			}

			filteredData = filteredData.filter((apiPlayground: ApiPlaygroundItem) => {
				// Normalize all searchable fields
				const searchableFields = {
					title: apiPlayground.title.toLowerCase(),
					category: apiPlayground.category.toLowerCase(),
					type: apiPlayground.type.toLowerCase(),
					description: apiPlayground.description.toLowerCase()
				};

				// Helper function to split text into searchable words
				const splitIntoWords = (text: string): string[] => {
					return text
						.replace(/([A-Z])/g, " $1") // Split camelCase
						.replace(/-/g, " ") // Split hyphenated words
						.split(/\s+/)
						.filter(word => word.length > 0); // Remove empty strings
				};

				// Split search term into individual words
				const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

				// Check if all search words are found across any of the searchable fields
				return searchWords.every(searchWord => {
					// Check for exact field matches first
					if (Object.values(searchableFields).some(field => field === searchWord)) {
						return true;
					}

					// Check for partial matches in all fields
					if (Object.values(searchableFields).some(field => field.includes(searchWord))) {
						return true;
					}

					// Check for exact word matches across all fields
					const allWords = Object.values(searchableFields).flatMap(splitIntoWords);
					return allWords.some(word => word === searchWord);
				});
			});
		}

		const filterCategories = [...(filters.features || []), ...(filters.language || []), ...(filters.platform || [])];

		if (filterCategories.flat().length) {
			filteredData = filteredData.filter((apiPlayground: ApiPlaygroundItem) => {
				return filterCategories.some(
					filterCategory => apiPlayground.category.toLowerCase() === filterCategory.toLowerCase()
				);
			});
		}

		setTimeout(() => setFilteredApiPlaygroundList(filteredData), 200);

		const recordAttributes: { [key: string]: string } = {};

		for (const [key, value] of Object.entries(filters)) {
			if (value?.length) {
				recordAttributes[key] = String(value);
			}
		}

		recordAttributes["usedTextSearch"] = String(Boolean(recordAttributes.searchText));
		delete recordAttributes.searchText;
	}, [filters, isLoading, apiPlaygroundList]);

	return {
		filters,
		filterLoading,
		filteredApiPlaygroundList,
		setFilters,
		setFilterLoading
	};
}

function useApiPlaygroundItem(apiId: string | undefined) {
	const { data } = useApiPlaygroundList();
	if (!apiId || !data) return null;
	return data.find(item => item.id === apiId) || null;
}

const useDynamicApiPlaygroundFilters = () => {
	const [filterData, setFilterData] = useState<FilterData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFilterData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await generateApiPlaygroundFiltersData();
			setFilterData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load filter data");
			console.error("Error loading dynamic filter data:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFilterData();
	}, [fetchFilterData]);

	return {
		filterData,
		isLoading,
		error,
		refetch: fetchFilterData
	};
};

export default useApiPlaygroundList;
export { useApiPlaygroundFilters, useApiPlaygroundItem, useDynamicApiPlaygroundFilters };
