/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@api-playground/core/constants";
import { useClient, useMap } from "@api-playground/hooks";
import { AdditionalFeatures } from "@api-playground/types/CustomRequestForm";
import {
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
	Filter?: {
		IncludePlaceTypes: ReverseGeocodeFilterPlaceType[];
	};
}

interface GeocodeParams {
	Query: string;
	BiasPosition?: number[];
	AdditionalFeatures?: AdditionalFeatures[];
	Language?: string;
	MaxResults?: number;
	PoliticalView?: string;
}

const usePlaceService = () => {
	const { placesClient } = useClient();
	const {
		mapPoliticalView: { alpha3, isSupportedByPlaces },
		biasPosition: BiasPosition
	} = useMap();
	const { i18n } = useTranslation();
	const Language = i18n.language;

	return useMemo(
		() => ({
			getPlaceSuggestions: async (QueryText: string) => {
				const input: SuggestCommandInput = {
					QueryText,
					BiasPosition,
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
					BiasPosition: isQueryId ? undefined : BiasPosition,
					Language: isQueryId ? undefined : Language,
					PoliticalView: isSupportedByPlaces ? alpha3 : undefined
				};
				const command = new SearchTextCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceByCoordinates: async (params: ReverseGeocodeParams) => {
				const input: ReverseGeocodeCommandInput = {
					QueryPosition: params.QueryPosition,
					Language: params.Language || Language,
					PoliticalView: params.PoliticalView || (isSupportedByPlaces ? alpha3 : undefined),
					MaxResults: params.MaxResults
				};

				if (params.AdditionalFeatures && params.AdditionalFeatures.length > 0) {
					input.AdditionalFeatures = params.AdditionalFeatures;
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
				const input: SearchTextCommandInput = {
					QueryText: params.Query,
					BiasPosition: params.BiasPosition || BiasPosition,
					Language: params.Language || Language,
					PoliticalView: params.PoliticalView || (isSupportedByPlaces ? alpha3 : undefined),
					AdditionalFeatures: params.AdditionalFeatures,
					MaxResults: params.MaxResults
				};
				const command = new SearchTextCommand(input);
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
		[BiasPosition, Language, alpha3, isSupportedByPlaces, placesClient]
	);
};

export default usePlaceService;
