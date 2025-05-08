/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useState } from "react";

// import { EventTypeEnum, debounce, record } from "amazon-location-features-demo-web";
import {
	ApiPlaygroundItem,
	ApiPlaygroundList,
	ApiPlaygroundListFilter
} from "@api-playground/types/ApiPlaygroundTypes";

import { useTranslation } from "react-i18next";

import apiConfig from "../config/api-config.json";

// import { downloadJson } from "utils/downloadJsonFileUtils";
// import { errorHandler } from "utils/errorHandler";

// const recordFilterEvent = debounce(
// 	(recordAttributes: { [key: string]: string }) =>
// 		record([{ EventType: EventTypeEnum.API_PLAYGROUND_FILTERS_APPLIED, Attributes: recordAttributes }]),
// 	5000
// );
// const {
// 	ENV: { API_PLAYGROUNDS_LIST_FILENAME }
// } = appConfig;

interface ApiConfigItem {
	id: string;
	imageSource: string;
	title: string;
	description: string;
	shouldRenderMap: boolean;
	requestParams: any[];
}

interface ApiConfig {
	apis: {
		[key: string]: ApiConfigItem[];
	};
}

function useApiPlaygroundList() {
	const [apiPlaygroundList, setApiPlaygroundsList] = useState<ApiPlaygroundList | null>(null);
	const [isLoading, setLoading] = useState(false);
	const { t, i18n } = useTranslation();

	const fetchApiPlaygroundList = useCallback(async () => {
		try {
			setLoading(true);
			// const apiConfig = await downloadJson({ lng: i18n.language, key: "/extra/api-playground/api-config.json" });

			// Flatten the apis object into a single array
			const flattenedList = Object.entries((apiConfig as ApiConfig).apis).reduce<ApiPlaygroundList>(
				(acc, [category, items]) => {
					const itemsWithCategory = items.map(item => ({
						id: item.id,
						title: item.title,
						imageSource: item.imageSource,
						brief: item.description,
						category
					}));
					return [...acc, ...itemsWithCategory];
				},
				[]
			);
			setApiPlaygroundsList(flattenedList);
		} catch (error) {
			// errorHandler(error, t("error_handler__failed_fetch_api_playground_list.text"));
		} finally {
			setLoading(false);
		}
	}, [t, i18n.language]);

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
			filteredData = filteredData.filter((apiPlayground: ApiPlaygroundItem) =>
				apiPlayground.title.toLowerCase().includes(filters.searchText!.toLowerCase())
			);
		}

		const filterCategories = [...(filters.features || []), ...(filters.language || []), ...(filters.platform || [])];

		console.log("filterCategories", filterCategories);
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

		// recordFilterEvent(recordAttributes);
	}, [filters, isLoading, apiPlaygroundList]);

	return {
		filters,
		filterLoading,
		filteredApiPlaygroundList,
		setFilters,
		setFilterLoading
	};
}

export default useApiPlaygroundList;
export { useApiPlaygroundFilters };
