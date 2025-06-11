import { IStateProps } from "@api-playground/types";
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/ReverseGeocodeRequestForm";

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
}

export const initialState: IStateProps<ReverseGeocodeRequestStore> = {
	queryPosition: []
};

export default createStore<ReverseGeocodeRequestStore>(initialState);
