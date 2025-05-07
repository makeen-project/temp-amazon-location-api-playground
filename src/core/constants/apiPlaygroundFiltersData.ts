/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const apiPlaygroundFiltersData: {
	key: "features" | "language" | "platform";
	title: string;
	options: {
		label: string;
		value: string;
	}[];
}[] = [
	{
		key: "language",
		title: "language.text",
		options: [
			{ label: "Maps", value: "Maps" },
			{ label: "Places", value: "Places" },
			{ label: "Routes", value: "Routes" },
			{ label: "Trackers", value: "Trackers" },
			{ label: "Geofences", value: "Geofences" }
		]
	}
];

export default apiPlaygroundFiltersData;
