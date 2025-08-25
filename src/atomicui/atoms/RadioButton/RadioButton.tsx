/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React, { useEffect, useState } from "react";

import { IconClose, IconInfoSolid } from "@api-playground/assets/svgs";
import { Flex, Radio, RadioGroupField } from "@aws-amplify/ui-react";
import { Tooltip } from "react-tooltip";

import "./styles.scss";
import { Content } from "../Content";

export interface CustomRadioButtonProps {
	name: string;
	value: string;
	labelText: string;
	checked?: boolean;
	disabled?: boolean;
	onChange?: (value: string) => void;
	className?: string;
}

export const RadioButton: React.FC<CustomRadioButtonProps> = ({
	name,
	value,
	labelText,
	checked = false,
	disabled = false,
	onChange,
	className = ""
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	return (
		<Radio
			className={`custom-radio ${className}`}
			name={name}
			value={value}
			labelPosition="end"
			isDisabled={disabled}
			checked={checked}
			onChange={handleChange}
		>
			{labelText}
		</Radio>
	);
};

export interface RadioOption<T extends string> {
	label: string;
	value: T;
	disabled?: boolean;
	tooltipText?: string;
}

export interface RadioButtonGroupProps<T extends string> {
	name: string;
	options: ReadonlyArray<RadioOption<T>>;
	defaultValue?: T;
	value?: T;
	onChange?: (value: T) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
}

export const RadioButtonGroup = <T extends string>({
	name,
	options,
	defaultValue,
	value,
	onChange,
	label,
	disabled = false,
	className = ""
}: RadioButtonGroupProps<T>): React.ReactElement => {
	const [clickedTooltips, setClickedTooltips] = useState<Set<string>>(new Set());

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value as T);
	};

	const handleTooltipToggle = (tooltipId: string) => {
		setClickedTooltips(prev => {
			const newSet = new Set(prev);
			if (newSet.has(tooltipId)) {
				newSet.delete(tooltipId);
			} else {
				newSet.add(tooltipId);
			}
			return newSet;
		});
	};

	// Watch for tooltip removal from DOM and clear local state
	useEffect(() => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.removedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const element = node as Element;
						// Check if removed element is a tooltip
						if (element.classList.contains('react-tooltip')) {
							// Clear all tooltips from local state when any tooltip is removed
							setClickedTooltips(new Set());
						}
					}
				});
			});
		});

		// Start observing the document body for DOM changes
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		return () => {
			observer.disconnect();
		};
	}, []);

	if (defaultValue && !options.some(opt => opt.value === defaultValue)) {
		throw new Error(
			`Invalid defaultValue "${defaultValue}". Must be one of: ${options.map(opt => `"${opt.value}"`).join(", ")}`
		);
	}

	if (value && !options.some(opt => opt.value === value)) {
		throw new Error(`Invalid value "${value}". Must be one of: ${options.map(opt => `"${opt.value}"`).join(", ")}`);
	}

	return (
		<Flex direction="column" className={`radio-group ${className}`}>
			{label && (
				<Flex alignItems="center" gap="0.5rem" className="radio-group__label-container">
					<Content type="text" items={[{ text: label }]} />
				</Flex>
			)}
			<RadioGroupField direction="row" name={name} defaultValue={defaultValue} value={value} onChange={handleChange} legend="">
				{options.map(option => {
					const tooltipId = `radio-option-${name}-${option.value}`;
					const isClicked = clickedTooltips.has(tooltipId);

					return (
						<Flex alignItems="center" key={option.value} className="radio-option">
							<Radio className="custom-radio" value={option.value} isDisabled={disabled || option.disabled}>
								{option.label}
							</Radio>
							{option.tooltipText && (
								<>
									<IconInfoSolid
										onClick={(e) => {
											e.stopPropagation();
											handleTooltipToggle(tooltipId);
										}}
										data-tooltip-id={`radio-option-${name}-${option.value}`}
										className="radio-group__info-icon"
									/>
									<Tooltip
										classNameArrow="radio-group__arrow-icon"
										arrowColor="var(--grey-color-2)"
										openOnClick
										id={`radio-option-${name}-${option.value}`}
										className="react-tooltip"
										place="top"
										openEvents={{ mouseenter: true, focus: true }}
										closeEvents={{ mouseleave: !isClicked, blur: !isClicked }}
										globalCloseEvents={{
											escape: true,
											scroll: !isClicked,
											resize: !isClicked,
											clickOutsideAnchor: true
										}}
									>
										{option.tooltipText}
										<span
											onClick={(e) => {
												e.stopPropagation();
												// Remove this tooltip from clicked state to close it
												setClickedTooltips(prev => {
													const newSet = new Set(prev);
													newSet.delete(tooltipId);
													return newSet;
												});
											}}
											className="radio-group__close-icon-container"
										>
											<IconClose className="radio-group__close-icon" />
										</span>
									</Tooltip>
								</>
							)}
						</Flex>
					);
				})}
			</RadioGroupField>
		</Flex>
	);
};

export default RadioButtonGroup;
