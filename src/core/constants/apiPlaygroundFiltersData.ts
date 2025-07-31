/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { downloadJson } from "@api-playground/utils/downloadJsonFileUtils";

import appConfig from "./appConfig";

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
	requestParams: any[];
	buildSampleButton?: {
		text: string;
		link: string;
	};
	relatedResources?: { text: string; link: string }[];
	locationPopupConfig?: {
		showPlaceId: boolean;
		showLatitude: boolean;
		showLongitude: boolean;
	};
}

interface ApiConfig {
	[key: string]: ApiConfigItem[];
}

export type FilterData = {
	key: "features" | "language" | "platform";
	title: string;
	options: {
		label: string;
		value: string;
	}[];
}[];

// Function to generate dynamic filter data from API config
export const generateApiPlaygroundFiltersData = async (): Promise<FilterData> => {
	try {
		const apiConfig = await downloadJson({ path: API_PLAYGROUND_LIST_FILENAME });
		const config = apiConfig as ApiConfig;

		// Extract unique API types/categories from the config
		const apiTypes = Object.keys(config);

		// Create filter options based on API types
		const filterOptions = apiTypes.map(apiType => ({
			label: apiType.charAt(0).toUpperCase() + apiType.slice(1), // Capitalize first letter
			value: apiType
		}));

		return [
			{
				key: "features",
				title: "Features",
				options: filterOptions
			}
		];
	} catch (error) {
		console.error("Failed to generate dynamic filter data:", error);
		// Fallback to default options if config loading fails
		return [
			{
				key: "features",
				title: "Features",
				options: [
					{ label: "Reverse Geocode", value: "reverseGeocode" },
					{ label: "Geocode", value: "Geocode" }
				]
			}
		];
	}
};
