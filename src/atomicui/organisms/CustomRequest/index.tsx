import { useEffect } from "react";

import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { FormField, FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { appConfig } from "@api-playground/core/constants";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import usePlaceService from "@api-playground/services/usePlaceService";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore } from "@api-playground/stores/useCustomRequestStore";
import { BaseStateProps } from "@api-playground/types/BaseStateProps";
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/CustomRequestForm";
import { errorHandler } from "@api-playground/utils/errorHandler";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS, MAP_LANGUAGES }
} = appConfig;

const createFormFields = (urlState: CustomRequestStore): FormField[] => [
	{
		type: "lngLatInput",
		name: "queryPosition",
		label: "Query Position",
		required: true,
		value: urlState.queryPosition?.map(Number) as number[]
	},
	{
		type: "multiSelect",
		name: "additionalFeatures",
		label: "Additional Features",
		options: [
			{
				value: AdditionalFeatures.Access,
				label: "Access"
			},
			{
				value: AdditionalFeatures.TimeZone,
				label: "TimeZone"
			}
		],
		required: false,
		value: urlState.additionalFeatures
	},
	{
		type: "multiSelect",
		name: "includePlaceTypes",
		label: "Include Place Types ",
		options: [
			{
				value: IncludePlaceTypes.InterpolatedAddress,
				label: "InterpolatedAddress"
			},
			{
				value: IncludePlaceTypes.Intersection,
				label: "Intersection"
			},
			{
				value: IncludePlaceTypes.Locality,
				label: "Locality"
			},
			{
				value: IncludePlaceTypes.PointAddress,
				label: "PointAddress"
			},
			{
				value: IncludePlaceTypes.Street,
				label: "Street"
			}
		],
		required: false,
		value: urlState.filter?.includePlaceTypes
	},
	{
		type: "radio",
		name: "intendedUse",
		label: "Intended use",
		options: [
			{
				label: "Single use",
				value: IntendedUse.SingleUse
			},
			{
				label: "Storage",
				value: IntendedUse.Storage
			}
		],
		required: false,
		value: urlState.intendedUse
	},
	{
		type: "text",
		name: "apiKey",
		label: "API Key",
		required: false,
		value: urlState.apiKey
	},
	{
		type: "dropdown",
		name: "language",
		label: "Language",
		options: MAP_LANGUAGES.map(lang => ({
			label: lang.label,
			value: lang.value
		})),
		required: false,
		value: urlState.language
	},
	{
		type: "sliderWithInput",
		name: "maxResults",
		label: "Max Results",
		min: 1,
		max: 100,
		step: 1,
		required: false,
		value: urlState.maxResults
	},
	{
		type: "dropdown",
		name: "politicalView",
		label: "Political View",
		options: MAP_POLITICAL_VIEWS.map(i => ({
			label: i.alpha2,
			value: i.alpha2
		})),
		required: false,
		value: urlState.politicalView
	},
	{
		type: "slider",
		name: "queryResults",
		label: "Query Results",
		min: 1,
		max: 100,
		step: 1,
		required: false,
		value: urlState.queryResults
	}
];

const formContent: ContentProps = {
	type: "list",
	items: [
		{
			text: "Click on point on the map or enter coordinates then select [[Reverse Geocode]]"
		},
		{
			text: "Results will be displayed and shown on the map"
		}
	]
};

type StoreType = CustomRequestStore & BaseStateProps;

interface CustomRequestProps {
	onResponseReceived?: () => void;
}

export default function CustomRequest({ onResponseReceived }: CustomRequestProps) {
	useAuthManager();

	const store = useCustomRequestStore();
	const { setState } = useCustomRequestStore;
	const { urlState, setUrlState } = useUrlState({
		defaultValue: store,
		paramName: "reverseGeocode"
	});
	const placeService = usePlaceService();
	const { t } = useTranslation();

	// Sync URL state with store state
	useEffect(() => {
		Object.assign(store, urlState);
	}, [urlState, store]);

	// Notify parent when response is received
	useEffect(() => {
		if (store.response && onResponseReceived) {
			onResponseReceived();
		}
	}, [store.response, onResponseReceived]);

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		const newState = { ...store } as StoreType;

		// Handle nested fields (e.g., filter.includePlaceTypes)
		if (name === "includePlaceTypes") {
			newState.filter = {
				...newState.filter,
				includePlaceTypes: value as IncludePlaceTypes[]
			};
		} else {
			const key = name as keyof CustomRequestStore;
			switch (key) {
				case "queryPosition":
					newState.queryPosition = (value as number[]).map(String);
					break;
				case "additionalFeatures":
					newState.additionalFeatures = value as AdditionalFeatures[];
					break;
				case "intendedUse":
					newState.intendedUse = value as IntendedUse;
					break;
				case "apiKey":
					newState.apiKey = value as string;
					break;
				case "language":
					newState.language = value as string;
					break;
				case "maxResults":
					newState.maxResults = value as number;
					break;
				case "politicalView":
					newState.politicalView = value as string;
					break;
				case "queryResults":
					newState.queryResults = value as number;
					break;
			}
		}

		Object.assign(store, newState);
		setUrlState(newState);
	};

	const handleSubmit = async () => {
		try {
			// Set loading state
			setState({ isLoading: true, error: undefined });

			// Validate required fields
			if (!urlState.queryPosition || urlState.queryPosition.length !== 2) {
				throw new Error("Query Position is required and must contain longitude and latitude");
			}

			// Convert string coordinates to numbers
			const queryPosition = urlState.queryPosition.map(Number);

			// Prepare parameters for the API call
			const params = {
				QueryPosition: queryPosition,
				AdditionalFeatures: urlState.additionalFeatures,
				Language: urlState.language,
				MaxResults: urlState.maxResults,
				PoliticalView: urlState.politicalView
			};

			// Make the API call using the place service
			const response = await placeService.getPlaceByCoordinates(params);

			// Store the response
			setState({
				response,
				isLoading: false,
				error: undefined
			});

			const newState = { ...store } as StoreType;
			setUrlState({
				...newState,
				response,
				isLoading: false,
				error: undefined
			});
		} catch (error) {
			setState({
				isLoading: false,
				error: error instanceof Error ? error.message : "An error occurred during reverse geocoding"
			});
			errorHandler(
				error,
				(t("error_handler__failed_reverse_geocode.text") as string) || "Failed to perform reverse geocoding"
			);
		}
	};

	return (
		<div className="container">
			<FormRender
				content={formContent}
				fields={createFormFields(urlState)}
				onChange={handleChange}
				submitButtonText="Reverse Geocode"
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
