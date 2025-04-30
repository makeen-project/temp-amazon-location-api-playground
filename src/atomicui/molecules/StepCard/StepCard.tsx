/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useRef } from "react";

import { useMap } from "@api-playground/hooks";
import useDeviceMediaQuery from "@api-playground/hooks/useDeviceMediaQuery";
import { MapUnitEnum, TravelMode } from "@api-playground/types";
import { getConvertedDistance } from "@api-playground/utils";
import { Flex, Text, View } from "@aws-amplify/ui-react";
import { RouteFerryTravelStep, RoutePedestrianTravelStep, RouteVehicleTravelStep } from "@aws-sdk/client-geo-routes";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const { METRIC } = MapUnitEnum;

interface StepCardProps {
	step: RouteVehicleTravelStep | RoutePedestrianTravelStep | RouteFerryTravelStep;
	isFirst: boolean;
	isLast: boolean;
	travelMode: TravelMode;
}

const StepCard: FC<StepCardProps> = ({ step, isFirst, isLast }) => {
	const { mapUnit } = useMap();
	const onlyOneEl = isFirst && isLast;
	const { t, i18n } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const stepCardRef = useRef<HTMLDivElement>(null);

	return (
		<View
			data-testid="step-card-container"
			className={`step-card ${onlyOneEl ? "onlyOneEl" : ""} ${isLast ? "bottom-border-radius isLast" : ""} ${
				isFirst ? "isFirst" : ""
			}`}
		>
			<View className={`step-card-details ${!isDesktop ? "step-card-details-mobile" : ""}`}>
				<Text className="address" ref={stepCardRef}>
					{step.Instruction}
				</Text>
				<Flex
					gap="0.3rem"
					direction={isLanguageRTL ? "row-reverse" : "row"}
					justifyContent={isLanguageRTL ? "flex-end" : "flex-start"}
					className="distance-container"
				>
					<Text className="distance">{getConvertedDistance(mapUnit, step.Distance!)}</Text>
					<Text className="distance">
						{mapUnit === METRIC ? t("geofence_box__km__short.text") : t("geofence_box__mi__short.text")}
					</Text>
				</Flex>
			</View>
		</View>
	);
};

export default memo(StepCard);
