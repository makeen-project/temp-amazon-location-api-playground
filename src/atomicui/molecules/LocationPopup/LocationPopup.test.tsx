/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import i18n from "@api-playground/locales/i18n";
import { View } from "@aws-amplify/ui-react";
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import Popup from "./LocationPopup";

/* @ts-expect-error: props are implicitly any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PopupMock({ closeButton: _, ...props }) {
	return <View {...props} />;
}

vi.mock("react-map-gl/maplibre", async importOriginal => ({
	...(await importOriginal<object>()),
	Popup: PopupMock
}));

const useMapReturnValue: {
	currentLocationData: {
		error: null | string;
	};
	viewpoint: { longitude: number; latitude: number };
	mapProvider: string;
	mapUnit: string;
	isCurrentLocationDisabled: boolean;
} = {
	currentLocationData: {
		error: null
	},
	viewpoint: { longitude: -122.3408586, latitude: 47.6149975 },
	mapProvider: "Here",
	mapUnit: "Imperial",
	isCurrentLocationDisabled: false
};

vi.mock("@api-playground/hooks", () => ({
	useMap: () => useMapReturnValue,
	usePlace: () => ({
		getPlaceData: vi.fn(),
		isFetchingPlaceData: false,
		clearPoiList: vi.fn()
	})
}));

vi.mock("@api-playground/hooks/useDeviceMediaQuery", () => ({
	__esModule: true,
	default: () => ({ isDesktop: true })
}));

describe("<Popup/>", () => {
	const writeText = vi.fn();

	beforeAll(() => {
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText
			},
			configurable: true
		});
	});

	beforeEach(() => {
		writeText.mockClear();
		render(
			<I18nextProvider i18n={i18n}>
				<Popup
					placeId={faker.random.word()}
					position={[parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())]}
					label={`${faker.address.street()}, ${faker.address.city()}, ${faker.address.state()}, ${faker.address.zipCode()}`}
					active
					select={vi.fn()}
					locationPopupConfig={{
						showPlaceId: true,
						showLatitude: true,
						showLongitude: true
					}}
					onClosePopUp={vi.fn()}
				/>
			</I18nextProvider>
		);
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("should render successfully (popupContainer and copyIcon)", () => {
		expect(screen.getByTestId("popup-container")).toBeInTheDocument();
		expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
	});

	it("should call copy icon onClick function when copy icon is clicked", async () => {
		const copyIcon = screen.getByTestId("copy-icon");
		await act(async () => {
			fireEvent.click(copyIcon);
		});
		expect(writeText).toBeCalled();
	});
});
