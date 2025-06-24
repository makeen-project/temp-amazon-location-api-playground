import { IStateProps } from "@api-playground/types";
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/CustomRequestForm";
import { GeocodeCommandOutput, ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";

import createStore from "./createStore";

export interface RequestSnippetsProps {
	width: number;
	onWidthChange: (width: number) => void;
	isFullScreen: boolean;
	onFullScreenToggle: () => void;
	response?: ReverseGeocodeCommandOutput | GeocodeCommandOutput;
}

export interface CustomRequestStore {
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
	response?: ReverseGeocodeCommandOutput | GeocodeCommandOutput;
	isLoading: boolean;
	error?: string;
}

export const initialState: IStateProps<CustomRequestStore> = {
	queryPosition: [],
	isLoading: false
};

export default createStore<CustomRequestStore>(initialState);
