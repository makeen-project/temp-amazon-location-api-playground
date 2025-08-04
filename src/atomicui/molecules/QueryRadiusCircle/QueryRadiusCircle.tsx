/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { useEffect } from "react";

import { useCustomRequestStore } from "@api-playground/stores";
import { circle } from "@turf/turf";
import { Layer, MapRef, Source } from "react-map-gl/maplibre";

interface QueryRadiusCircleProps {
	mapRef: React.RefObject<MapRef>;
}

const QueryRadiusCircle: React.FC<QueryRadiusCircleProps> = ({ mapRef }) => {
	const { queryPosition, queryRadius, submittedQueryRadius, response } = useCustomRequestStore();

	const sourceId = "query-radius-circle-source";
	const layerId = "query-radius-circle-layer";

	useEffect(() => {
		const map = mapRef?.current?.getMap();
		if (!map) return;

		return () => {
			const currentMap = mapRef?.current?.getMap();
			if (!currentMap) return;

			if (typeof currentMap.getLayer === "function" && currentMap.getLayer(layerId)) {
				currentMap.removeLayer(layerId);
			}
			if (typeof currentMap.getSource === "function" && currentMap.getSource(sourceId)) {
				currentMap.removeSource(sourceId);
			}
		};
	}, [mapRef, sourceId, layerId]);

	if (
		!queryPosition ||
		queryPosition.length !== 2 ||
		!submittedQueryRadius ||
		submittedQueryRadius <= 0 ||
		!response ||
		queryRadius === null
	) {
		return null;
	}

	const [lng, lat] = queryPosition.map(Number);

	const radiusInKm = submittedQueryRadius / 1000;

	const circleFeature = circle([lng, lat], radiusInKm, {
		units: "kilometers",
		steps: 64
	});

	return (
		<Source id={sourceId} type="geojson" data={circleFeature}>
			<Layer
				id={layerId}
				type="fill"
				paint={{
					"fill-color": "#0073bb",
					"fill-opacity": 0.1,
					"fill-outline-color": "#0073bb"
				}}
			/>
		</Source>
	);
};

export default QueryRadiusCircle;
