/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { createParser, useQueryStates } from "nuqs";

export function useUrlState<T extends object>(defaultValue: T) {
	const [state, setState] = useQueryStates(
		Object.entries(defaultValue).reduce((acc, [key, value]) => {
			acc[key] = createParser({
				parse: (query: string) => {
					try {
						return query ? JSON.parse(query) : value;
					} catch (e) {
						return value;
					}
				},
				serialize: (val: unknown) => {
					try {
						return JSON.stringify(val ?? value);
					} catch (e) {
						return JSON.stringify(value);
					}
				}
			});
			return acc;
		}, {} as Record<string, ReturnType<typeof createParser>>),
		{
			history: "push",
			shallow: false,
			throttleMs: 0
		}
	);

	function resetUrlState() {
		const resetState = Object.keys(defaultValue).reduce((acc, key) => {
			acc[key] = undefined;
			return acc;
		}, {} as Record<string, undefined>);
		setState(resetState);
	}

	return {
		urlState: state,
		setUrlState: setState,
		shareableUrl: window.location.href,
		resetUrlState
	};
}
