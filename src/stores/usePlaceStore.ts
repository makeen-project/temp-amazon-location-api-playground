/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { IStateProps, SuggestionType, ViewPointType } from "@api-playground/types";

import createStore from "./createStore";

interface PlaceStoreProps {
	isSearching: boolean;
	isFetchingPlaceData: boolean;
	clusterZoom: number;
	precision: number;
	suggestions?: { list: SuggestionType[]; renderMarkers: boolean };
	selectedMarker?: SuggestionType;
	hoveredMarker?: SuggestionType;
	marker?: ViewPointType;
	zoom: number;
	clickedPosition: number[];
}

const initialState: IStateProps<PlaceStoreProps> = {
	isSearching: false,
	isFetchingPlaceData: false,
	zoom: 5,
	clusterZoom: 18,
	precision: 10,
	clickedPosition: []
};

export default createStore<PlaceStoreProps>(initialState);
