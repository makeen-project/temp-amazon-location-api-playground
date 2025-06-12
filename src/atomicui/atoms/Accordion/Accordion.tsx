import { ReactNode, useState } from "react";

import { IconAccordionClose, IconAccordionOpen } from "@api-playground/assets/svgs";
import { Accordion as AmplifyAccordion } from "@aws-amplify/ui-react";

import "./styles.scss";

interface AccordionProps {
	children: ReactNode;
	title: string | ReactNode;
	defaultOpen?: boolean;
	openIcon?: ReactNode;
	closeIcon?: ReactNode;
	shadowEnabled?: boolean;
}

export const Accordion = ({
	children,
	title,
	defaultOpen = false,
	shadowEnabled = true,
	openIcon = <IconAccordionOpen />,
	closeIcon = <IconAccordionClose />
}: AccordionProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultOpen);
	const value = isExpanded ? ["item"] : [];

	return (
		<AmplifyAccordion.Container
			className={`accordion ${shadowEnabled ? "accordion-shadow" : ""}`}
			value={value}
			onValueChange={items => setIsExpanded(items?.includes("item") ?? false)}
		>
			<AmplifyAccordion.Item className="accordion__item" value="item">
				<AmplifyAccordion.Trigger className="accordion__trigger">
					<span className="accordion__title">{title}</span>
					<span className={"accordion__icon"}>{isExpanded ? openIcon : closeIcon}</span>
				</AmplifyAccordion.Trigger>
				<AmplifyAccordion.Content className="accordion__content">
					<div className="accordion__body">{children}</div>
				</AmplifyAccordion.Content>
			</AmplifyAccordion.Item>
		</AmplifyAccordion.Container>
	);
};

export default Accordion;
