/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect, useState } from "react";

// import { EventTypeEnum, debounce, record } from "amazon-location-features-demo-web";
import { ApiPlaygroundList, ApiPlaygroundListFilter } from "@api-playground/types/ApiPlaygroundTypes";
import { compose, prop, sortBy } from "ramda";
import { useTranslation } from "react-i18next";

import appConfig from "core/constants/appConfig";
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

const LOCAL_API_PLAYGROUND_LIST = [
	{
		id: "1",
		imageSource: "images/Map1.png",
		title: "CreateMap Playground",
		brief:
			"Creates a map resource in your AWS account, which provides map tiles of different styles sourced from global location data providers.",
		tags: ["CSS", "HTML", "MAPS"]
	},
	{
		id: "2",
		imageSource: "images/Map2.png",
		title: "SearchNearby API Playground",
		brief:
			"Find points of interest around specific locations on the map. Select a position, set your search radius, and filter by categories to discover nearby places. View detailed results including addresses, business information, and opening hours",
		tags: ["CSS", "HTML", "PLACES"]
	},
	{
		id: "3",
		imageSource: "images/Map3.png",
		title: "Routes API Playground",
		brief:
			"Calculate optimal routes with turn-by-turn directions using multiple travel modes. Plan journeys by car (even with live traffic), walking, or truck to see the best path between locations",
		tags: ["CSS", "HTML", "ROUTES"]
	},
	{
		id: "4",
		imageSource: "images/Map4.png",
		title: "Location Tracking with AWS Amplify on Android",
		brief: "How to implement location tracking using AWS Amplify and Amazon Location on Android",
		tags: ["CSS", "HTML", "TRACKERS"]
	}
];

function useApiPlaygroundList() {
	const [apiPlaygroundList, setApiPlaygroundsList] = useState<ApiPlaygroundList | null>(null);
	const [isLoading, setLoading] = useState(false);
	const { t, i18n } = useTranslation();

	const fetchApiPlaygroundList = useCallback(async () => {
		try {
			setLoading(true);
			setApiPlaygroundsList(LOCAL_API_PLAYGROUND_LIST);
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
			filteredData = filteredData.filter((apiPlayground: { title: string }) =>
				apiPlayground.title.toLowerCase().includes(filters.searchText!.toLowerCase())
			);
		}

		const filterTags = [...(filters.features || []), ...(filters.language || []), ...(filters.platform || [])];

		console.log("filterTags", filterTags);
		if (filterTags.flat().length) {
			filteredData = filteredData.filter((apiPlayground: { tags: any[] }) => {
				const lowerCaseTags = apiPlayground.tags.map((tag: string) => tag.trim().toLowerCase());
				return filterTags.some(filterTag => lowerCaseTags.includes(filterTag.trim().toLowerCase()));
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
