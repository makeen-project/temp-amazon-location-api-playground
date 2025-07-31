/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { appConfig } from "@api-playground/core/constants";
import {
	CurrentLocationDataType,
	IStateProps,
	MapColorSchemeEnum,
	MapStyleEnum,
	MapUnitEnum,
	ViewPointType
} from "@api-playground/types";

import createStore from "./createStore";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, MAP_DATA },
	MAP_RESOURCES: {
		AMAZON_HQ: { US }
	}
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${MAP_DATA}`;

interface MapStoreProps {
	currentLocationData?: CurrentLocationDataType;
	viewpoint: ViewPointType;
	autoMapUnit: {
		selected: boolean;
		system: MapUnitEnum;
	};
	mapUnit: MapUnitEnum;
	mapStyle: MapStyleEnum;
	mapColorScheme: MapColorSchemeEnum;
	mapPoliticalView: { alpha2: string; alpha3: string; desc: string; isSupportedByPlaces: boolean };
	biasPosition: number[];
	clickedPosition: number[];
	mapLanguage: { value: string; label: string };
	isSearching: boolean;
	isFetchingPlaceData: boolean;
	zoom: number;
	precision: number;
	clusterZoom: number;
}

const initialState: IStateProps<MapStoreProps> = {
	viewpoint: US,
	autoMapUnit: {
		selected: true,
		system: MapUnitEnum.IMPERIAL
	},
	mapUnit: MapUnitEnum.IMPERIAL,
	mapStyle: MapStyleEnum.STANDARD,
	mapColorScheme: MapColorSchemeEnum.LIGHT,
	mapPoliticalView: {
		alpha2: "",
		alpha3: "",
		desc: "no_political_view.text",
		isSupportedByPlaces: false
	},
	biasPosition: [US.longitude, US.latitude],
	clickedPosition: [],
	mapLanguage: { value: "en", label: "English" },
	isSearching: false,
	isFetchingPlaceData: false,
	zoom: 5,
	clusterZoom: 18,
	precision: 10
};

export default createStore<MapStoreProps>(initialState, true, localStorageKey);
