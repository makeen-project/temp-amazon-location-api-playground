/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

export const getFlagEmoji = (countryCode: string): string => {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map(char => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
};
