/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { showToast } from "@api-playground/core/Toast";
import { useApiPlaygroundStore } from "@api-playground/stores";
import { ToastType } from "@api-playground/types";
import { getTileBounds } from "@api-playground/utils";
import {
	CalculateRouteCommandInput,
	DescribeTrackerCommandInput,
	GetDevicePositionCommandInput,
	GetGeofenceCommandInput,
	GetMapTileCommandInput,
	ListGeofencesCommandInput,
	SearchPlaceIndexForPositionCommandInput,
	SearchPlaceIndexForSuggestionsCommandInput,
	SearchPlaceIndexForTextCommandInput
} from "@aws-sdk/client-location";
// import { MapRef } from "react-map-gl/maplibre";

import useAwsGeofence from "./useGeofence";
import useAwsMap from "./useMap";
import useAwsPlace from "./usePlace";
import useAwsRoute from "./useRoute";

const useApiPlayground = () => {
	return {};
	// const store = useApiPlaygroundStore();
	// const { setInitial } = store;
	// const { setState } = useApiPlaygroundStore;
	// const { mapRef, getMapTile } = useAwsMap();
	// const { searchPlaceIndexForPosition, searchPlaceIndexForSuggestions, searchPlaceIndexForText } = useAwsPlace();
	// const { calculateRoute } = useAwsRoute();
	// const { getGeofence, listGeofences } = useAwsGeofence();

	// const methods = useMemo(
	// 	() => ({
	// 		getMapTile: async (apiRequest: GetMapTileCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await getMapTile(apiRequest);
	// 				const bounds = getTileBounds(
	// 					parseInt(apiRequest.Z as string),
	// 					parseInt(apiRequest.X as string),
	// 					parseInt(apiRequest.Y as string)
	// 				);

	// 				if (response?.$metadata.httpStatusCode === 200) {
	// 					mapRef && mapRef.fitBounds(bounds);
	// 					setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 				}
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		searchPlaceIndexForPosition: async (apiRequest: SearchPlaceIndexForPositionCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await searchPlaceIndexForPosition(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		searchPlaceIndexForSuggestions: async (apiRequest: SearchPlaceIndexForSuggestionsCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await searchPlaceIndexForSuggestions(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		searchPlaceIndexForText: async (apiRequest: SearchPlaceIndexForTextCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await searchPlaceIndexForText(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		calculateRoute: async (apiRequest: CalculateRouteCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await calculateRoute(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		getGeofence: async (apiRequest: GetGeofenceCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await getGeofence(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		listGeofences: async (apiRequest: ListGeofencesCommandInput) => {
	// 			setState({ isLoading: true });
	// 			try {
	// 				const response = await listGeofences(apiRequest);
	// 				setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 			} catch (error) {
	// 				setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 				showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 			} finally {
	// 				setState({ isLoading: false });
	// 			}
	// 		},
	// 		// describeTracker: async (apiRequest: DescribeTrackerCommandInput) => {
	// 		// 	setState({ isLoading: true });
	// 		// 	try {
	// 		// 		const response = await describeTracker(apiRequest);
	// 		// 		setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 		// 	} catch (error) {
	// 		// 		setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 		// 		showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 		// 	} finally {
	// 		// 		setState({ isLoading: false });
	// 		// 	}
	// 		// },
	// 		// getDevicePosition: async (apiRequest: GetDevicePositionCommandInput) => {
	// 		// 	setState({ isLoading: true });
	// 		// 	try {
	// 		// 		const response = await getDevicePosition(apiRequest);
	// 		// 		setState({ request: JSON.stringify(apiRequest), response: JSON.stringify(response) });
	// 		// 	} catch (error) {
	// 		// 		setState({ request: JSON.stringify(apiRequest), response: (error as Error).message });
	// 		// 		showToast({ content: (error as Error).message, type: ToastType.ERROR });
	// 		// 	} finally {
	// 		// 		setState({ isLoading: false });
	// 		// 	}
	// 		// },
	// 		resetStore: () => {
	// 			setInitial();
	// 		}
	// 	}),
	// 	[
	// 		setState,
	// 		getMapTile,
	// 		mapRef,
	// 		searchPlaceIndexForPosition,
	// 		searchPlaceIndexForSuggestions,
	// 		searchPlaceIndexForText,
	// 		calculateRoute,
	// 		getGeofence,
	// 		listGeofences,
	// 		// describeTracker,
	// 		// getDevicePosition,
	// 		setInitial
	// 	]
	// );

	// return { ...methods, ...store };
};

export default useApiPlayground;
