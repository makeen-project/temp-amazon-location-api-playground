/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { Session } from "@aws-sdk/client-pinpoint";

import { EventTypeEnum } from "./Enums";

type RecordInput = {
	// AppPackageName?: string;
	// AppTitle?: string;
	// AppVersionCode?: string;
	Attributes?: {
		[key: string]: string;
	};
	// ClientSdkVersion?: string;
	EventType: EventTypeEnum;
	// EventType: string;
	// Metrics?: {
	// 	[key: string]: number;
	// };
	// SdkName?: string;
	Session?: Session;
	Timestamp?: string | undefined;
};

export default RecordInput;
