import { FC, useEffect, useRef, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import "./styles.scss";
import { IconArrow } from "@api-playground/assets/svgs";

interface SimpleDropdownElProps {
	defaultOption?: string;
	options: string[];
	onSelect: (option: string) => void;
	disabled?: boolean;
}

const SimpleDropdownEl: FC<SimpleDropdownElProps> = ({ defaultOption, options, onSelect, disabled = false }) => {
	const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]);
	const [open, setOpen] = useState(false);
	const simpleDropdownRef = useRef<HTMLDivElement | null>(null);

	const handleClickOutside = (event: MouseEvent) => {
		if (simpleDropdownRef.current && !simpleDropdownRef.current.contains(event.target as Node)) {
			setOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	});

	const handleOptionClick = (option: string) => {
		setOpen(false);
		setSelectedOption(option);
		onSelect(option);
	};

	return (
		<Flex ref={simpleDropdownRef} className="simple-dropdown-container">
			<Flex
				className="trigger"
				style={{ cursor: disabled ? "not-allowed" : "pointer" }}
				onClick={() => !disabled && setOpen(s => !s)}
			>
				<Text
					className="medium"
					fontSize="1.08rem"
					style={{
						color: disabled ? "var(--grey-color)" : "var(--tertiary-color)",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					}}
				>
					{defaultOption || options[0]}
				</Text>
				<IconArrow
					className="icon-arrow"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						fill: disabled ? "var(--grey-color)" : "var(--primary-color)"
					}}
				/>
			</Flex>
			{open && (
				<Flex className="options">
					{options.map(option => (
						<Text
							key={option}
							className="text regular small-text"
							style={{ color: selectedOption === option ? "var(--primary-color)" : "var(--tertiary-color)" }}
							onClick={() => handleOptionClick(option)}
						>
							{option}
						</Text>
					))}
				</Flex>
			)}
		</Flex>
	);
};

export default SimpleDropdownEl;
