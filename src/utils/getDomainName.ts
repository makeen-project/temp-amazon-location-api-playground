/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

export const getDomainName = (url: string) => {
	const string = url?.startsWith("http://") || url.startsWith("https://") ? url.split("//")[1] : url;

	if (string.endsWith("/")) {
		return string.slice(0, -1);
	}

	return string;
};
