import { IStateProps } from "@api-playground/types";
import { AdditionalFeatures, IntendedUse } from "@api-playground/types/CustomRequestForm";
import {
	GeocodeCommandOutput,
	ReverseGeocodeCommandOutput,
	ReverseGeocodeFilterPlaceType
} from "@aws-sdk/client-geo-places";

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
	includePlaceTypes?: ReverseGeocodeFilterPlaceType[];
	intendedUse?: IntendedUse;
	apiKey?: string;
	language?: string;
	maxResults?: number;
	politicalView?: string;
	queryRadius?: number;
	// Response data
	response?: ReverseGeocodeCommandOutput | GeocodeCommandOutput;
	isLoading: boolean;
	error?: string;
}

export const initialState: IStateProps<CustomRequestStore> = {
	queryPosition: [],
	isLoading: false,
	maxResults: 1,
	queryRadius: 1
};

export default createStore<CustomRequestStore>(initialState);
