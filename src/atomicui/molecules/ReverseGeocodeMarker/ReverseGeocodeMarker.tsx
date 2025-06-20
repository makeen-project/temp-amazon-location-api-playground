/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useState } from "react";

import { uuid } from "@api-playground/utils/uuid";
import { ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";

import { MapMarker } from "../MapMarker";

interface ReverseGeocodeMarkerProps {
	response?: ReverseGeocodeCommandOutput;
	position: number[];
	isActive: boolean;
	onClose: () => void;
	onToggle?: (isActive: boolean) => void;
}

const ReverseGeocodeMarker: FC<ReverseGeocodeMarkerProps> = ({ response, position, isActive, onClose, onToggle }) => {
	const [searchValue, setSearchValue] = useState("");

	const handleClose = useCallback(() => {
		onClose();
		onToggle?.(false);
	}, [onClose, onToggle]);

	if (!position || position.length !== 2) {
		return null;
	}

	const resultItem = response?.ResultItems?.[0];
	if (!resultItem) {
		return null;
	}

	const placeId = resultItem.PlaceId || uuid.randomUUID();
	const label = resultItem.Title || "Unknown location";
	const address = {
		Label: label
	};

	return (
		<MapMarker
			active={isActive}
			onClosePopUp={handleClose}
			searchValue={searchValue}
			setSearchValue={setSearchValue}
			placeId={placeId}
			address={address}
			position={position}
			id={placeId}
			label={label}
			locationPopupConfig={{
				showLatitude: true,
				showLongitude: true
			}}
		/>
	);
};

export default ReverseGeocodeMarker;
