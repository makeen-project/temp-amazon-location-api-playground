/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { lazy } from "react";

import { appConfig } from "@api-playground/core/constants";
import { Navigate, RouteObject } from "react-router-dom";

const {
	ROUTES: { ERROR_BOUNDARY, DEFAULT, API_PLAYGROUND, API_PLAYGROUND_DETAILS }
} = appConfig;

const ApiPlaygroundListPage = lazy(() =>
	import("@api-playground/atomicui/pages/ApiPlaygroundListPage").then(module => ({
		default: module.ApiPlaygroundListPage
	}))
);

const RouteChunks: RouteObject[] = [
	{
		path: DEFAULT,
		element: <Navigate to={API_PLAYGROUND} />
	},
	{
		path: API_PLAYGROUND,
		element: <ApiPlaygroundListPage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	}
];

export default RouteChunks;
