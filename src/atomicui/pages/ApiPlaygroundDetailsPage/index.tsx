/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback } from "react";

import Map from "@api-playground/atomicui/organisms/Map";
import { EventTypeEnum } from "@api-playground/types/Enums";
import { record } from "@api-playground/utils/record";
import { View } from "@aws-amplify/ui-react";
import { useParams } from "react-router-dom";
import "./styles.scss";

const ApiPlaygroundDetailsPage: FC = () => {
	const { apiId } = useParams();

	const handleMapClick = useCallback(
		(e: any) => {
			record([
				{
					EventType: EventTypeEnum.MAP_CLICKED,
					Attributes: {
						apiId,
						coordinates: [e.lngLat.lng, e.lngLat.lat]
					}
				}
			]);
		},
		[apiId]
	);

	const handleMapZoom = useCallback(
		(e: any) => {
			record([
				{
					EventType: EventTypeEnum.MAP_ZOOMED,
					Attributes: {
						apiId,
						zoom: e.viewState.zoom
					}
				}
			]);
		},
		[apiId]
	);

	const handleMapDragEnd = useCallback(
		(e: any) => {
			record([
				{
					EventType: EventTypeEnum.MAP_DRAGGED,
					Attributes: {
						apiId,
						coordinates: [e.viewState.longitude, e.viewState.latitude]
					}
				}
			]);
		},
		[apiId]
	);

	const handleMapLoad = useCallback(() => {
		record([
			{
				EventType: EventTypeEnum.MAP_LOADED,
				Attributes: { apiId }
			}
		]);
	}, [apiId]);

	return (
		<View className="api-playground-details-page">
			<View className="map-container" style={{ padding: 32 }}>
				<Map
					showMap={true}
					onMapClick={handleMapClick}
					onMapZoom={handleMapZoom}
					onMapDragEnd={handleMapDragEnd}
					onMapLoad={handleMapLoad}
				/>
			</View>
		</View>
	);
};

export default ApiPlaygroundDetailsPage;
