/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect } from "react";

import { useCustomRequestStore } from "@api-playground/stores";
import { bbox, circle } from "@turf/turf";
import { Layer, MapRef, Source } from "react-map-gl/maplibre";

interface QueryRadiusCircleProps {
	mapRef: React.RefObject<MapRef>;
}

const QueryRadiusCircle: React.FC<QueryRadiusCircleProps> = ({ mapRef }) => {
	const { queryPosition, queryRadius, submittedQueryRadius, response } = useCustomRequestStore();

	const sourceId = "query-radius-circle-source";
	const layerId = "query-radius-circle-layer";

	// Remove existing source and layer when component unmounts or dependencies change
	useEffect(() => {
		const map = mapRef?.current?.getMap();
		if (!map) return;

		const cleanup = () => {
			// Get a fresh reference to the map inside cleanup
			const currentMap = mapRef?.current?.getMap();
			if (!currentMap) return;

			// Safely check if map exists and has the required methods
			if (typeof currentMap.getLayer === "function" && currentMap.getLayer(layerId)) {
				currentMap.removeLayer(layerId);
			}
			if (typeof currentMap.getSource === "function" && currentMap.getSource(sourceId)) {
				currentMap.removeSource(sourceId);
			}
		};

		return cleanup;
	}, [mapRef, sourceId, layerId]);

	// Zoom to fit the circle when position or radius changes, but only if there's no response yet
	useEffect(() => {
		const map = mapRef?.current?.getMap();
		if (
			!map ||
			!queryPosition ||
			queryPosition.length !== 2 ||
			!submittedQueryRadius ||
			submittedQueryRadius <= 0 ||
			!response
		) {
			return;
		}

		const [lng, lat] = queryPosition.map(Number);
		const radiusInKm = submittedQueryRadius / 1000;

		// Create circle to get its bounding box
		const circleFeature = circle([lng, lat], radiusInKm, {
			units: "kilometers",
			steps: 64
		});

		// Get the bounding box of the circle
		const boundingBox = bbox(circleFeature);

		// Fit the map to the bounding box with some padding
		map.fitBounds(
			[
				[boundingBox[0], boundingBox[1]], // southwest
				[boundingBox[2], boundingBox[3]] // northeast
			],
			{
				padding: 50, // Add some padding around the circle
				duration: 1000, // Smooth animation
				essential: true
			}
		);
	}, [mapRef, queryPosition, submittedQueryRadius, response, queryRadius]);

	// Don't render if we don't have position or radius or if there's no response
	// Also don't render if queryRadius is null (disabled) or if there's no response
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

	// Convert radius from meters to kilometers for turf.circle
	const radiusInKm = submittedQueryRadius / 1000;

	// Create circle using turf.js
	const circleFeature = circle([lng, lat], radiusInKm, {
		units: "kilometers",
		steps: 64 // Number of points to create the circle
	});

	return (
		<>
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
		</>
	);
};

export default QueryRadiusCircle;
