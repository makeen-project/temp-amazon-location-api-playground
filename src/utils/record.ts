/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { EventTypeEnum } from "@api-playground/types/Enums";

interface EventAttributes {
	apiId?: string;
	coordinates?: [number, number];
	zoom?: number;
	error?: string;

	[key: string]: any; // For any additional attributes that might be needed
}

interface Event {
	EventType: EventTypeEnum;
	Attributes: EventAttributes;
}

export const record = (events: Event[]) => {
	// TODO: Implement actual event tracking
	console.log("Events recorded:", events);
};
