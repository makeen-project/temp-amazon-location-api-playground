/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { LogoDark, LogoLight } from "@api-playground/assets/svgs";
import useMap from "@api-playground/hooks/useMap";
import { MapColorSchemeEnum } from "@api-playground/types/Enums";
import "./styles.scss";

const Logo: FC = () => {
	const { mapColorScheme } = useMap();

	return <div className="map-logo">{mapColorScheme === MapColorSchemeEnum.DARK ? <LogoLight /> : <LogoDark />}</div>;
};

export default Logo;
