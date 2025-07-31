/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { IStateProps } from "@api-playground/types";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { GeoRoutesClient } from "@aws-sdk/client-geo-routes";
import { IoT } from "@aws-sdk/client-iot";
import { Location } from "@aws-sdk/client-location";

import createStore from "./createStore";

export interface ClientStoreProps {
	locationClient?: Location;
	iotClient?: IoT;
	placesClient?: GeoPlacesClient;
	routesClient?: GeoRoutesClient;
}

export const initialState: IStateProps<ClientStoreProps> = {};

export default createStore<ClientStoreProps>(initialState);
