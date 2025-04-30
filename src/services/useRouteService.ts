/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useClient } from "@api-playground/hooks";
import { CalculateRoutesCommand, CalculateRoutesCommandInput } from "@aws-sdk/client-geo-routes";

const useRouteService = () => {
	const { routesClient } = useClient();

	return useMemo(
		() => ({
			calculateRoutes: async (params: CalculateRoutesCommandInput) => {
				const input: CalculateRoutesCommandInput = {
					...params,
					LegGeometryFormat: "FlexiblePolyline",
					TravelStepType: "Default",
					LegAdditionalFeatures: ["TravelStepInstructions", "Summary"],
					MaxAlternatives: 0
				};
				const command = new CalculateRoutesCommand(input);
				return await routesClient?.send(command);
			}
		}),
		[routesClient]
	);
};

export default useRouteService;
