/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React from "react";
import "./styles.scss";

interface HintMessageProps {
	message: string;
}

export const HintMessage: React.FC<HintMessageProps> = ({ message }) => {
	if (!message) return null;
	return <div className="api-playground-message">{message}</div>;
};

export default HintMessage;
