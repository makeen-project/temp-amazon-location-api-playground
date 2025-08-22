/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IconBackArrow, IconShare } from "@api-playground/assets/svgs";
import { Content } from "@api-playground/atomicui/atoms/Content";
import { HintMessage } from "@api-playground/atomicui/atoms/HintMessage";
import { MapMarker, RedMarker } from "@api-playground/atomicui/molecules";
import CustomRequest from "@api-playground/atomicui/organisms/CustomRequest";
import Map, { MapRef } from "@api-playground/atomicui/organisms/Map";
import RequestSnippets from "@api-playground/atomicui/organisms/RequestSnippets";
import { appConfig } from "@api-playground/core/constants";
import { useMap, usePlace } from "@api-playground/hooks";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore, initialState } from "@api-playground/stores/useCustomRequestStore";
import { uuid } from "@api-playground/utils";
import { debounce } from "@api-playground/utils/debounce";
import { Button, Flex, Text, View } from "@aws-amplify/ui-react";
import { bbox, circle } from "@turf/turf";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS, MAP_LANGUAGES }
} = appConfig;

const ApiPlaygroundDetailsPage: FC = () => {
	useAuthManager();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const customRequestStore = useCustomRequestStore() as CustomRequestStore;
	const { setState } = useCustomRequestStore;

	const initialUrlState = (apiPlaygroundItem?.formFields || []).reduce((acc, field) => {
		const fieldName = field.name as keyof CustomRequestStore;
		if (field.type === "text" && field.inputType === "password") {
			return acc;
		}

		if (field.defaultValue) {
			acc[fieldName] = field.defaultValue;
		} else if (field.type === "sliderWithInput") {
			acc[fieldName] = field.defaultValue ?? 1;
		} else {
			acc[fieldName] = initialState[fieldName];
		}
		return acc;
	}, {} as Record<string, any>);

	const navigate = useNavigate();
	const { urlState, setUrlState } = useUrlState({ ...initialUrlState, response: undefined });
	const { setBiasPosition, setMapPoliticalView, setMapLanguage, setGridLoader } = useMap();
	const { setClickedPosition, clickedPosition, clearPoiList, setSelectedMarker, suggestions } = usePlace();

	const [isSnippetsOpen, setIsSnippetsOpen] = useState(true);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const [activeMarker, setActiveMarker] = useState(false);
	const [activeSuggestionId, setActiveSuggestionId] = useState<string>();
	const [searchValue, setSearchValue] = useState("");
	const [message, setMessage] = useState<string | undefined>(undefined);
	const [isCoordinatePickingDisabled, setIsCoordinatePickingDisabled] = useState(false);
	const [mapContainerHeight, setMapContainerHeight] = useState<number>(500); // Default fallback height
	const [localMarkers, setLocalMarkers] = useState<Array<{ position: [number, number]; id: string; label: string }>>(
		[]
	);
	const [secondaryMarkers, setSecondaryMarkers] = useState<Array<{
		placeId: string;
		position: [number, number];
		id: string;
		label: string;
		address: { Label: string };
		placeType: string;
		active?: boolean;
	}>>([]);

	const mapRef = useRef<MapRef | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isSnippetsOpenRef = useRef(isSnippetsOpen);

	const resultItem = customRequestStore.response?.ResultItems?.[0];
	const position = resultItem?.Position;

	const showMapMarker =
		customRequestStore?.response && position?.length === 2 && position.every(coord => !isNaN(coord));

	const showLocalMarkers = localMarkers.length > 0 && !showMapMarker && apiPlaygroundItem?.showLocalMarkerOnMapClick;

	const placeId = resultItem?.PlaceId || uuid.randomUUID();
	const label = resultItem?.Address?.Label || "Unknown location";
	const address = { Label: label };

	const handleMarkerClose = useCallback(() => {
		setActiveMarker(false);
	}, []);
	const handleMarkerToggle = useCallback((isActive: boolean) => {
		setActiveMarker(isActive);
	}, []);

	const handleMapZoom = useCallback(() => {}, [apiPlaygroundId]);
	const handleMapDragEnd = useCallback(() => {}, [apiPlaygroundId]);
	const handleMarkerActivate = useCallback(() => {
		setActiveMarker(true);
	}, []);

	const handleClose = useCallback(() => {
		handleMarkerClose();
		handleMarkerToggle?.(false);
		setState({ ...initialState, query: "", response: undefined });
		setLocalMarkers([]);
		setSecondaryMarkers([]);
		setIsCoordinatePickingDisabled(false);
		if (resetTimeoutRef.current) {
			clearTimeout(resetTimeoutRef.current);
		}
	}, [handleMarkerClose, handleMarkerToggle]);

	const handleReset = () => {
		const resetState = {
			queryPosition: [],
			biasPosition: [],
			additionalFeatures: [],
			includeCountries: [],
			includePlaceTypes: [],
			intendedUse: undefined,
			key: "",
			apiKey: "",
			language: "en",
			maxResults: 1,
			politicalView: "",
			queryRadius: null,
			submittedQueryRadius: undefined,
			addressNumber: "",
			country: "",
			district: "",
			locality: "",
			postalCode: "",
			region: "",
			street: "",
			subRegion: "",
			response: undefined,
			isLoading: false,
			error: undefined
		};

		setState(resetState);
		setClickedPosition([]);
		setBiasPosition([]);
		setMapPoliticalView(MAP_POLITICAL_VIEWS[0]);
		setMapLanguage(MAP_LANGUAGES[0]);
		setSecondaryMarkers([]);

		if (secondaryMarkers.length > 0) {
			mapRef.current?.zoomTo(15);
		}

		setUrlState(null as any);
		handleClose?.();
	};

	const toggleFullScreen = useCallback(() => {
		setIsFullScreen(prev => !prev);
		setTimeout(() => {
			applyStylesDebounced();
		}, 250);
	}, [apiPlaygroundId, isFullScreen]);

	const toggleSnippets = () => {
		setIsSnippetsOpen(!isSnippetsOpen);
		isSnippetsOpenRef.current = !isSnippetsOpen;
	};

	const handleMapClick = useCallback(
		(e: { lngLat: { lng: number; lat: number } }) => {
			if (activeMarker) {
				setActiveMarker(false);
				clearPoiList();
				setSelectedMarker();
				setSearchValue("");
			}

			// Clear secondary markers when clicking on map
			setSecondaryMarkers(prev => 
				prev.map(m => ({ ...m, active: false }))
			);

			if (isCoordinatePickingDisabled) {
				return;
			}

			const { lng, lat } = e.lngLat;
			setClickedPosition([lng, lat]);

			if (apiPlaygroundItem?.showLocalMarkerOnMapClick) {
				const markerId = uuid.randomUUID();
				const newMarker = {
					position: [lng, lat] as [number, number],
					id: markerId,
					label: ""
				};

				if (apiPlaygroundItem.showLocalMarkerOnMapClick === "single") {
					setLocalMarkers([newMarker]);
				} else if (apiPlaygroundItem.showLocalMarkerOnMapClick === "multiple") {
					setLocalMarkers(prev => [...prev, newMarker]);
				}
			}

			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		},
		[setClickedPosition, activeMarker, isCoordinatePickingDisabled, apiPlaygroundItem]
	);

	const extractSecondaryMarkers = useCallback(() => {
		const resultItem = customRequestStore.response?.ResultItems?.[0];
		if (!resultItem) return;

		const markers: Array<{
			placeId: string;
			position: [number, number];
			id: string;
			label: string;
			address: { Label: string };
			placeType: string;
		}> = [];

		// Helper function to check if position already exists
		const positionExists = (newPosition: [number, number], existingMarkers: typeof markers) => {
			return existingMarkers.some(marker => 
				marker.position[0] === newPosition[0] && marker.position[1] === newPosition[1]
			);
		};

		// Extract SecondaryAddresses
		if ((resultItem as any).SecondaryAddresses && Array.isArray((resultItem as any).SecondaryAddresses)) {
			(resultItem as any).SecondaryAddresses.forEach((secondaryAddress: any) => {
				if (secondaryAddress.Position && secondaryAddress.Position.length === 2) {
					const newPosition = secondaryAddress.Position as [number, number];
					if (!positionExists(newPosition, markers)) {
						markers.push({
							placeId: secondaryAddress.PlaceId || uuid.randomUUID(),
							position: newPosition,
							id: secondaryAddress.PlaceId || uuid.randomUUID(),
							label: secondaryAddress.Title || secondaryAddress.Address?.Label || "Secondary Address",
							address: { Label: secondaryAddress.Address?.Label || secondaryAddress.Title || "Secondary Address" },
							placeType: "SecondaryAddress"
						});
					}
				}
			});
		}

		// Extract Intersections
		if ((resultItem as any).Intersections && Array.isArray((resultItem as any).Intersections)) {
			(resultItem as any).Intersections.forEach((intersection: any) => {
				if (intersection.Position && intersection.Position.length === 2) {
					const newPosition = intersection.Position as [number, number];
					if (!positionExists(newPosition, markers)) {
						markers.push({
							placeId: intersection.PlaceId || uuid.randomUUID(),
							position: newPosition,
							id: intersection.PlaceId || uuid.randomUUID(),
							label: intersection.Title || intersection.Address?.Label || "Intersection",
							address: { Label: intersection.Address?.Label || intersection.Title || "Intersection" },
							placeType: "Intersection"
						});
					}
				}
			});
		}

		setSecondaryMarkers(markers);
	}, [customRequestStore.response]);

	const handleCustomResponse = () => {
		const resultItem = customRequestStore.response?.ResultItems?.[0];
		const currentPosition = resultItem?.Position;

		if (!currentPosition || currentPosition.length !== 2 || currentPosition.some(isNaN)) {
			console.warn("Invalid position data received");
			return;
		}

		setLocalMarkers([]);
		setSecondaryMarkers([]);
		setActiveMarker(true);
		setIsCoordinatePickingDisabled(true);
		setGridLoader(true);

		const [lng, lat] = currentPosition;
		const submittedQueryRadius = customRequestStore.submittedQueryRadius;
		const queryRadius = customRequestStore.queryRadius;

		try {
			if (submittedQueryRadius && submittedQueryRadius > 0 && queryRadius !== null) {
				const radiusInKm = submittedQueryRadius / 1000;
				const circleFeature = circle([lng, lat], radiusInKm, {
					units: "kilometers",
					steps: 64
				});

				const boundingBox = bbox(circleFeature);

				mapRef.current?.fitBounds(
					[
						[boundingBox[0], boundingBox[1]],
						[boundingBox[2], boundingBox[3]]
					],
					{
						padding: 50,
						duration: 2000,
						essential: true
					}
				);
			} else {
				mapRef.current?.flyTo({
					center: [lng, lat],
					zoom: 15,
					duration: 2000
				});
			}
		} catch (error) {
			console.error("Error updating map view:", error);
		}
	};

	const handleMapLoad = useCallback(() => {
		setTimeout(() => {
			setMapLoaded(true);
		}, 300);
		if (customRequestStore.response) {
			setTimeout(() => {
				handleCustomResponse();
			}, 500);
		}
	}, [customRequestStore.response, handleCustomResponse]);

	useEffect(() => {
		if (!apiPlaygroundItem) return;

		const requiredFields = (apiPlaygroundItem.formFields || []).filter(f => f.required);
		const hasMissingRequired = requiredFields.some(f => {
			const key = f.name as keyof CustomRequestStore;
			const val = customRequestStore[key];

			if (Array.isArray(val)) {
				if (f.name === "queryPosition" && val.length === 2 && val[0] === 0 && val[1] === 0) {
					return false;
				}
				return (
					val.length === 0 ||
					(val as unknown[]).every((v: unknown) =>
						typeof v === "string" ? v === "" || v === "0" : typeof v === "number" ? v === 0 : false
					)
				);
			}
			if (typeof val === "string") return val === "" || val === "0";
			if (typeof val === "number") return val === 0;

			return val === undefined || val === null;
		});

		setMessage(hasMissingRequired ? apiPlaygroundItem.missingFieldsMessage : undefined);
	}, [customRequestStore, apiPlaygroundItem, clickedPosition]);

	useEffect(() => {
		if (customRequestStore.response) {
			handleCustomResponse();
			extractSecondaryMarkers();
		} else {
			setIsCoordinatePickingDisabled(false);
			setSecondaryMarkers([]);
		}
	}, [customRequestStore.response]);

	useEffect(() => {
		setState(prev => ({
			...prev,
			...initialUrlState
		}));
	}, [apiPlaygroundItem]);

	useEffect(() => {
		if (!mapLoaded) return;
		if (!apiPlaygroundItem || apiPlaygroundItem.type !== "geocode") return;
		const list = suggestions?.list;
		if (!list || list.length === 0) return;
		const pts = list.map(s => s.position).filter(p => Array.isArray(p) && p.length === 2) as number[][];
		if (pts.length === 0) return;
		if (pts.length === 1) {
			const [lng, lat] = pts[0] as [number, number];
			try {
				mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, duration: 800 });
			} catch {}
			return;
		}
		let minLng = Infinity,
			minLat = Infinity,
			maxLng = -Infinity,
			maxLat = -Infinity;
		for (const [lng, lat] of pts as [number, number][]) {
			if (lng < minLng) minLng = lng;
			if (lat < minLat) minLat = lat;
			if (lng > maxLng) maxLng = lng;
			if (lat > maxLat) maxLat = lat;
		}
		try {
			mapRef.current?.fitBounds(
				[
					[minLng, minLat],
					[maxLng, maxLat]
				],
				{ padding: 50, duration: 800, essential: true }
			);
		} catch {}
	}, [suggestions, mapLoaded, showMapMarker, apiPlaygroundItem]);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	const applyStyles = useCallback(() => {
		const attributionElement = document.querySelector(".maplibregl-ctrl-bottom-right") as HTMLElement;
		const mapStylesButton = document.querySelector(".map-styles-button") as HTMLElement;
		const snippetsContainer = document.querySelector(".snippets-container") as HTMLElement;

		if (attributionElement) {
			const attributionRight = isSnippetsOpenRef.current ? snippetsContainer?.offsetWidth ?? 400 : 0;
			attributionElement.style.right = `${attributionRight}px`;
		}

		if (mapStylesButton) {
			const DIFFERENCE = 26;
			const stylesRight = isSnippetsOpenRef.current ? snippetsContainer?.offsetWidth + DIFFERENCE : DIFFERENCE;
			mapStylesButton.style.right = `${stylesRight}px`;
		}
	}, []);

	const applyStylesDebounced = useMemo(() => debounce(applyStyles, 20), []);

	useEffect(() => {
		applyStylesDebounced();
	}, [isSnippetsOpen, mapLoaded]);

	useEffect(() => {
		window.addEventListener("resize", applyStylesDebounced);

		return () => {
			window.removeEventListener("resize", applyStylesDebounced);
		};
	}, []);

	// ResizeObserver to track map container height changes
	useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;

		const setupResizeObserver = () => {
			if (!mapContainerRef.current) return;

			// Set initial height
			setMapContainerHeight(mapContainerRef.current.clientHeight);

			// Create and setup ResizeObserver
			resizeObserver = new ResizeObserver(entries => {
				for (const entry of entries) {
					setMapContainerHeight(entry.contentRect.height);
				}
			});

			resizeObserver.observe(mapContainerRef.current);
		};

		// Try to setup immediately
		setupResizeObserver();

		// If ref is not available, wait a bit and try again
		if (!mapContainerRef.current) {
			const timer = setTimeout(() => {
				setupResizeObserver();
			}, 100);

			return () => {
				clearTimeout(timer);
				if (resizeObserver) {
					resizeObserver.disconnect();
				}
			};
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, []); // Remove dependency to avoid infinite re-renders

	if (!apiPlaygroundItem) {
		return <div className="api-playground-details-loading">Loading...</div>;
	}

	return (
		<View className="api-playground-details-page no-side-gaps">
			<Flex className="api-playground-header">
				<Button
					className="back-button-link"
					variation="link"
					onClick={() => {
						handleReset();
						navigate("/api-playground");
					}}
				>
					<span className="back-button-content">
						<IconBackArrow className="back-arrow-icon" />
						Back
					</span>
				</Button>
				<Flex direction="row" gap={"2rem"} justifyContent="space-between" alignItems="flex-start">
					<Flex direction="column" flex={1} alignItems="flex-start" gap={"0.5rem"}>
						<Text as="h2" className="api-playground-title" fontWeight={700} fontSize="2rem">
							{apiPlaygroundItem.title}
						</Text>
						<View>
							<Content
								items={[{ text: apiPlaygroundItem.description }]}
								className={`api-playground-description${descExpanded ? " expanded" : ""}`}
							/>
							<Button className="show-more-btn" variation="link" onClick={() => setDescExpanded(e => !e)}>
								{descExpanded ? "Show less" : "Show more"}
							</Button>
						</View>
					</Flex>
					<Flex direction="column" alignItems="flex-start" className="api-playground-right-col">
						<Button
							className="build-sample-btn"
							variation="primary"
							onClick={() => window.open(apiPlaygroundItem.buildSampleButton?.link, "_blank")}
						>
							{apiPlaygroundItem.buildSampleButton?.text}
						</Button>
						<Button
							className="share-btn"
							variation="link"
							onClick={() =>
								navigator.share
									? navigator.share({ title: apiPlaygroundItem.title, url: window.location.href })
									: navigator.clipboard.writeText(window.location.href)
							}
						>
							<IconShare width={14} height={14} className="share-icon" />
							Share
						</Button>
						<View className="related-resources">
							<Text fontWeight={600} fontSize="1rem" marginBottom={"0.5rem"} className="related-title">
								Related resources
							</Text>
							<View className="related-links">
								{apiPlaygroundItem.relatedResources?.map((res, idx) => (
									<a key={idx} href={res.link} target="_blank" rel="noopener noreferrer">
										{res.text}
									</a>
								))}
							</View>
						</View>
					</Flex>
				</Flex>
			</Flex>
			<View className={`map-container ${isFullScreen ? "fullscreen" : ""}`} style={isFullScreen ? {} : { padding: 32 }}>
				<Map
					ref={mapRef}
					mapContainerRef={mapContainerRef}
					showMap={true}
					onMapClick={handleMapClick}
					onMapZoom={handleMapZoom}
					onMapDragEnd={handleMapDragEnd}
					onMapLoad={handleMapLoad}
					maxZoom={secondaryMarkers.length > 0 ? 20 : undefined}
				>
					{showMapMarker && resultItem && (
						<MapMarker
							active={activeMarker}
							onClosePopUp={handleMarkerClose}
							onActivate={handleMarkerActivate}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							placeId={placeId}
							address={address}
							position={position}
							id={placeId}
							label={label}
							locationPopupConfig={apiPlaygroundItem.locationPopupConfig}
						/>
					)}
					{showLocalMarkers &&
						localMarkers.map(marker => (
							<MapMarker
								key={marker.id}
								active={false}
								onClosePopUp={() => setLocalMarkers(prev => prev.filter(m => m.id !== marker.id))}
								onActivate={() => {}}
								searchValue={searchValue}
								setSearchValue={setSearchValue}
								placeId={marker.id}
								address={{ Label: marker.label }}
								position={marker.position}
								id={marker.id}
								label={marker.label}
								locationPopupConfig={apiPlaygroundItem.locationPopupConfig}
							/>
						))}
					{secondaryMarkers.map(marker => (
						<RedMarker
							key={marker.id}
							active={marker.active || false}
							onClosePopUp={() => {
								setSecondaryMarkers(prev => prev.map(m => ({ ...m, active: false })));
							}}
							onActivate={() => {
								setActiveMarker(false);
								setSecondaryMarkers(prev => prev.map(m => ({ ...m, active: m.id === marker.id })));
							}}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							placeId={marker.placeId}
							address={marker.address}
							position={marker.position}
							id={marker.id}
							label={marker.label}
							locationPopupConfig={apiPlaygroundItem.locationPopupConfig}
						/>
					))}
					{!showMapMarker &&
						apiPlaygroundItem?.type === "geocode" &&
						suggestions?.list &&
						suggestions.list.length > 0 &&
						suggestions.list
							.filter(s => Array.isArray(s.position) && s.position.length === 2)
							.map(s => (
								<MapMarker
									key={s.id}
									active={activeSuggestionId === s.id}
									onClosePopUp={() => setActiveSuggestionId(undefined)}
									onActivate={() => {
										setActiveSuggestionId(s.id);
										setSearchValue(s.label || "");
									}}
									searchValue={searchValue}
									setSearchValue={setSearchValue}
									placeId={s.placeId || s.id}
									address={{ Label: s.label || "" }}
									position={s.position as number[]}
									id={s.id}
									label={s.label || ""}
									locationPopupConfig={apiPlaygroundItem.locationPopupConfig}
								/>
							))}
					{message && <HintMessage message={message} />}
					{mapLoaded && (
						<Flex className="panels-container">
							<CustomRequest
								onResponseReceived={handleCustomResponse}
								onReset={handleClose}
								mapContainerHeight={mapContainerHeight}
								urlState={urlState}
								setUrlState={setUrlState}
								handleReset={handleReset}
							/>
							<RequestSnippets
								response={customRequestStore.response}
								isFullScreen={isFullScreen}
								onFullScreenToggle={toggleFullScreen}
								isOpen={isSnippetsOpen}
								onToggle={toggleSnippets}
								onWidthChange={() => {
									applyStylesDebounced();
								}}
							/>
						</Flex>
					)}
				</Map>
			</View>
		</View>
	);
};

export default () => (
	<NuqsAdapter>
		<ApiPlaygroundDetailsPage />
	</NuqsAdapter>
);
