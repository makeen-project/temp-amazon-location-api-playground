/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useState } from "react";

import { FullScreenOff, FullScreenOn } from "@api-playground/assets/pngs";
import { IconBackArrow } from "@api-playground/assets/svgs";
import { Content } from "@api-playground/atomicui/atoms/Content";
import { MapMarker } from "@api-playground/atomicui/molecules";
import { AutoCompleteLatLonInput } from "@api-playground/atomicui/molecules/AutoCompleteLatLonInput";
import Map from "@api-playground/atomicui/organisms/Map";
import RequestSnippets from "@api-playground/atomicui/organisms/RequestSnippets";
import ReverseGeocodeRequest from "@api-playground/atomicui/organisms/ReverseGeocodeRequest";
import { usePlace } from "@api-playground/hooks";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { Button, Flex, Heading, Text, View } from "@aws-amplify/ui-react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";

const SNIPPETS_COLLAPSED_WIDTH = 400;
const SNIPPETS_EXPANDED_WIDTH = 750;

const ApiPlaygroundDetailsPage: FC = () => {
	const { apiId } = useParams();
	const {} = useAuthManager();
	const { selectedMarker, suggestions } = usePlace();

	const apiPlaygroundItem = useApiPlaygroundItem(apiId);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const navigate = useNavigate();

	const toggleFullScreen = useCallback(() => {
		setIsFullScreen(prev => !prev);
	}, [apiId, isFullScreen]);

	const handleMapClick = useCallback((e: any) => {}, [apiId]);
	const handleMapZoom = useCallback((e: any) => {}, [apiId]);
	const handleMapDragEnd = useCallback((e: any) => {}, [apiId]);
	const handleMapLoad = useCallback(() => {}, [apiId]);

	if (!apiPlaygroundItem) {
		return <div className="api-playground-details-loading">Loading...</div>;
	}

	return (
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
						items={[{ text: apiPlaygroundItem.brief }]}
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
			<View className={`map-container ${isFullScreen ? "fullscreen" : ""}`} style={isFullScreen ? {} : { padding: 32 }}>
				<Map
					showMap={true}
					onMapClick={handleMapClick}
					onMapZoom={handleMapZoom}
					onMapDragEnd={handleMapDragEnd}
					onMapLoad={handleMapLoad}
				>
					<ReverseGeocodeRequest />
					<RequestSnippets
						width={isExpanded ? SNIPPETS_EXPANDED_WIDTH : SNIPPETS_COLLAPSED_WIDTH}
						onWidthChange={width => setIsExpanded(width === SNIPPETS_EXPANDED_WIDTH)}
						isFullScreen={isFullScreen}
						onFullScreenToggle={toggleFullScreen}
					/>

					{suggestions?.list.map((s: any) => (
						<MapMarker
							id={s.id}
							key={s.id}
							label={s.label}
							active={selectedMarker?.id === s.id}
							searchValue={"desc"}
							placeId={s.placeId}
							address={s.address}
							position={s.position}
							setSearchValue={function (v: string): void {}}
							locationPopupConfig={apiPlaygroundItem.locationPopupConfig}
						/>
					))}
				</Map>
			</View>
		</View>
	);
};

export default ApiPlaygroundDetailsPage;
