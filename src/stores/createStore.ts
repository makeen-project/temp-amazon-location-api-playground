/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import appConfig from "@api-playground/core/constants/appConfig";
import { BaseStateProps } from "@api-playground/types/BaseStateProps";
import { SetState, create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
const createStore = <T>(
	initialState: T,
	persistant = false,
	localStorageKey = appConfig.PERSIST_STORAGE_KEYS.LOCAL_STORAGE_PREFIX
) => {
	const createState = (set: SetState<T & BaseStateProps>) => {
		const init = {
			...initialState,
			set,
			setInitial: () => set(init)
		};

		return init;
	};

	/* @ts-expect-error: valid params */
	const createDataStore = persistant ? persist(createState, { name: localStorageKey }) : createState;
	/* @ts-expect-error: valid params */
	return create<T & BaseStateProps>(devtools(createDataStore));
};

export default createStore;
