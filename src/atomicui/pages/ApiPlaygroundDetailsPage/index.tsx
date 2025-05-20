/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useState } from "react";

import Map from "@api-playground/atomicui/organisms/Map";
import { EventTypeEnum } from "@api-playground/types/Enums";
import { record } from "@api-playground/utils/record";
import { Button, View } from "@aws-amplify/ui-react";
import { useParams } from "react-router-dom";
import "./styles.scss";
import { FullScreenOff, FullScreenOn } from "@api-playground/assets/pngs";

const ApiPlaygroundDetailsPage: FC = () => {
	const { apiId } = useParams();
	const [isFullScreen, setIsFullScreen] = useState(false);

	const toggleFullScreen = useCallback(() => {
		setIsFullScreen(prev => !prev);
	}, [apiId, isFullScreen]);

	const handleMapClick = useCallback((e: any) => {}, [apiId]);
	const handleMapZoom = useCallback((e: any) => {}, [apiId]);
	const handleMapDragEnd = useCallback((e: any) => {}, [apiId]);
	const handleMapLoad = useCallback(() => {}, [apiId]);

	return (
		<View className="api-playground-details-page">
			<View className={`map-container ${isFullScreen ? "fullscreen" : ""}`} style={isFullScreen ? {} : { padding: 32 }}>
				<Map
					showMap={true}
					onMapClick={handleMapClick}
					onMapZoom={handleMapZoom}
					onMapDragEnd={handleMapDragEnd}
					onMapLoad={handleMapLoad}
					fullScreenButton={
						<Button className="fullscreen-button" onClick={toggleFullScreen}>
							<img src={isFullScreen ? FullScreenOff : FullScreenOn} style={{ width: 15, height: 15 }} />
						</Button>
					}
				/>
			</View>
		</View>
	);
};

export default ApiPlaygroundDetailsPage;
