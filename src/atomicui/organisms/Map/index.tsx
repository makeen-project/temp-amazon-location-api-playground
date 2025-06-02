/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy, useCallback, useMemo, useRef, useState } from "react";

import { IconLocateMe, IconMapSolid } from "@api-playground/assets/svgs";
import useDeviceMediaQuery from "@api-playground/hooks/useDeviceMediaQuery";
import useMap from "@api-playground/hooks/useMap";
import useMapManager from "@api-playground/hooks/useMapManager";
import { ShowStateType } from "@api-playground/types";
import { MapColorSchemeEnum, TriggeredByEnum } from "@api-playground/types/Enums";
import { errorHandler } from "@api-playground/utils/errorHandler";
import { Flex, View } from "@aws-amplify/ui-react";
import type { GeolocateControl as GeolocateControlRef, LngLatBoundsLike } from "maplibre-gl";

const MapButtons = lazy(() =>
	import("@api-playground/atomicui/molecules/MapButtons").then(module => ({
		default: module.MapButtons
	}))
);

import {
	AttributionControl,
	GeolocateControl,
	Map as MapLibreMap,
	MapRef,
	NavigationControl
} from "react-map-gl/maplibre";

import appConfig from "../../../core/constants/appConfig";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.scss";

const {
	MAP_RESOURCES: { MAX_BOUNDS },
	ENV: { VITE_MAP_STYLE_URL },
	API_KEYS
} = appConfig;

const initShow: ShowStateType = {
	sidebar: false,
	routeBox: false,
	settings: false,
	stylesCard: false,
	about: false,
	unauthSimulation: false,
	unauthSimulationBounds: false,
	unauthSimulationExitModal: false,
	openFeedbackModal: false
};

interface MapProps {
	children?: React.ReactNode;
	showMap?: boolean;
	onMapLoad?: () => void;
	onMapClick?: (e: any) => void;
	onMapZoom?: (e: any) => void;
	onMapDragEnd?: (e: any) => void;
	className?: string;
	apiId?: string;
	fullScreenButton: any;
}

const Map: FC<MapProps> = ({
	children,
	showMap = true,
	onMapLoad,
	onMapClick,
	onMapZoom,
	onMapDragEnd,
	className = "",
	apiId,
	fullScreenButton
}) => {
	const [show, setShow] = useState<ShowStateType>(initShow);
	const mapRef = useRef<MapRef | null>(null);
	const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
	const { currentLocationData, viewpoint, mapColorScheme, setBiasPosition, zoom, setZoom } = useMap();
	const [locationError, setLocationError] = useState(false);
	const { isDesktop, isTablet } = useDeviceMediaQuery();

	const {
		mapStyleWithLanguageUrl,
		gridLoader,
		setGridLoader,
		onLoad,
		getCurrentGeoLocation,
		onGeoLocate,
		onGeoLocateError,
		handleMapClick
	} = useMapManager({
		mapRef,
		geolocateControlRef,
		isUnauthSimulationOpen: show.unauthSimulation,
		isSettingsOpen: show.settings,
		isRouteBoxOpen: show.routeBox,
		resetAppStateCb: () => setShow(s => ({ ...initShow, stylesCard: s.stylesCard, settings: s.settings }))
	});

	const handleMapLoad = useCallback(() => {
		onLoad();
		onMapLoad?.();
	}, [onLoad, onMapLoad]);

	const handleGeoLocateError = useCallback(
		(e: any) => {
			setLocationError(true);
			onGeoLocateError(e);
		},
		[onGeoLocateError]
	);

	const _GeolocateControl = useMemo(
		() => (
			<>
				<Flex
					style={{
						display: locationError ? "flex" : "none",
						bottom: "11.9rem",
						right: "2rem"
					}}
					className="map-styles-button-container"
					onClick={() => getCurrentGeoLocation()}
				>
					<IconLocateMe />
				</Flex>
				<GeolocateControl
					ref={geolocateControlRef}
					style={{
						bottom: "11.1rem",
						right: "1.2rem",
						display: locationError ? "none" : "flex"
					}}
					position="bottom-right"
					positionOptions={{ enableHighAccuracy: true }}
					showUserLocation
					showAccuracyCircle={true}
					onGeolocate={onGeoLocate}
					onError={handleGeoLocateError}
				/>
				<MapButtons
					renderedUpon={TriggeredByEnum.API_PLAYGROUND_DETAILS_PAGE}
					openStylesCard={show.stylesCard}
					setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
					onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
					onShowGridLoader={() => setShow(s => ({ ...s, gridLoader: true }))}
					isUnauthSimulationOpen={show.unauthSimulation}
					onSetShowUnauthSimulation={(b: boolean) => setShow(s => ({ ...s, unauthSimulation: b }))}
				/>
			</>
		),
		[locationError, onGeoLocate, handleGeoLocateError, getCurrentGeoLocation, show.stylesCard]
	);

	if (!showMap || !mapStyleWithLanguageUrl) {
		return null;
	}

	return (
		<View
			style={{ height: "100%" }}
			className={`map-container ${
				mapColorScheme === MapColorSchemeEnum.DARK ? "dark-mode" : "light-mode"
			} ${className}`}
		>
			<MapLibreMap
				ref={mapRef}
				style={{ width: "100%", height: "100%" }}
				maxTileCacheSize={100}
				zoom={zoom}
				initialViewState={
					currentLocationData?.currentLocation
						? { ...currentLocationData.currentLocation, zoom }
						: { ...viewpoint, zoom }
				}
				mapStyle={mapStyleWithLanguageUrl}
				minZoom={2}
				maxBounds={
					show.unauthSimulation && show.unauthSimulationBounds
						? isDesktop
							? (MAX_BOUNDS.VANCOUVER.DESKTOP as LngLatBoundsLike)
							: isTablet
							? (MAX_BOUNDS.VANCOUVER.TABLET as LngLatBoundsLike)
							: (MAX_BOUNDS.VANCOUVER.MOBILE as LngLatBoundsLike)
						: undefined
				}
				onZoom={({ viewState }) => setZoom(viewState.zoom)}
				onZoomEnd={({ viewState }) => {
					setBiasPosition([viewState.longitude, viewState.latitude]);
				}}
				onDragEnd={({ viewState }) => {
					setBiasPosition([viewState.longitude, viewState.latitude]);
				}}
				// onClick={handleMapClickEvent}
				onLoad={handleMapLoad}
				onError={error => errorHandler(error.error)}
				onIdle={() => gridLoader && setGridLoader(false)}
				attributionControl={false}
			>
				<View className={gridLoader ? "loader-container" : ""}>
					{children}
					<NavigationControl position="bottom-right" showZoom showCompass={false} />
					{_GeolocateControl}
					{fullScreenButton}
				</View>
				<AttributionControl
					style={{
						color: mapColorScheme === MapColorSchemeEnum.DARK ? "var(--white-color)" : "var(--black-color)",
						backgroundColor: mapColorScheme === MapColorSchemeEnum.DARK ? "rgba(0, 0, 0, 0.2)" : "var(--white-color)"
					}}
					compact={true}
				/>
			</MapLibreMap>
		</View>
	);
};

export default Map;
