/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { ReactNode, useState } from "react";

import { IconAccordionClose, IconAccordionOpen } from "@api-playground/assets/svgs";
import { Accordion as AmplifyAccordion } from "@aws-amplify/ui-react";

import "./styles.scss";

interface AccordionProps {
	children: ReactNode;
	title: string | ReactNode;
	defaultOpen?: boolean;
	open?: boolean;
	onToggle?: () => void;
	openIcon?: ReactNode;
	closeIcon?: ReactNode;
	shadowEnabled?: boolean;
	style?: React.CSSProperties;
	contentClassName?: string;
	containerHeight?: number;
}

export const Accordion = ({
	children,
	title,
	defaultOpen = false,
	shadowEnabled = true,
	openIcon = <IconAccordionOpen />,
	closeIcon = <IconAccordionClose />,
	style,
	contentClassName,
	open,
	onToggle
}: AccordionProps) => {
	// Use controlled state if open and onToggle are provided, otherwise use internal state
	const isControlled = open !== undefined && onToggle !== undefined;
	const [internalExpanded, setInternalExpanded] = useState(defaultOpen);

	const isExpanded = isControlled ? open : internalExpanded;

	const value = isExpanded ? ["item"] : [];

	return (
		<AmplifyAccordion.Container
			className={`accordion ${shadowEnabled ? "accordion-shadow" : ""}`}
			value={value}
			onValueChange={items => {
				const newExpanded = items?.includes("item") ?? false;
				if (isControlled) {
					onToggle();
				} else {
					setInternalExpanded(newExpanded);
				}
			}}
			style={style}
		>
			<AmplifyAccordion.Item className="accordion__item" value="item">
				<AmplifyAccordion.Trigger className="accordion__trigger">
					<span className="accordion__title">{title}</span>
					<span className={"accordion__icon"}>{isExpanded ? openIcon : closeIcon}</span>
				</AmplifyAccordion.Trigger>
				<AmplifyAccordion.Content className={`accordion__content ${contentClassName}`}>
					{children}
				</AmplifyAccordion.Content>
			</AmplifyAccordion.Item>
		</AmplifyAccordion.Container>
	);
};

export default Accordion;
