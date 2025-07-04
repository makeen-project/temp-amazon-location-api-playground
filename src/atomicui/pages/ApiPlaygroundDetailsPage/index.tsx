/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-comment-textnodes */
/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useEffect, useRef, useState } from "react";

import { IconBackArrow, IconShare } from "@api-playground/assets/svgs";
import { Content } from "@api-playground/atomicui/atoms/Content";
import { HintMessage } from "@api-playground/atomicui/atoms/HintMessage";
import { MapMarker } from "@api-playground/atomicui/molecules";
import CustomRequest from "@api-playground/atomicui/organisms/CustomRequest";
import Map, { MapRef } from "@api-playground/atomicui/organisms/Map";
import RequestSnippets from "@api-playground/atomicui/organisms/RequestSnippets";
import { useMap } from "@api-playground/hooks";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore } from "@api-playground/stores/useCustomRequestStore";
import { uuid } from "@api-playground/utils";
import { Button, Flex, Text, View } from "@aws-amplify/ui-react";
import { bbox, circle } from "@turf/turf";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";

const SNIPPETS_COLLAPSED_WIDTH = 400;
const SNIPPETS_EXPANDED_WIDTH = 750;

const ApiPlaygroundDetailsPage: FC = () => {
	useAuthManager();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const customRequestStore = useCustomRequestStore() as CustomRequestStore;
	const { setClickedPosition, clickedPosition } = useMap();

	const mapRef = useRef<MapRef | null>(null);
	const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const [activeMarker, setActiveMarker] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);

	const [searchValue, setSearchValue] = useState("");
	const [message, setMessage] = useState<string | undefined>(undefined);

	const resultItem = customRequestStore.response?.ResultItems?.[0];
	const position = resultItem?.Position || customRequestStore?.queryPosition?.map(Number);

	// Show marker when there's a response and valid position
	const showMapMarker =
		customRequestStore?.response && position?.length === 2 && position.every(coord => !isNaN(coord));

	const placeId = resultItem?.PlaceId || uuid.randomUUID();
	const label = resultItem?.Address?.Label || "Unknown location";
	const address = { Label: label };

	const navigate = useNavigate();

	const toggleFullScreen = useCallback(() => {
		setIsFullScreen(prev => !prev);
	}, [apiPlaygroundId, isFullScreen]);

	const handleMapClick = useCallback(
		(e: { lngLat: { lng: number; lat: number } }) => {
			const { lng, lat } = e.lngLat;
			// Update the clickedPosition in the map store
			setClickedPosition([lng, lat]);

			// Close active marker when map is clicked
			if (activeMarker) {
				setActiveMarker(false);
			}

			// Clear any existing timeout
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}

			// Set a new timeout to reset clickedPosition after 1.5 seconds
			resetTimeoutRef.current = setTimeout(() => {
				setClickedPosition([]);
			}, 1500);
		},
		[setClickedPosition, activeMarker]
	);

	const handleMapZoom = useCallback((e: any) => {}, [apiPlaygroundId]);
	const handleMapDragEnd = useCallback((e: any) => {}, [apiPlaygroundId]);

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
	}, [handleMarkerClose, handleMarkerToggle]);

	const handleCustomResponse = () => {
		// Get the latest position data from the store
		const resultItem = customRequestStore.response?.ResultItems?.[0];
		const currentPosition = resultItem?.Position || customRequestStore?.queryPosition?.map(Number);

		// Ensure position is valid before proceeding
		if (!currentPosition || currentPosition.length !== 2 || currentPosition.some(isNaN)) {
			console.warn("Invalid position data received");
			return;
		}

		setActiveMarker(true);

		const [lng, lat] = currentPosition;
		const queryRadius = customRequestStore.queryRadius;

		// Handle zoom behavior based on query radius
		try {
			if (queryRadius && queryRadius > 0) {
				// Create circle to get its bounding box
				const radiusInKm = queryRadius / 1000;
				const circleFeature = circle([lng, lat], radiusInKm, {
					units: "kilometers",
					steps: 64
				});

				// Get the bounding box of the circle
				const boundingBox = bbox(circleFeature);

				// Fit the map to the bounding box with some padding
				mapRef.current?.fitBounds(
					[
						[boundingBox[0], boundingBox[1]], // southwest
						[boundingBox[2], boundingBox[3]] // northeast
					],
					{
						padding: 50, // Add some padding around the circle
						duration: 2000, // Smooth animation
						essential: true
					}
				);
			} else {
				// Fallback to center on position with default zoom
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
		if (customRequestStore.response) {
			setTimeout(() => {
				handleCustomResponse();
			}, 500);
		}
	}, [customRequestStore.response, handleCustomResponse]);

	// Calculate missing required fields and message when customRequestStore or apiPlaygroundItem changes
	useEffect(() => {
		if (!apiPlaygroundItem) return;

		const requiredFields = (apiPlaygroundItem.formFields || []).filter((f: any) => f.required);
		const hasMissingRequired = requiredFields.some((f: any) => {
			const key = f.name as keyof CustomRequestStore;
			const val = customRequestStore[key];

			if (Array.isArray(val))
				return (
					val.length === 0 ||
					val.every(v => (typeof v === "string" ? v === "" || v === "0" : typeof v === "number" ? v === 0 : false))
				);
			if (typeof val === "string") return val === "" || val === "0";
			if (typeof val === "number") return val === 0;

			return val === undefined || val === null;
		});

		setMessage(hasMissingRequired ? apiPlaygroundItem.missingFieldsMessage : undefined);
	}, [customRequestStore, apiPlaygroundItem, clickedPosition]);

	useEffect(() => {
		if (customRequestStore.response) {
			handleCustomResponse();
		}
	}, [customRequestStore.response]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	if (!apiPlaygroundItem) {
		return <div className="api-playground-details-loading">Loading...</div>;
	}

	return (
		<NuqsAdapter>
			<View className="api-playground-details-page no-side-gaps">
				<Flex
					className="api-playground-header"
					direction="row"
					alignItems="flex-start"
					justifyContent="space-between"
					gap={"2rem"}
					style={{ padding: 32 }}
				>
					<Flex direction="column" flex={1} alignItems="flex-start" gap={"0.5rem"}>
						<Button className="back-button-link" variation="link" onClick={() => navigate(-1)}>
							<span className="back-button-content">
								<IconBackArrow className="back-arrow-icon" />
								Back
							</span>
						</Button>
						<Text as="h2" className="api-playground-title" fontWeight={700} fontSize="2rem">
							{apiPlaygroundItem.title}
						</Text>
						<Content
							items={[{ text: apiPlaygroundItem.description }]}
							className={`api-playground-description${descExpanded ? " expanded" : ""}`}
						/>
						<Button className="show-more-btn" variation="link" onClick={() => setDescExpanded(e => !e)}>
							{descExpanded ? "Show less" : "Show more"}
						</Button>
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
								{apiPlaygroundItem.relatedResources?.map((res: any, idx: number) => (
									<a key={idx} href={res.link} target="_blank" rel="noopener noreferrer">
										{res.text}
									</a>
								))}
							</View>
						</View>
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
						<CustomRequest onResponseReceived={handleCustomResponse} onReset={handleClose} />

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

						{/* Centralized message above the map */}
						{message && <HintMessage message={message} />}

						<RequestSnippets
							key={`snippets-${customRequestStore.response ? "with-response" : "no-response"}`}
							response={customRequestStore.response}
							width={isExpanded ? SNIPPETS_EXPANDED_WIDTH : SNIPPETS_COLLAPSED_WIDTH}
							onWidthChange={width => setIsExpanded(width === SNIPPETS_EXPANDED_WIDTH)}
							isFullScreen={isFullScreen}
							onFullScreenToggle={toggleFullScreen}
						/>
					</Map>
				</View>
			</View>
		</NuqsAdapter>
	);
};

export default ApiPlaygroundDetailsPage;
