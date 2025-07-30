/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { IStateProps } from "@api-playground/types";
import { AdditionalFeatures, IntendedUse } from "@api-playground/types/CustomRequestForm";
import {
	GeocodeCommandOutput,
	ReverseGeocodeCommandOutput,
	ReverseGeocodeFilterPlaceType
} from "@aws-sdk/client-geo-places";

import createStore from "./createStore";

export interface RequestSnippetsProps {
	isFullScreen: boolean;
	onFullScreenToggle: () => void;
	response?: ReverseGeocodeCommandOutput | GeocodeCommandOutput;
	isOpen?: boolean;
	onToggle?: () => void;
	isExpanded?: boolean;
	onWidthChange?: () => void;
}

export interface CustomRequestStore {
	queryPosition: string[];
	biasPosition?: number[];
	additionalFeatures?: AdditionalFeatures[];
	includeCountries?: string[];
	includePlaceTypes?: ReverseGeocodeFilterPlaceType[];
	intendedUse?: IntendedUse;
	key?: string;
	apiKey?: string;
	language?: string;
	maxResults?: number;
	politicalView?: string;
	queryRadius?: number;
	submittedQueryRadius?: number;
	addressNumber?: string;
	country?: string;
	district?: string;
	locality?: string;
	postalCode?: string;
	region?: string;
	street?: string;
	subRegion?: string;
	// Response data
	response?: ReverseGeocodeCommandOutput | GeocodeCommandOutput;
	isLoading: boolean;
	error?: string;
	query?: string;
}

export const initialState: IStateProps<CustomRequestStore> = {
	queryPosition: [],
	biasPosition: [],
	additionalFeatures: [],
	includeCountries: [],
	includePlaceTypes: [],
	intendedUse: IntendedUse.SingleUse,
	key: "",
	apiKey: "",
	language: "",
	maxResults: 1,
	politicalView: "",
	queryRadius: 1,
	addressNumber: "",
	country: "",
	district: "",
	locality: "",
	postalCode: "",
	region: "",
	street: "",
	subRegion: "",
	isLoading: false,
	query: ""
};

export default createStore<CustomRequestStore>(initialState);
