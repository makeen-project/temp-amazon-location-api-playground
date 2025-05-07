/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { CheckboxField, Text, View } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface CheckboxGroupProps {
	title: string;
	options: { label: string; value: string }[];
	values: string[];
	onChange: (values: string[]) => void;
}

const CheckboxGroup: FC<CheckboxGroupProps> = ({ title, options, values: currentValues, onChange }) => {
	const { t } = useTranslation();

	const handleClick = (value: string, isChecked: boolean): void => {
		let newSelectedValues: string[] = [];
		if (isChecked) {
			newSelectedValues = [...currentValues, value];
		} else {
			newSelectedValues = currentValues.filter(selectedValue => selectedValue !== value);
		}

		onChange(newSelectedValues);
	};

	return (
		<View data-testid="checkbox-group-container" className="checkbox-group">
			<Text className="bold medium-text">{title}</Text>
			{options.map(option => (
				<CheckboxField
					data-testid="checkbox-group-checkbox-field"
					className="regular-text"
					key={t(option.value)}
					name={t(option.label)}
					label={t(option.label)}
					value={t(option.value).toLowerCase()}
					checked={currentValues.includes(t(option.value))}
					onClick={e => handleClick(t(option.value), e.currentTarget.checked)}
				/>
			))}
		</View>
	);
};

export default CheckboxGroup;
