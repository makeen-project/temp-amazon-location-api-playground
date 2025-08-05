/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IconBackArrow, IconShare } from "@api-playground/assets/svgs";
import { Content } from "@api-playground/atomicui/atoms/Content";
import { HintMessage } from "@api-playground/atomicui/atoms/HintMessage";
import { MapMarker } from "@api-playground/atomicui/molecules";
import CustomRequest from "@api-playground/atomicui/organisms/CustomRequest";
import Map, { MapRef } from "@api-playground/atomicui/organisms/Map";
import RequestSnippets from "@api-playground/atomicui/organisms/RequestSnippets";
import { useMap, usePlace } from "@api-playground/hooks";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore, initialState } from "@api-playground/stores/useCustomRequestStore";
import { uuid } from "@api-playground/utils";
import { debounce } from "@api-playground/utils/debounce";
import { Button, Flex, Text, View } from "@aws-amplify/ui-react";
import { bbox, circle } from "@turf/turf";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";

const ApiPlaygroundDetailsPage: FC = () => {
	useAuthManager();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const customRequestStore = useCustomRequestStore() as CustomRequestStore;
	const { setState } = useCustomRequestStore;

	const { setClickedPosition, clickedPosition } = useMap();
	const { clearPoiList, setSelectedMarker } = usePlace();

	const mapRef = useRef<MapRef | null>(null);
	const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const [activeMarker, setActiveMarker] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [isSnippetsOpen, setIsSnippetsOpen] = useState(true);
	const isSnippetsOpenRef = useRef(isSnippetsOpen);

	const [searchValue, setSearchValue] = useState("");
	const [message, setMessage] = useState<string | undefined>(undefined);
	const [isCoordinatePickingDisabled, setIsCoordinatePickingDisabled] = useState(false);

	const [localMarkers, setLocalMarkers] = useState<
		Array<{
			position: [number, number];
			id: string;
			label: string;
		}>
	>([]);

	const resultItem = customRequestStore.response?.ResultItems?.[0];
	const position = resultItem?.Position;

	const showMapMarker =
		customRequestStore?.response && position?.length === 2 && position.every(coord => !isNaN(coord));

	const showLocalMarkers = localMarkers.length > 0 && !showMapMarker && apiPlaygroundItem?.showLocalMarkerOnMapClick;

	const placeId = resultItem?.PlaceId || uuid.randomUUID();
	const label = resultItem?.Address?.Label || "Unknown location";
	const address = { Label: label };

	const navigate = useNavigate();

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

	const handleMapZoom = useCallback(() => {}, [apiPlaygroundId]);
	const handleMapDragEnd = useCallback(() => {}, [apiPlaygroundId]);

	const handleMarkerActivate = useCallback(() => {
		setActiveMarker(true);
	}, []);

	const handleMarkerClose = useCallback(() => {
		setActiveMarker(false);
	}, []);

	const handleMarkerToggle = useCallback((isActive: boolean) => {
		setActiveMarker(isActive);
	}, []);

	const handleClose = useCallback(() => {
		handleMarkerClose();
		handleMarkerToggle?.(false);
		setState({ ...initialState, query: "", response: undefined });
		setLocalMarkers([]);
		setIsCoordinatePickingDisabled(false);
		if (resetTimeoutRef.current) {
			clearTimeout(resetTimeoutRef.current);
		}
	}, [handleMarkerClose, handleMarkerToggle]);

	const handleCustomResponse = () => {
		const resultItem = customRequestStore.response?.ResultItems?.[0];
		const currentPosition = resultItem?.Position;

		if (!currentPosition || currentPosition.length !== 2 || currentPosition.some(isNaN)) {
			console.warn("Invalid position data received");
			return;
		}

		setLocalMarkers([]);
		setActiveMarker(true);
		setIsCoordinatePickingDisabled(true);

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
					center: [lng + 0.0076, lat - 0.003],
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
		} else {
			setIsCoordinatePickingDisabled(false);
		}
	}, [customRequestStore.response]);

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

	if (!apiPlaygroundItem) {
		return <div className="api-playground-details-loading">Loading...</div>;
	}

	return (
		<NuqsAdapter>
			<View className="api-playground-details-page no-side-gaps">
				<Flex className="api-playground-header">
					<Flex direction="column" flex={1} alignItems="flex-start" gap={"0.5rem"}>
						<Button className="back-button-link" variation="link" onClick={() => navigate("/api-playground")}>
							<span className="back-button-content">
								<IconBackArrow className="back-arrow-icon" />
								Back
							</span>
						</Button>
						<Text as="h2" className="api-playground-title" fontWeight={700} fontSize="2rem">
							{apiPlaygroundItem.title}
						</Text>
					</Flex>
					<Flex direction="row" gap={"2rem"} justifyContent="space-between" alignItems="flex-start">
						<View>
							<Content
								items={[{ text: apiPlaygroundItem.description }]}
								className={`api-playground-description${descExpanded ? " expanded" : ""}`}
							/>
							<Button className="show-more-btn" variation="link" onClick={() => setDescExpanded(e => !e)}>
								{descExpanded ? "Show less" : "Show more"}
							</Button>
						</View>
						<Flex>
							{/* Right column */}
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
				</Flex>
				<View
					className={`map-container ${isFullScreen ? "fullscreen" : ""}`}
					style={isFullScreen ? {} : { padding: 32 }}
				>
					<Map
						ref={mapRef}
						showMap={true}
						onMapClick={handleMapClick}
						onMapZoom={handleMapZoom}
						onMapDragEnd={handleMapDragEnd}
						onMapLoad={handleMapLoad}
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
						{message && <HintMessage message={message} />}
						{mapLoaded && (
							<Flex className="panels-container">
								<CustomRequest onResponseReceived={handleCustomResponse} onReset={handleClose} mapRef={mapRef} />
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
		</NuqsAdapter>
	);
};

export default ApiPlaygroundDetailsPage;