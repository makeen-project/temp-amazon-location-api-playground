/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@api-playground/types/StateOf";

import createStore from "./createStore";

export interface ApiPlaygroundStoreProps {
	isLoading: boolean;
	request?: string;
	response?: string;
}

export const initialState: IStateProps<ApiPlaygroundStoreProps> = {
	isLoading: false,
	request: undefined,
	response: undefined
};

export default createStore<ApiPlaygroundStoreProps>(initialState);
