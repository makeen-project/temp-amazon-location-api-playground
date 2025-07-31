/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { FieldTypeEnum } from "./Enums";

export type RequestParam = {
	name: string;
	description: string;
	required: boolean;
	type: string;
	defaultValue: string | number | boolean | null;
	validValues: string[] | number[] | boolean[] | null;
	visibleIf: string[] | null;
	shouldRender: boolean;
	isEditable: boolean;
	subParams: string[] | null;
	fieldType: FieldTypeEnum;
};

export type ApiListItem = {
	id: string;
	imageSource: string;
	title: string;
	description: string;
	shouldRenderMap: boolean;
	requestParams: RequestParam[];
	codeSnippets: {
		[key: string]: string;
	};
};

export type ApiListData = {
	[key: string]: ApiListItem[];
};

export type ApiRequestObjValues = string | string[] | number | number[] | number[][] | boolean | {} | undefined;

export type ApiRequestObj = { [key: string]: ApiRequestObjValues };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TODO = any;
