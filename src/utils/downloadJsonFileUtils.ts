/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import appConfig from "@api-playground/core/constants/appConfig";

const {
	ENV: { API_PLAYGROUND_URL }
} = appConfig;

export const downloadJson = async (params: { path: string }) => {
	const bucketURL = `${API_PLAYGROUND_URL.trim()}/${params.path}`;

	const res = await fetch(bucketURL, {
		method: "get"
	});

	if (res.status > 399) {
		throw res;
	}

	if (res.status === 200) {
		return await res.json();
	}
};
