/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useEffect, useState } from "react";

import { IconSelected, IconSuggestion } from "@api-playground/assets/svgs";
import { Popup } from "@api-playground/atomicui/molecules/Popup";
import { uuid } from "@api-playground/utils/uuid";
import { ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";
import { Marker } from "react-map-gl/maplibre";

interface ReverseGeocodeMarkerProps {
	response?: ReverseGeocodeCommandOutput;
	position: number[];
	isActive: boolean;
	onClose: () => void;
	onToggle?: (isActive: boolean) => void;
}

const ReverseGeocodeMarker: FC<ReverseGeocodeMarkerProps> = ({ response, position, isActive, onClose, onToggle }) => {
	const [isHovered, setIsHovered] = useState(false);

	const select = useCallback(
		async (id?: string) => {
			// Handle marker selection - could be used to show/hide popup
			if (!id) {
				onClose();
			}
		},
		[onClose]
	);

	if (!position || position.length !== 2) {
		return null;
	}

	return (
		<Marker
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				cursor: "pointer",
				zIndex: isActive || isHovered ? 2 : 1,
				textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff"
			}}
			clickTolerance={22}
			longitude={position[0]}
			latitude={position[1]}
			onClick={async e => {
				e.originalEvent.preventDefault();
				e.originalEvent.stopPropagation();
				// Toggle the popup state
				onToggle?.(!isActive);
			}}
		>
			{isActive || isHovered ? (
				<IconSelected />
			) : (
				<IconSuggestion onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)} />
			)}
			{isActive && response?.ResultItems?.[0] && (
				<Popup
					key={`popup-${response.ResultItems[0].PlaceId || "no-id"}-${response.ResultItems[0].Title || "no-title"}`}
					placeId={response.ResultItems[0].PlaceId || uuid.randomUUID()}
					position={position}
					label={response.ResultItems[0].Title}
					active={isActive}
					select={select}
					popupType="reverseGeocode"
					onClosePopUp={onClose}
				/>
			)}
		</Marker>
	);
};

export default ReverseGeocodeMarker;
