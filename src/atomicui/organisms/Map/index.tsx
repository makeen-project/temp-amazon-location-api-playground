/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { forwardRef, lazy, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";

import { IconLocateMe } from "@api-playground/assets/svgs";
import { Logo, QueryRadiusCircle } from "@api-playground/atomicui/molecules";
import useDeviceMediaQuery from "@api-playground/hooks/useDeviceMediaQuery";
import useMap from "@api-playground/hooks/useMap";
import useMapManager from "@api-playground/hooks/useMapManager";
import { ShowStateType } from "@api-playground/types";
import { MapColorSchemeEnum, TriggeredByEnum } from "@api-playground/types/Enums";
import { errorHandler } from "@api-playground/utils/errorHandler";
import { Flex, View } from "@aws-amplify/ui-react";
import type { GeolocateControl as GeolocateControlRef, LngLatBoundsLike } from "maplibre-gl";
import {
	AttributionControl,
	GeolocateControl,
	GeolocateErrorEvent,
	Map as MapLibreMap,
	MapRef as MapLibreMapRef,
	NavigationControl
} from "react-map-gl/maplibre";

import appConfig from "../../../core/constants/appConfig";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.scss";

const MapButtons = lazy(() =>
	import("@api-playground/atomicui/molecules/MapButtons").then(module => ({
		default: module.MapButtons
	}))
);

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
	onMapClick?: (e: { lngLat: { lng: number; lat: number } }) => void;
	onMapZoom?: (e: { viewState: { zoom: number } }) => void;
	onMapDragEnd?: (e: { viewState: { longitude: number; latitude: number } }) => void;
	className?: string;
	apiId?: string;
	mapContainerRef?: React.RefObject<HTMLDivElement>;
	maxZoom?: number;
}

export interface MapRef {
	flyTo: (options: { center: [number, number]; zoom: number; duration?: number }) => void;
	zoomTo: (number: number) => void;
	fitBounds: (
		bounds: [[number, number], [number, number]],
		options?: { padding?: any; duration?: number; essential?: boolean }
	) => void;
}

const Map = forwardRef<MapRef, MapProps>(
	({ children, showMap = true, onMapLoad, onMapClick, className = "", mapContainerRef, maxZoom }, ref) => {
		const [show, setShow] = useState<ShowStateType>(initShow);
		const mapRef = useRef<MapLibreMapRef | null>(null);
		const geolocateControlRef = useRef<GeolocateControlRef | null>(null);
		const { currentLocationData, viewpoint, mapColorScheme, setBiasPosition, zoom, setZoom } = useMap();
		const [locationError, setLocationError] = useState(false);
		const { isDesktop, isTablet } = useDeviceMediaQuery();

		// Expose map methods to parent component
		useImperativeHandle(ref, () => ({
			flyTo: (options: { center: [number, number]; zoom: number; duration?: number }) => {
				mapRef.current?.flyTo(options);
			},
			zoomTo: (zoom: number) => {
				mapRef.current?.zoomTo(zoom);
			},
			fitBounds: (
				bounds: [[number, number], [number, number]],
				options?: { padding?: number; duration?: number; essential?: boolean }
			) => {
				mapRef.current?.fitBounds(bounds, options);
			}
		}));

		const {
			mapStyleWithLanguageUrl,
			gridLoader,
			setGridLoader,
			onLoad,
			getCurrentGeoLocation,
			onGeoLocate,
			onGeoLocateError,
			handleMapMove,
			handleTileLoadingStart,
			handleMapIdle
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
			(e: GeolocateErrorEvent) => {
				setLocationError(true);
				onGeoLocateError(e);
			},
			[onGeoLocateError]
		);

		const handleMapClick = useCallback(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(e: any) => {
				onMapClick?.(e);
			},
			[onMapClick]
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
							display: locationError ? "none" : "flex",
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: 0
						}}
						position="bottom-right"
						positionOptions={{ enableHighAccuracy: true }}
						showUserLocation
						showAccuracyCircle={false}
						onGeolocate={onGeoLocate}
						onError={handleGeoLocateError}
					/>
					<MapButtons
						renderedUpon={TriggeredByEnum.API_PLAYGROUND_DETAILS_PAGE}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={b => setShow(s => ({ ...s, stylesCard: b }))}
						onCloseSidebar={() => setShow(s => ({ ...s, sidebar: false }))}
						onShowGridLoader={() => setGridLoader(true)}
						isUnauthSimulationOpen={show.unauthSimulation}
						onSetShowUnauthSimulation={(b: boolean) => setShow(s => ({ ...s, unauthSimulation: b }))}
					/>
				</>
			),
			[locationError, onGeoLocate, handleGeoLocateError, getCurrentGeoLocation, show.stylesCard]
		);

		if (!showMap) {
			return null;
		}

		// Show loading state while map style is loading
		if (!mapStyleWithLanguageUrl) {
			return (
				<View
					style={{ height: "100%" }}
					className={`map-container ${
						mapColorScheme === MapColorSchemeEnum.DARK ? "dark-mode" : "light-mode"
					} ${className}`}
					ref={mapContainerRef}
				>
					<View className="tile-grid-overlay" />
				</View>
			);
		}

		return (
			<View
				style={{ height: "100%" }}
				className={`map-container ${
					mapColorScheme === MapColorSchemeEnum.DARK ? "dark-mode" : "light-mode"
				} ${className}`}
				ref={mapContainerRef}
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
					maxZoom={maxZoom ? maxZoom : 14.3}
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
						handleMapMove(viewState.longitude, viewState.latitude);
					}}
					onDragEnd={({ viewState }) => {
						setBiasPosition([viewState.longitude, viewState.latitude]);
						handleMapMove(viewState.longitude, viewState.latitude);
					}}
					onClick={handleMapClick}
					onLoad={handleMapLoad}
					onError={error => errorHandler(error.error)}
					onIdle={handleMapIdle}
					onData={handleTileLoadingStart}
					attributionControl={false}
				>
					{gridLoader && <View className="tile-grid-overlay" />}
					<View>
						{children}
						<QueryRadiusCircle mapRef={mapRef} />
						<NavigationControl position="bottom-right" showZoom showCompass={false} />
						{_GeolocateControl}
						<Logo />
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
	}
);

export default Map;
