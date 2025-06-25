/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-comment-textnodes */
/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useRef, useState } from "react";

import { IconBackArrow } from "@api-playground/assets/svgs";
import { Content } from "@api-playground/atomicui/atoms/Content";
import { MapMarker } from "@api-playground/atomicui/molecules";
import CustomRequest from "@api-playground/atomicui/organisms/CustomRequest";
import Map, { MapRef } from "@api-playground/atomicui/organisms/Map";
import RequestSnippets from "@api-playground/atomicui/organisms/RequestSnippets";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useCustomRequestStore } from "@api-playground/stores";
import { uuid } from "@api-playground/utils";
import { Button, Flex, Text, View } from "@aws-amplify/ui-react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";

const SNIPPETS_COLLAPSED_WIDTH = 400;
const SNIPPETS_EXPANDED_WIDTH = 750;

const ApiPlaygroundDetailsPage: FC = () => {
	useAuthManager();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const customRequestStore = useCustomRequestStore();

	const mapRef = useRef<MapRef | null>(null);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const [activeMarker, setActiveMarker] = useState(false);

	const [searchValue, setSearchValue] = useState("");

	const resultItem = customRequestStore.response?.ResultItems?.[0];
	const position = resultItem?.Position || customRequestStore?.queryPosition?.map(Number);

	// Show marker when there's a response
	const showMapMarker = customRequestStore?.response && (position?.length === 2 || position?.length === 2);

	const placeId = resultItem?.PlaceId || uuid.randomUUID();
	const label = resultItem?.Address?.Label || "Unknown location";
	const address = { Label: label };

	const navigate = useNavigate();

	const toggleFullScreen = useCallback(() => {
		setIsFullScreen(prev => !prev);
	}, [apiPlaygroundId, isFullScreen]);

	const handleMapClick = useCallback((e: any) => {}, [apiPlaygroundId]);
	const handleMapZoom = useCallback((e: any) => {}, [apiPlaygroundId]);
	const handleMapDragEnd = useCallback((e: any) => {}, [apiPlaygroundId]);
	const handleMapLoad = useCallback(() => {}, [apiPlaygroundId]);

	const handleMarkerClose = useCallback(() => {
		setActiveMarker(false);
	}, []);

	const handleMarkerToggle = useCallback((isActive: boolean) => {
		setActiveMarker(isActive);
	}, []);

	const handleCustomResponse = useCallback(() => {
		setActiveMarker(true);

		// Fly to the marker
		if (position?.length === 2) {
			const [lng, lat] = position;
			mapRef.current?.flyTo({
				center: [lng, lat],
				zoom: 15,
				duration: 2000
			});
		}
	}, [position]);

	const handleClose = useCallback(() => {
		handleMarkerClose();
		handleMarkerToggle?.(false);
	}, [handleMarkerClose, handleMarkerToggle]);

	if (!apiPlaygroundItem) {
		return <div className="api-playground-details-loading">Loading...</div>;
	}

	return (
		<NuqsAdapter>
			<View className="api-playground-details-page">
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
							<span className="share-icon">🔗</span>Share
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
						<CustomRequest onResponseReceived={handleCustomResponse} />

						{showMapMarker && resultItem && (
							<MapMarker
								active={activeMarker}
								onClosePopUp={handleClose}
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
