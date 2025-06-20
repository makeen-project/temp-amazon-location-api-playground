/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import usePlaceService from "@api-playground/services/usePlaceService";
import usePlaceStore from "@api-playground/stores/usePlaceStore";
import { SuggestionType, ViewPointType } from "@api-playground/types";
import { errorHandler } from "@api-playground/utils";
import { isGeoString } from "@api-playground/utils/geoCalculation";
import { uuid } from "@api-playground/utils/uuid";
import { SearchForTextResult } from "@aws-sdk/client-location";

import { useTranslation } from "react-i18next";

import useMap from "./useMap";

const usePlace = () => {
	const store = usePlaceStore();
	const { setInitial } = store;
	const { setState } = usePlaceStore;
	const { setViewpoint } = useMap();
	const placeService = usePlaceService();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			setSearchingState: (isSearching: boolean) => {
				setState({ isSearching });
			},
			searchPlaceSuggestions: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placeService.getPlaceSuggestions(value);

					if (data?.ResultItems) {
						const { ResultItems } = data;
						const suggestions = ResultItems.map(({ Query, Place, Title }) => ({
							id: uuid.randomUUID(),
							queryId: Query?.QueryId,
							placeId: Place?.PlaceId,
							position: Place?.Position,
							label: Query?.QueryId ? Title : Place?.Address?.Label,
							address: Place?.Address,
							country: Place?.Address?.Country?.Name,
							region: Place?.Address?.Region ? Place?.Address?.Region?.Name : Place?.Address?.SubRegion?.Name
						}));
						cb ? cb(suggestions) : setState({ suggestions: { list: suggestions, renderMarkers: false } });
						setViewpoint(viewpoint);
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_suggestions.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceData: async (placeId: string) => {
				try {
					setState({ isFetchingPlaceData: true });
					const data = await placeService.getPlaceById(placeId);
					return data;
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_place_id.text") as string);
				} finally {
					setState({ isFetchingPlaceData: false });
				}
			},
			searchPlacesByText: async (
				value: string,
				viewpoint: ViewPointType,
				cb?: (sg: SuggestionType[]) => void,
				isQueryId = false
			) => {
				try {
					setState({ isSearching: true });
					const data = await placeService.getPlacesByText(value, isQueryId);

					if (data?.ResultItems) {
						const { ResultItems } = data;

						const suggestions = ResultItems.map(({ Position, PlaceId, Address }) => {
							const sg: SuggestionType = {
								id: uuid.randomUUID(),
								placeId: PlaceId,
								position: Position,
								label: Address?.Label,
								address: Address,
								country: Address?.Country?.Name,
								region: Address?.Region ? Address?.Region?.Name : Address?.SubRegion?.Name
							};

							return sg;
						});

						if (cb) {
							cb(suggestions);
						} else {
							setState({ suggestions: { list: suggestions, renderMarkers: true } });
						}

						setViewpoint(viewpoint);
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_text.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			searchNLPlacesByText: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placeService.getNLPlacesByText(value);

					if (data.Results) {
						const { Results } = data;

						const suggestions: SuggestionType[] = Results.map(({ Place, PlaceId }: SearchForTextResult) => {
							const sg: SuggestionType = {
								id: uuid.randomUUID(),
								placeId: PlaceId,
								position: Place?.Geometry?.Point,
								label: Place?.Label,
								country: Place?.Country,
								region: Place?.Region ? Place?.Region : Place?.SubRegion
							};

							return sg;
						});

						if (cb) {
							cb(suggestions);
						} else {
							setState({ suggestions: { list: suggestions, renderMarkers: true } });
						}

						setViewpoint(viewpoint);
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_text.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceDataByCoordinates: async (input: number[]) => {
				try {
					return await placeService.getPlaceByCoordinates({ QueryPosition: input });
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_place_coords.text") as string);
				}
			},
			searchPlacesByCoordinates: async (
				value: string,
				viewpoint: ViewPointType,
				cb?: (sg: SuggestionType[]) => void
			) => {
				try {
					setState({ isSearching: true });
					const [lat, lng] = value.split(",");
					const data = await placeService.getPlaceByCoordinates({
						QueryPosition: [parseFloat(lng), parseFloat(lat)]
					});

					if (data?.ResultItems) {
						const { ResultItems } = data;
						const { Position, Title, PlaceId, Address } = ResultItems[0];
						const vPoint = Position ? { longitude: Position[0], latitude: Position[1] } : viewpoint;

						const suggestion: SuggestionType = {
							id: uuid.randomUUID(),
							placeId: PlaceId,
							position: Position,
							label: Title,
							address: Address,
							country: Address?.Country?.Name,
							region: Address?.Region ? Address?.Region?.Name : Address?.SubRegion?.Name
						};
						cb ? cb([suggestion]) : setState({ suggestions: { list: [suggestion], renderMarkers: false } });
						setViewpoint(vPoint);
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_coords.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			search: async (value: string, viewpoint: ViewPointType, cb: ((sg: SuggestionType[]) => void) | undefined) => {
				if (isGeoString(value)) {
					await methods.searchPlacesByCoordinates(value, viewpoint, cb);
				} else if (value?.length) {
					await methods.searchPlaceSuggestions(value, viewpoint, cb);
				}
			},
			setMarker: (marker?: ViewPointType) => {
				setState({ marker });
			},
			setSelectedMarker: async (selectedMarker?: SuggestionType) => {
				if (selectedMarker === undefined) {
					setState({ selectedMarker });
				} else if (selectedMarker.position) {
					const { position } = selectedMarker;
					setState({ selectedMarker, hoveredMarker: undefined, zoom: 15 });
					setViewpoint({ longitude: position[0], latitude: position[1] });
				} else if (selectedMarker.placeId) {
					try {
						const { placeId } = selectedMarker;
						const place = await placeService.getPlaceById(placeId);
						setState({ selectedMarker, hoveredMarker: undefined, zoom: 15 });
						setViewpoint({ longitude: place!.Position![0], latitude: place!.Position![1] });
					} catch (error) {
						errorHandler(error, t("error_handler__failed_fetch_place_id_marker.text") as string);
					}
				} else {
					console.error("setSelectedMarker - edge case", { selectedMarker });
				}
			},
			setHoveredMarker: (hoveredMarker?: SuggestionType) => {
				setState({ hoveredMarker });
			},
			clearPoiList: () => {
				setState({
					suggestions: undefined,
					selectedMarker: undefined,
					marker: undefined
				});
			},
			setIsSearching: (isSearching: boolean) => {
				setState({ isSearching });
			},
			setSuggestions: (suggestions?: { list: SuggestionType[]; renderMarkers: boolean }) => {
				setState({ suggestions });
			},
			resetStore() {
				setState({
					suggestions: undefined,
					selectedMarker: undefined,
					hoveredMarker: undefined,
					marker: undefined
				});
				setInitial();
			}
		}),
		[placeService, setState, setInitial, setViewpoint, t]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default usePlace;
