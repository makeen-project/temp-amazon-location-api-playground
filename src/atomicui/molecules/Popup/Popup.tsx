/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IconClose, IconCopyPages, IconHashtag } from "@api-playground/assets/svgs";
import { useMap, usePlace } from "@api-playground/hooks";
import useDeviceMediaQuery from "@api-playground/hooks/useDeviceMediaQuery";
import { DistanceUnitEnum, MapUnitEnum } from "@api-playground/types";
import { ResponsiveUIEnum } from "@api-playground/types/Enums";
import { calculateGeodesicDistance } from "@api-playground/utils/geoCalculation";
import { Divider, Flex, Text, View } from "@aws-amplify/ui-react";
import { GetPlaceCommandOutput } from "@aws-sdk/client-geo-places";
import { CalculateRoutesCommandOutput } from "@aws-sdk/client-geo-routes";
import { Units } from "@turf/turf";
import { useTranslation } from "react-i18next";
import { Popup as PopupGl } from "react-map-gl/maplibre";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;

interface PopupProps {
	placeId: string;
	position: number[];
	label?: string;
	active: boolean;
	select: (id?: string) => Promise<void>;
	onClosePopUp?: () => void;
	popupType: "geocode" | "reverseGeocode";
}

const Popup: FC<PopupProps> = ({ placeId, position, label, active, select, onClosePopUp, popupType }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [routeData, setRouteData] = useState<CalculateRoutesCommandOutput>();
	const [placeData, setPlaceData] = useState<GetPlaceCommandOutput | undefined>(undefined);
	const [isExpanded, setIsExpanded] = useState(false);
	const { currentLocationData, viewpoint, mapUnit } = useMap();
	const { getPlaceData, clearPoiList } = usePlace();
	const { isDesktop } = useDeviceMediaQuery();
	const { t } = useTranslation();
	const POICardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(async () => {
			if (!placeData) {
				const pd = await getPlaceData(placeId);
				setPlaceData(pd);
			}
		})();
	}, [placeData, getPlaceData, placeId]);

	const geodesicDistance = useMemo(
		() =>
			calculateGeodesicDistance(
				currentLocationData?.currentLocation
					? [
							currentLocationData.currentLocation.longitude as number,
							currentLocationData.currentLocation.latitude as number
					  ]
					: [viewpoint.longitude, viewpoint.latitude],
				position,
				mapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			),
		[viewpoint, currentLocationData, position, mapUnit]
	);

	useEffect(() => {
		if (
			!routeData &&
			active &&
			!!currentLocationData?.currentLocation &&
			geodesicDistance &&
			geodesicDistance <= 2000
		) {
			(async () => {
				try {
					setIsLoading(true);
				} finally {
					setIsLoading(false);
				}
			})();
		}
	}, [active, currentLocationData, geodesicDistance, position, routeData]);

	const onClose = useCallback(
		async (ui: ResponsiveUIEnum) => {
			await select(undefined);
			onClosePopUp && onClosePopUp();
		},
		[isDesktop, select, onClosePopUp]
	);

	const onGetDirections = useCallback(() => {
		clearPoiList();

		if (!isDesktop) {
			onClose(ResponsiveUIEnum.direction_to_routes);
		}
	}, [clearPoiList, isDesktop, label, onClose, placeData, placeId, position]);

	const address = useMemo(() => {
		if (label) {
			const split = label.split(",");
			split.shift();
			return split.join(",").trim();
		} else {
			return `${position[1]}, ${position[0]}`;
		}
	}, [label, position]);

	const GeocodePopup = useCallback(
		() => (
			<Flex
				data-testid="poi-body"
				ref={POICardRef}
				className={!isDesktop ? "poi-only-container" : ""}
				direction="column"
			>
				<View className="popup-icon-close-container">
					<IconClose onClick={() => onClose(ResponsiveUIEnum.search)} />
				</View>
				{isDesktop && (
					<View className="triangle-container">
						<View />
					</View>
				)}
				<View className="info-container">
					<Text className="bold" variation="secondary" fontSize="20px" lineHeight="28px">
						{`${label?.split(",")[0]}`}
					</Text>
					<View className="address-container">
						<View>
							<Text variation="tertiary">{address}</Text>
						</View>
						{isDesktop && (
							<IconCopyPages
								data-testid="copy-icon"
								className="copy-icon"
								onClick={() => navigator.clipboard.writeText(`${label?.split(",")[0]}` + ", " + address)}
							/>
						)}
					</View>
					<Divider />
					<View>
						<View className="coordinate-row">
							<IconHashtag />
							<View className="coordinate-label">Latitude</View>
							<View className="coordinate-value">{position[0]}</View>
						</View>
						<View className="coordinate-row">
							<IconHashtag />
							<View className="coordinate-label">Longitude</View>
							<View className="coordinate-value">{position[1]}</View>
						</View>
					</View>
				</View>
			</Flex>
		),
		[isDesktop, label, address, onGetDirections, t, onClose]
	);

	const ReverseGeocodePopup = useCallback(
		() => (
			<Flex
				data-testid="poi-body"
				ref={POICardRef}
				className={!isDesktop ? "poi-only-container" : ""}
				direction="column"
			>
				<View className="popup-icon-close-container">
					<IconClose onClick={() => onClose(ResponsiveUIEnum.search)} />
				</View>
				{isDesktop && (
					<View className="triangle-container">
						<View />
					</View>
				)}
				<View className="info-container">
					<Text className="bold" variation="secondary" fontSize="20px" lineHeight="28px">
						{`${label?.split(",")[0]}`}
					</Text>
					<View className="address-container">
						<View>
							<Text variation="tertiary">{address}</Text>
						</View>
						{isDesktop && (
							<IconCopyPages
								data-testid="copy-icon"
								className="copy-icon"
								onClick={() => navigator.clipboard.writeText(`${label?.split(",")[0]}` + ", " + address)}
							/>
						)}
					</View>
					<Divider />
					<View>
						<View className="coordinate-row">
							<IconHashtag />
							<View className="coordinate-label">Place ID</View>
							<View className="coordinate-value capped-text">{placeId}</View>
						</View>
						<View className="coordinate-row">
							<IconHashtag />
							<View className="coordinate-label">Latitude</View>
							<View className="coordinate-value">{position[0]}</View>
						</View>
						<View className="coordinate-row">
							<IconHashtag />
							<View className="coordinate-label">Longitude</View>
							<View className="coordinate-value">{position[1]}</View>
						</View>
					</View>
				</View>
			</Flex>
		),
		[isDesktop, label, address, onGetDirections, t, onClose]
	);

	// Select popup component based on popupType
	let PopupComponent;
	switch (popupType) {
		case "reverseGeocode":
			PopupComponent = ReverseGeocodePopup;
			break;
		case "geocode":
		default:
			PopupComponent = GeocodePopup;
			break;
	}

	if (isDesktop) {
		return (
			<PopupGl
				data-testid="popup-container"
				className="popup-container"
				closeButton={false}
				anchor={isDesktop ? "left" : "bottom"}
				offset={active ? 27 : 22}
				style={{ maxWidth: isDesktop ? "28.62rem" : "20rem", width: "100%" }}
				longitude={position[0]}
				latitude={position[1]}
			>
				<PopupComponent />
			</PopupGl>
		);
	} else {
		return null;
	}
};

export default memo(Popup);
