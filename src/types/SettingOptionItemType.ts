/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { SettingOptionEnum } from "@api-playground/types";

export type SettingOptionItemType = {
	id: SettingOptionEnum;
	title: string;
	defaultValue?: string;
	icon: JSX.Element;
	detailsComponent: JSX.Element;
};
