/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { lazy } from "react";

import { appConfig } from "@demo/core/constants";
import { Navigate, RouteObject } from "react-router-dom";

const {
	ROUTES: { ERROR_BOUNDARY, DEFAULT, DEMO, API_PLAYGROUND, API_PLAYGROUND_DETAILS }
} = appConfig;

const DemoPage = lazy(() => import("@demo/atomicui/pages/DemoPage").then(module => ({ default: module.DemoPage })));
const ApiPlaygroundListPage = lazy(() =>
	import("@demo/atomicui/pages/ApiPlaygroundListPage").then(module => ({ default: module.ApiPlaygroundListPage }))
);
const ApiPlaygroundDetailsPage = lazy(() =>
	import("@demo/atomicui/pages/ApiPlaygroundDetailsPage").then(module => ({ default: module.ApiPlaygroundDetailsPage }))
);

const RouteChunks: RouteObject[] = [
	{
		path: DEFAULT,
		element: <Navigate to={DEMO} />
	},
	{
		path: DEMO,
		element: <DemoPage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	},
	{
		path: API_PLAYGROUND,
		element: <ApiPlaygroundListPage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	},
	{
		path: API_PLAYGROUND_DETAILS,
		element: <ApiPlaygroundDetailsPage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	}
];

export default RouteChunks;
