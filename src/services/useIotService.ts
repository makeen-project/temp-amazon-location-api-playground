/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useClient } from "@api-playground/hooks";
import { AttachPolicyRequest } from "@aws-sdk/client-iot";

const useIotService = () => {
	const { iotClient } = useClient();

	return useMemo(
		() => ({
			attachPolicy: async (identityId: string) => {
				const params: AttachPolicyRequest = {
					policyName: "AmazonLocationIotPolicyUnauth",
					target: identityId
				};

				return await iotClient?.attachPolicy(params);
			},
			detachPolicy: async (identityId: string) => {
				const params: AttachPolicyRequest = {
					policyName: "AmazonLocationIotPolicyUnauth",
					target: identityId
				};

				return await iotClient?.detachPolicy(params);
			}
		}),
		[iotClient]
	);
};

export default useIotService;
