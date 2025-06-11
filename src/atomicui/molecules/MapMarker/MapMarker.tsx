/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";

import { IconSelected, IconSuggestion } from "@api-playground/assets/svgs";
import { Popup } from "@api-playground/atomicui/molecules";
import { usePlace } from "@api-playground/hooks";
import { SuggestionType } from "@api-playground/types";
import { View } from "@aws-amplify/ui-react";
import { GetPlaceCommandOutput } from "@aws-sdk/client-geo-places";
import { Marker } from "react-map-gl/maplibre";

interface Props extends SuggestionType {
	active?: boolean;
	onClosePopUp?: () => void;
	searchValue: string;
	setSearchValue: (v: string) => void;
	placeId: string;
	address: {
		Label: string;
	};
	position: number[];
	id: string;
	label: string;
	popupType?: "geocode" | "reverseGeocode";
}

const MapMarker: FC<Props> = ({
	active,
	onClosePopUp,
	searchValue,
	setSearchValue,
	placeId,
	address,
	position,
	id,
	label,
	popupType
}) => {
	const { setSelectedMarker, suggestions, hoveredMarker, setHoveredMarker, clearPoiList } = usePlace();

	const [info, setInfo] = useState<SuggestionType>({ placeId, address, position, id, label });

	useEffect(() => {
		if (info.address?.Label && active && !!searchValue) {
			setSearchValue(info.address?.Label);
		}
	}, [info, active, searchValue, setSearchValue]);

	const select = useCallback(
		async (id?: string) => {
			if (id) {
				const selectedMarker = suggestions?.list.find((s: { id: string }) => s.id === id);
				await setSelectedMarker(selectedMarker);
			} else {
				await setSelectedMarker(undefined);
			}
		},
		[suggestions, setSelectedMarker]
	);

	const markerDescription = useMemo(() => {
		const string = info?.address?.Label || info.label || "";
		return string?.split(",")[0];
	}, [info?.address?.Label, info.label]);

	const isHovered = useMemo(
		() =>
			hoveredMarker && (hoveredMarker.placeId ? hoveredMarker.placeId === info.placeId : hoveredMarker.id === info.id),
		[hoveredMarker, info.id, info.placeId]
	);

	const setHover = useCallback(
		(marker: SuggestionType) => {
			setHoveredMarker(marker);
		},
		[setHoveredMarker]
	);

	// position
	if (info && info?.position) {
		return (
			<Marker
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					cursor: "pointer",
					zIndex: active || isHovered ? 2 : 1,
					textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff"
				}}
				clickTolerance={22}
				longitude={info.position[0]}
				latitude={info.position[1]}
				onClick={async e => {
					e.originalEvent.preventDefault();
					e.originalEvent.stopPropagation();
					await select(info.id);
				}}
			>
				{active || isHovered ? <IconSelected /> : <IconSuggestion onMouseOver={() => setHover(info)} />}
				{active ? (
					<Popup
						placeId={info.placeId!}
						position={info.position!}
						label={info.label}
						active={active}
						select={select}
						popupType={popupType || "geocode"}
						onClosePopUp={
							suggestions?.list.length === 1
								? () => {
										clearPoiList();
										setSearchValue("");
								  }
								: onClosePopUp
						}
					/>
				) : (
					<View
						style={{
							position: "absolute",
							width: "150px",
							top: "12px",
							left: "50px"
						}}
					>
						{markerDescription}
					</View>
				)}
			</Marker>
		);
	} else {
		return null;
	}
};

export default memo(MapMarker);
