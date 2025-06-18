/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { lazy } from "react";

import { Navigate, RouteObject } from "react-router-dom";

import appConfig from "../constants/appConfig";

const {
	ROUTES: { ERROR_BOUNDARY, DEFAULT, API_PLAYGROUND, API_PLAYGROUND_DETAILS, TESTING }
} = appConfig;

const ApiPlaygroundListPage = lazy(() => import("@api-playground/atomicui/pages/ApiPlaygroundListPage"));
const ApiPlaygroundDetailsPage = lazy(() => import("@api-playground/atomicui/pages/ApiPlaygroundDetailsPage"));
const TestingPage = lazy(() => import("@api-playground/atomicui/pages/TestingPage"));

const RouteChunks: RouteObject[] = [
	{
		path: DEFAULT,
		element: <Navigate to={API_PLAYGROUND} />
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
	},
	{
		path: TESTING,
		element: <TestingPage />
	}
];

export default RouteChunks;
