import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";
import { appConfig } from "@demo/core/constants";
import { useAwsMap } from "@demo/hooks";
import { HereMapEnum } from "@demo/types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.scss";

const {
	ENV: { API_PLAYGROUND_IDENTITY_POOL_ID },
	MAP_RESOURCES: { AMAZON_HQ }
} = appConfig;

interface MapProps {
	useFixedMapName?: boolean;
}

const Map: FC<MapProps> = ({ useFixedMapName = false }) => {
	const mapRef = useRef<maplibregl.Map | null>(null);
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const [showGridLoader, setShowGridLoader] = useState(true);
	const { setMapRef } = useAwsMap();
	const mapName = useMemo(
		() => (useFixedMapName ? "location.aws.com.api.playground.maps.HERE.Explore" : HereMapEnum.HERE_EXPLORE),
		[useFixedMapName]
	);

	const onLoad = useCallback(() => {
		setShowGridLoader(false);
	}, []);

	const initMap = useCallback(async () => {
		if (!mapRef.current) {
			/* Create an authentication helper instance using credentials from Cognito */
			const authHelper = await withIdentityPoolId(API_PLAYGROUND_IDENTITY_POOL_ID);

			/* Create a new map instance */
			mapRef.current = new maplibregl.Map({
				container: (mapContainer.current as HTMLElement) || "map",
				center: [AMAZON_HQ.US.longitude, AMAZON_HQ.US.latitude],
				zoom: 10,
				renderWorldCopies: false,
				style: `https://maps.geo.${
					API_PLAYGROUND_IDENTITY_POOL_ID.split(":")[0]
				}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor`,
				...authHelper.getMapAuthenticationOptions()
			});

			/* Add the onLoad event listener */
			mapRef.current.on("load", onLoad);

			setMapRef(mapRef.current);
		}
	}, [mapName, onLoad, setMapRef]);

	useEffect(() => {
		initMap();
	}, [initMap]);

	return (
		<div className="map-wrapper">
			<div id="map" ref={mapContainer} className={showGridLoader ? "loader-container" : "map"} />
		</div>
	);
};

export default Map;
