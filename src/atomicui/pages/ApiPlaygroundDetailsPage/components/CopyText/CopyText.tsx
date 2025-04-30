/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { forwardRef, useState } from "react";

import { Text } from "@aws-amplify/ui-react";
import { IconCopy, IconTickCircle } from "@api-playground/assets/svgs";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface CopyTextProps {
	text: string;
	iconSize?: number;
	copyIconColor?: string;
	tickIconColor?: string;
	afterCopied?: () => void;
}

const CopyText = forwardRef<HTMLSpanElement | null, CopyTextProps>(
	(
		{
			text,
			iconSize = 18,
			copyIconColor = "var(--grey-light-color)",
			tickIconColor = "var(--green-color)",
			afterCopied
		},
		ref
	) => {
		const [isCopied, setIsCopied] = useState<boolean>(false);
		const { t } = useTranslation();

		const handleClick = () => {
			navigator.clipboard.writeText(text);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 2500);

			afterCopied && afterCopied();
		};

		return (
			<span data-testid="copy-text-container" className="copy-text-container" ref={ref} onClick={handleClick}>
				{isCopied ? (
					<IconTickCircle data-testid="copied-icon" width={iconSize} height={iconSize} fill={tickIconColor} />
				) : (
					<IconCopy data-testid="copy-icon" width={iconSize} height={iconSize} fill={copyIconColor} />
				)}
				<Text className="copy-text bold small-text">{t("samples__copy.text")}</Text>
			</span>
		);
	}
);

export default CopyText;
