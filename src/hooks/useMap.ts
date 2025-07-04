/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect, useMemo } from "react";

import { appConfig } from "@api-playground/core/constants";
import { useMapStore } from "@api-playground/stores";
import {
	CurrentLocationDataType,
	MapColorSchemeEnum,
	MapStyleEnum,
	MapUnitEnum,
	ViewPointType
} from "@api-playground/types";
import { getCountryCode } from "@api-playground/utils/countryUtil";

const {
	MAP_RESOURCES: { IMPERIAL_COUNTRIES }
} = appConfig;
const { IMPERIAL, METRIC } = MapUnitEnum;

const useMap = () => {
	const store = useMapStore();
	const { setInitial } = store;
	const { setState } = useMapStore;

	useEffect(() => {
		if (store.autoMapUnit.selected) {
			(async () => {
				const countryCode = await getCountryCode();
				const isImperial = !!countryCode && IMPERIAL_COUNTRIES.includes(countryCode);
				const mapUnit = isImperial ? IMPERIAL : METRIC;
				setState(s => ({ autoMapUnit: { ...s.autoMapUnit, system: mapUnit }, mapUnit }));
			})();
		}
	}, [setState, store.autoMapUnit.selected]);

	const methods = useMemo(
		() => ({
			setCurrentLocation: (currentLocationData: CurrentLocationDataType) => {
				setState({ currentLocationData });
			},
			setViewpoint: (viewpoint: ViewPointType) => {
				setState({ viewpoint });
			},
			setIsAutomaticMapUnit: (selected: boolean) => {
				setState(s => ({ autoMapUnit: { ...s.autoMapUnit, selected } }));
			},
			setMapUnit: (mapUnit: MapUnitEnum) => {
				setState({ mapUnit });
			},
			setMapStyle: (mapStyle: MapStyleEnum) => {
				setState({ mapStyle });
			},
			setMapColorScheme: (mapColorScheme: MapColorSchemeEnum) => {
				setState({ mapColorScheme });
			},
			setMapPoliticalView: (mapPoliticalView: {
				alpha2: string;
				alpha3: string;
				desc: string;
				isSupportedByPlaces: boolean;
			}) => {
				setState({ mapPoliticalView });
			},
			setBiasPosition: (biasPosition: number[]) => {
				setState({ biasPosition });
			},
			setClickedPosition: (clickedPosition: number[]) => {
				setState({ clickedPosition });
			},
			setMapLanguage: (mapLanguage: { value: string; label: string }) => {
				setState({ mapLanguage });
			},
			resetStore() {
				setState({
					currentLocationData: undefined
				});
				setInitial();
			},
			setZoom: (zoom: number) => {
				setState(() => {
					return { zoom };
				});
			}
		}),
		[setState, setInitial]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useMap;
