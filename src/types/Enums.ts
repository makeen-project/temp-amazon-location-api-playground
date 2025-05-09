/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export enum ToastType {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error"
}

export enum MapStyleEnum {
	STANDARD = "Standard",
	MONOCHROME = "Monochrome",
	HYBRID = "Hybrid",
	SATELLITE = "Satellite"
}

export enum MapColorSchemeEnum {
	LIGHT = "Light",
	DARK = "Dark"
}

export enum ApiIdEnum {
	GetMapTileCommand = "get-map-tile-command",
	SearchPlaceIndexForPositionCommand = "search-place-index-for-position-command",
	SearchPlaceIndexForSuggestionsCommand = "search-place-index-for-suggestions",
	SearchPlaceIndexForTextCommand = "search-place-index-for-text",
	CalculateRouteCommand = "calculate-route",
	GetGeofenceCommand = "get-geofence",
	ListGeofencesCommand = "list-geofences",
	DescribeTrackerCommand = "describe-tracker",
	GetDevicePositionCommand = "get-device-position"
}

export enum FieldTypeEnum {
	STRING_INPUT = "string-input",
	STRING_INPUT_ARRAY = "string-input-array",
	NUMBER_INPUT = "number-input",
	NUMBER_INPUT_ARRAY = "number-input-array",
	COORDINATES = "coordinates",
	COORDINATES_ARRAY = "coordinates-array",
	CHECKBOX = "checkbox",
	DROPDOWN = "dropdown",
	PARENT = "parent"
}
