/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { useMemo } from "react";

import { appConfig } from "@api-playground/core/constants";
import { useClient, useMap } from "@api-playground/hooks";
import { AdditionalFeatures } from "@api-playground/types/CustomRequestForm";
import {
	GeocodeCommand,
	GeocodeCommandInput,
	GetPlaceCommand,
	GetPlaceCommandInput,
	ReverseGeocodeCommand,
	ReverseGeocodeCommandInput,
	ReverseGeocodeFilterPlaceType,
	SearchTextCommand,
	SearchTextCommandInput,
	SuggestCommand,
	SuggestCommandInput
} from "@aws-sdk/client-geo-places";
import { IntendedUse } from "@aws-sdk/client-location";
import { useTranslation } from "react-i18next";

const {
	ENV: { NL_BASE_URL, NL_API_KEY }
} = appConfig;

interface ReverseGeocodeParams {
	QueryPosition: number[];
	AdditionalFeatures?: AdditionalFeatures[];
	Language?: string;
	MaxResults?: number;
	PoliticalView?: string;
	QueryRadius?: number;
	IntendedUse?: IntendedUse;
	Filter?: {
		IncludePlaceTypes: ReverseGeocodeFilterPlaceType[];
	};
}

interface GeocodeParams {
	QueryText: string;
	BiasPosition?: number[];
	AdditionalFeatures?: AdditionalFeatures[];
	Language?: string;
	MaxResults?: number;
	PoliticalView?: string;
	IntendedUse?: IntendedUse;
	Key?: string;
	Filter?: {
		IncludeCountries?: string[];
		IncludePlaceTypes?: ReverseGeocodeFilterPlaceType[];
	};
	QueryComponents?: {
		AddressNumber?: string;
		Country?: string;
		District?: string;
		Locality?: string;
		PostalCode?: string;
		Region?: string;
		Street?: string;
		SubRegion?: string;
	};
}

const usePlaceService = () => {
	const { placesClient } = useClient();
	const {
		mapPoliticalView: { alpha3, isSupportedByPlaces },
		biasPosition: BiasPosition,
		searchBiasPosition: SearchBiasPosition
	} = useMap();
	const { i18n } = useTranslation();
	const Language = i18n.language;

	return useMemo(
		() => ({
			getPlaceSuggestions: async (QueryText: string) => {
				const input: SuggestCommandInput = {
					QueryText,
					BiasPosition: SearchBiasPosition,
					Language,
					AdditionalFeatures: ["Core"],
					PoliticalView: isSupportedByPlaces ? alpha3 : undefined
				};
				const command = new SuggestCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceById: async (PlaceId: string) => {
				const input: GetPlaceCommandInput = {
					PlaceId,
					Language,
					AdditionalFeatures: ["Contact"],
					PoliticalView: isSupportedByPlaces ? alpha3 : undefined
				};
				const command = new GetPlaceCommand(input);
				return await placesClient?.send(command);
			},
			getPlacesByText: async (QueryTextOrId: string, isQueryId = false) => {
				const input: SearchTextCommandInput = {
					QueryText: isQueryId ? undefined : QueryTextOrId,
					QueryId: isQueryId ? QueryTextOrId : undefined,
					BiasPosition: isQueryId ? undefined : SearchBiasPosition,
					Language: isQueryId ? undefined : Language,
					PoliticalView: isSupportedByPlaces ? alpha3 : undefined
				};
				const command = new SearchTextCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceByCoordinates: async (params: ReverseGeocodeParams) => {
				const input: ReverseGeocodeCommandInput = {
					QueryPosition: params.QueryPosition,
					Language: params.Language || Language
				};

				if (params.PoliticalView) {
					input.PoliticalView = params.PoliticalView;
				}

				if (params.AdditionalFeatures && params.AdditionalFeatures.length > 0) {
					input.AdditionalFeatures = params.AdditionalFeatures;
				}

				if (params.IntendedUse && params.IntendedUse.length > 0) {
					input.IntendedUse = params.IntendedUse;
				}

				if (params.QueryRadius && params.QueryRadius >= 1) {
					input.QueryRadius = params.QueryRadius;
				}

				if (params.MaxResults && params.MaxResults >= 1) {
					input.MaxResults = params.MaxResults;
				}

				if (params.Filter?.IncludePlaceTypes && params.Filter.IncludePlaceTypes.length > 0) {
					input.Filter = {
						IncludePlaceTypes: params.Filter.IncludePlaceTypes as ReverseGeocodeFilterPlaceType[]
					};
				}

				const command = new ReverseGeocodeCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceByAddress: async (params: GeocodeParams) => {
				const input: GeocodeCommandInput = {
					BiasPosition: params.BiasPosition && params.BiasPosition.length > 0 ? params.BiasPosition : undefined,
					Language: params.Language || Language
				};

				if (params.QueryText) {
					input.QueryText = params.QueryText;
				}

				// Handle MaxResults - only include if it has a valid value
				if (params.MaxResults !== undefined && params.MaxResults !== null && params.MaxResults >= 1) {
					input.MaxResults = params.MaxResults;
				}

				// Handle AdditionalFeatures
				if (params.AdditionalFeatures) {
					input.AdditionalFeatures = params.AdditionalFeatures;
				}

				// Handle PoliticalView
				if (params.PoliticalView) {
					input.PoliticalView = params.PoliticalView;
				}

				// Handle IntendedUse
				if (params.IntendedUse) {
					input.IntendedUse = params.IntendedUse;
				}

				// Handle Key
				if (params.Key) {
					input.Key = params.Key;
				}

				// Handle Filter - only include supported properties
				if (params.Filter) {
					const filterObj: any = {};

					if (params.Filter.IncludeCountries && params.Filter.IncludeCountries.length > 0) {
						filterObj.IncludeCountries = params.Filter.IncludeCountries;
					}

					if (params.Filter.IncludePlaceTypes && params.Filter.IncludePlaceTypes.length > 0) {
						filterObj.IncludePlaceTypes = params.Filter.IncludePlaceTypes;
					}

					// Only set Filter if it has properties
					if (Object.keys(filterObj).length > 0) {
						input.Filter = filterObj;
					}
				}

				// Handle QueryComponents - only include supported properties
				if (params.QueryComponents) {
					(input as any).QueryComponents = {};

					if (params.QueryComponents.AddressNumber) {
						(input as any).QueryComponents.AddressNumber = params.QueryComponents.AddressNumber;
					}
					if (params.QueryComponents.Country) {
						(input as any).QueryComponents.Country = params.QueryComponents.Country;
					}
					if (params.QueryComponents.District) {
						(input as any).QueryComponents.District = params.QueryComponents.District;
					}
					if (params.QueryComponents.Locality) {
						(input as any).QueryComponents.Locality = params.QueryComponents.Locality;
					}
					if (params.QueryComponents.PostalCode) {
						(input as any).QueryComponents.PostalCode = params.QueryComponents.PostalCode;
					}
					if (params.QueryComponents.Region) {
						(input as any).QueryComponents.Region = params.QueryComponents.Region;
					}
					if (params.QueryComponents.Street) {
						(input as any).QueryComponents.Street = params.QueryComponents.Street;
					}
					if (params.QueryComponents.SubRegion) {
						(input as any).QueryComponents.SubRegion = params.QueryComponents.SubRegion;
					}
				}

				const command = new GeocodeCommand(input);
				return await placesClient?.send(command);
			},
			getNLPlacesByText: async (Text: string) => {
				const response = await fetch(
					`${NL_BASE_URL}/places/ask?` +
						new URLSearchParams([
							["Text", Text],
							["BiasPosition", BiasPosition[0].toString()],
							["BiasPosition", BiasPosition[1].toString()],
							["DataSource", "Here"]
						]),
					{
						method: "GET",
						headers: {
							"x-api-key": NL_API_KEY
						}
					}
				);
				const responseBody = await response.json();
				if (response.status !== 200) {
					throw new Error(responseBody.message);
				}
				return responseBody;
			}
		}),
		[BiasPosition, SearchBiasPosition, Language, alpha3, isSupportedByPlaces, placesClient]
	);
};

export default usePlaceService;
