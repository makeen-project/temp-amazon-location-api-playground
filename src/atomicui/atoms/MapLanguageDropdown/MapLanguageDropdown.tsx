import { FC, useCallback, useEffect, useRef, useState } from "react";

import { IconArrow } from "@api-playground/assets/svgs";
import { appConfig } from "@api-playground/core/constants";
import { useMap } from "@api-playground/hooks";
import { useCustomRequestStore } from "@api-playground/stores";
import { Flex, Text } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	MAP_RESOURCES: { MAP_LANGUAGES }
} = appConfig;

interface MapLanguageDropdownProps {
	bordered?: boolean;
	arrowIconColor?: string;
	width?: string;
	disabled?: boolean;
}

const MapLanguageDropdown: FC<MapLanguageDropdownProps> = ({
	bordered = false,
	arrowIconColor,
	width = "100%",
	disabled = false
}) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { i18n, t } = useTranslation();
	const { mapLanguage, setMapLanguage } = useMap();
	const { setState: setCustomRequestState } = useCustomRequestStore;
	const mapLanguageDir = i18n.dir(mapLanguage.value);

	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleClick = useCallback(
		(option: { value: string; label: string }) => {
			// Update map store
			setMapLanguage(option);

			// Also update custom request store to keep them in sync
			// Only update if the value is actually different to prevent loops
			setCustomRequestState(prevState => {
				if (prevState.language !== option.value) {
					return {
						...prevState,
						language: option.value
					};
				}
				return prevState;
			});

			setOpen(false);
		},
		[setMapLanguage, setCustomRequestState]
	);

	return (
		<div ref={dropdownRef} className="dropdown-container" style={{ width }}>
			<div
				data-testid="dropdown-trigger-map-language"
				style={{ cursor: disabled ? "not-allowed" : "pointer", backgroundColor: disabled ? "#ddd" : "" }}
				className={bordered ? `trigger bordered dropdown-${open}` : "trigger"}
				onClick={() => !disabled && setOpen(!open)}
			>
				<p data-testid="dropdown-label" className="dropdown-label" dir={mapLanguageDir}>
					{mapLanguage.label}
				</p>
				<IconArrow
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						width: bordered ? "1rem" : "1.23rem",
						height: bordered ? "" : "1.23rem",
						fill: arrowIconColor ? arrowIconColor : "var(--primary-color)"
					}}
				/>
			</div>
			{open && (
				<ul data-testid="dropdown-options" className={bordered ? "options bordered" : "options"}>
					{MAP_LANGUAGES.map(({ value, label }) => {
						return (
							<li
								data-testid={value}
								key={value}
								style={{ display: "flex", justifyContent: "start" }}
								onClick={() => handleClick({ value, label })}
							>
								<Flex gap="0" direction="column" padding="0.46rem 1.23rem">
									<Text className="bold small-text" color="var(--tertiary-color)">
										{t(label)}
									</Text>
								</Flex>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default MapLanguageDropdown;
