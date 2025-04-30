import { LngLatBoundsLike } from "maplibre-gl";

const tileToLonLat = (zoom: number, xtile: number, ytile: number) => {
	const n = Math.pow(2, zoom);
	const lon_deg = (xtile / n) * 360.0 - 180.0;
	const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - (2 * ytile) / n)));
	const lat_deg = (lat_rad * 180.0) / Math.PI;
	return [lon_deg, lat_deg];
};

export const getTileBounds = (zoom: number, xtile: number, ytile: number) => {
	const upperLeft = tileToLonLat(zoom, xtile, ytile);
	const lowerRight = tileToLonLat(zoom, xtile + 1, ytile + 1);
	return [...upperLeft, ...lowerRight] as LngLatBoundsLike;
};
