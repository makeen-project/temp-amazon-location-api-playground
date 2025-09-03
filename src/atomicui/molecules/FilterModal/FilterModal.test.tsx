/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { faker } from "@faker-js/faker";
import { fireEvent, render } from "@testing-library/react";
import i18n from "locales/i18n";
import { I18nextProvider } from "react-i18next";

import FilterModal from ".";

describe("<FilterModal />", () => {
	const props = {
		isOpen: false,
		title: faker.datatype.string(),
		options: [...Array(3)].map((val, idx) => ({
			key: `Category${idx}`,
			title: `Category${idx}`,
			options: [...Array(3)].map((val, idx) => ({
				label: `Option${idx}`,
				value: `Option${idx}`
			}))
		})),
		values: {
			Category0: [],
			Category1: [],
			Category2: []
		},
		onClose: vi.fn(),
		onChange: vi.fn()
	};

	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<FilterModal {...props} />
			</I18nextProvider>
		);
	};

	it("should not render when isOpen is false", () => {
		const { queryByTestId } = renderComponent();
		expect(queryByTestId("filter-modal-container")).not.toBeInTheDocument();
	});

	it("should render successfully when isOpen is true", () => {
		props.isOpen = true;
		const { getByTestId } = renderComponent();
		expect(getByTestId("filter-modal-container")).toBeInTheDocument();
	});

	it("should update filters once new filters are applied", () => {
		const { getByText, getByTestId } = renderComponent();
		fireEvent.click(getByTestId("category-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByText("Apply"));
		fireEvent.click(getByText("Done"));
		expect(getByTestId("counter-badge-0")).toHaveTextContent("1");
	});

	it("should toggle checkmark if already selected filter is clicked", () => {
		const { getByText, getByTestId, queryByTestId } = renderComponent();
		fireEvent.click(getByTestId("category-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByText("Apply"));
		fireEvent.click(getByText("Done"));
		expect(queryByTestId("counter-badge-0")).not.toBeInTheDocument();
	});
});
