import React from "react";
import { Button, Flex } from "@aws-amplify/ui-react";
import "./styles.scss";

interface SegmentedControlOption {
	label: string;
	value: string;
}

interface SegmentedControlProps {
	label?: string;
	options: SegmentedControlOption[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
	name?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ label, options, value, onChange, className }) => {
	return (
		<div className={`segmented-control ${className || ""}`}>
			{label && <label className="amplify-label segmented-control__label">{label}</label>}
			<Flex className="segmented-control__group">
				{options.map(option => (
					<Button
						key={option.value}
						size="small"
						fontSize={14}
						flex={1}
						variation="link"
						className={`segmented-control__button ${option.value === value ? "is-active" : ""}`}
						onClick={() => onChange(option.value)}
						aria-pressed={option.value === value}
					>
						{option.label}
					</Button>
				))}
			</Flex>
		</div>
	);
};
