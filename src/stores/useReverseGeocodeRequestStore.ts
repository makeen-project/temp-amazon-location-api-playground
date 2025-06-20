import { IStateProps } from "@api-playground/types";
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/ReverseGeocodeRequestForm";
import { ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";

import createStore from "./createStore";

export interface ReverseGeocodeRequestStore {
	queryPosition: string[];
	additionalFeatures?: AdditionalFeatures[];
	filter?: {
		includePlaceTypes: IncludePlaceTypes[];
	};
	intendedUse?: IntendedUse;
	apiKey?: string;
	language?: string;
	maxResults?: number;
	politicalView?: string;
	queryResults?: number;
	// Response data
	response?: ReverseGeocodeCommandOutput;
	isLoading: boolean;
	error?: string;
}

export const initialState: IStateProps<ReverseGeocodeRequestStore> = {
	queryPosition: [],
	isLoading: false
};

export default createStore<ReverseGeocodeRequestStore>(initialState);
