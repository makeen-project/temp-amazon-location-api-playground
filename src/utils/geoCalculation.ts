/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import turfHaversineDistance from "@turf/distance";
import { Coord, Units } from "@turf/turf";

const pattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

export const isGeoString = (v: string): boolean => {
	return pattern.test(v);
};

// get precision by zoom level
export const getPrecision = (zoom: number, def = 10): number => {
	switch (Math.round(zoom)) {
		case 16: {
			return 10;
		}
		case 15: {
			return 9;
		}
		case 14: {
			return 8;
		}
		case 13: {
			return 6;
		}
		case 12: {
			return 6;
		}
		case 11: {
			return 5;
		}
		case 10: {
			return 4;
		}
		case 9: {
			return 4;
		}
		case 7: {
			return 3;
		}
		case 5: {
			return 2;
		}
		case 3: {
			return 1;
		}
		default: {
			return def;
		}
	}
};

export const calculateGeodesicDistance = (start: Coord, end: Coord, units: Units) => {
	const geodesicDistance = turfHaversineDistance(start, end, { units });
	return isNaN(geodesicDistance) ? undefined : parseFloat(geodesicDistance.toFixed(2));
};
