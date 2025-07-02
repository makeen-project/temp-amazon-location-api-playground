import { useEffect } from "react";

import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { FormField, FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { appConfig } from "@api-playground/core/constants";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import usePlaceService from "@api-playground/services/usePlaceService";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore } from "@api-playground/stores/useCustomRequestStore";
import { BaseStateProps } from "@api-playground/types/BaseStateProps";
import { AdditionalFeatures, IntendedUse } from "@api-playground/types/CustomRequestForm";
import { errorHandler } from "@api-playground/utils/errorHandler";
import {
	convertFormContentConfigToContentProps,
	createFormFieldsFromConfig,
	mapFormDataToApiParams,
	validateFormData
} from "@api-playground/utils/formConfigUtils";
import { ReverseGeocodeFilterPlaceType } from "@aws-sdk/client-geo-places";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { useParams } from "react-router-dom";

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS, MAP_LANGUAGES }
} = appConfig;

// Fallback form fields for backward compatibility
const createFallbackFormFields = (urlState: CustomRequestStore): FormField[] => [
	{
		type: "lngLatInput",
		name: "queryPosition",
		label: "Query Position",
		required: true,
		value: urlState?.queryPosition?.map(Number) as number[],
		disabled: (urlState?.response?.ResultItems?.length ?? 0) > 0
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
		value: urlState?.additionalFeatures
	},
	{
		type: "multiSelect",
		name: "includePlaceTypes",
		label: "Include Place Types ",
		options: [
			{
				value: ReverseGeocodeFilterPlaceType.INTERPOLATED_ADDRESS,
				label: "InterpolatedAddress"
			},
			{
				value: ReverseGeocodeFilterPlaceType.INTERSECTION,
				label: "Intersection"
			},
			{
				value: ReverseGeocodeFilterPlaceType.LOCALITY,
				label: "Locality"
			},
			{
				value: ReverseGeocodeFilterPlaceType.POINT_ADDRESS,
				label: "PointAddress"
			},
			{
				value: ReverseGeocodeFilterPlaceType.STREET,
				label: "Street"
			}
		],
		required: false,
		value: urlState?.includePlaceTypes
	},
	{
		type: "radio",
		name: "intendedUse",
		label: "Intended use",
		defaultValue: IntendedUse.SingleUse,
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
		value: urlState?.intendedUse
	},
	{
		type: "text",
		inputType: "password",
		name: "apiKey",
		label: "API Key",
		required: false,
		value: urlState?.apiKey
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
		value: urlState?.language
	},
	{
		type: "sliderWithInput",
		name: "maxResults",
		label: "Max Results",
		min: 1,
		max: 100,
		step: 1,
		required: false,
		value: urlState?.maxResults
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
		value: urlState?.politicalView
	},
	{
		type: "slider",
		name: "queryRadius",
		label: "Query Radius",
		min: 1,
		max: 21000000,
		step: 1,
		required: false,
		value: urlState.queryRadius
	}
];

// Fallback form content for backward compatibility
const fallbackFormContent: ContentProps = {
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
	onReset?: () => void;
}

export default function CustomRequest({ onResponseReceived, onReset }: CustomRequestProps) {
	useAuthManager();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);

	const store = useCustomRequestStore();
	const { setState } = useCustomRequestStore;
	const { urlState, setUrlState } = useUrlState({
		defaultValue: store,
		paramName: apiPlaygroundItem?.id
	});
	const placeService = usePlaceService();
	const { t } = useTranslation();

	// Sync URL state with store state
	useEffect(() => {
		// Only update if urlState exists and is different from current store
		if (urlState && typeof urlState === "object") {
			// Check if any values actually changed to prevent infinite loops
			let hasChanges = false;
			const updatedStore = { ...store };

			Object.keys(urlState).forEach(key => {
				const urlValue = (urlState as any)[key];
				const currentValue = (store as any)[key];

				// Deep comparison for arrays
				if (Array.isArray(urlValue)) {
					const isDifferent =
						!Array.isArray(currentValue) ||
						urlValue.length !== currentValue.length ||
						urlValue.some((val: any, index: number) => val !== currentValue[index]);

					if (isDifferent) {
						(updatedStore as any)[key] = [...urlValue];
						hasChanges = true;
					}
				}
				// Deep comparison for objects
				else if (urlValue && typeof urlValue === "object") {
					const isDifferent = JSON.stringify(urlValue) !== JSON.stringify(currentValue);
					if (isDifferent) {
						(updatedStore as any)[key] = { ...urlValue };
						hasChanges = true;
					}
				}
				// Simple comparison for primitives
				else if (urlValue !== currentValue) {
					(updatedStore as any)[key] = urlValue;
					hasChanges = true;
				}
			});

			// Only update store if there are actual changes
			if (hasChanges) {
				setState(updatedStore);
			}
		}
	}, [urlState, store]); // Removed setState from dependencies to prevent infinite loop

	// Notify parent when response is received
	useEffect(() => {
		if (store.response && onResponseReceived) {
			onResponseReceived();
		}
	}, [store.response, onResponseReceived]);

	// Create form fields from configuration or fallback
	const createFormFields = (urlState: CustomRequestStore): FormField[] => {
		if (apiPlaygroundItem?.formFields) {
			return createFormFieldsFromConfig(apiPlaygroundItem.formFields, urlState);
		}
		return createFallbackFormFields(urlState);
	};

	// Create form content from configuration or fallback
	const getFormContent = (): ContentProps => {
		if (apiPlaygroundItem?.formContent) {
			return convertFormContentConfigToContentProps(apiPlaygroundItem.formContent);
		}
		return fallbackFormContent;
	};

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		const newState = { ...store } as StoreType;

		// Handle nested fields (e.g., filter.includePlaceTypes)
		const key = name as keyof CustomRequestStore;
		switch (key) {
			case "queryPosition":
				newState.queryPosition = (value as number[]).map(String);
				break;
			case "additionalFeatures":
				newState.additionalFeatures = value as AdditionalFeatures[];
				break;
			case "includePlaceTypes":
				newState.includePlaceTypes = value as ReverseGeocodeFilterPlaceType[];
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
			case "queryRadius":
				newState.queryRadius = value as number;
				break;
			default:
				// Handle dynamic fields from configuration
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(newState as any)[key] = value;
		}

		// Only update URL state, let the useEffect handle store updates
		setUrlState(newState);
	};

	const handleReset = () => {
		// Create reset state with initial values
		const resetState = {
			queryPosition: [],
			additionalFeatures: undefined,
			includePlaceTypes: undefined,
			intendedUse: undefined,
			apiKey: undefined,
			language: undefined,
			maxResults: undefined,
			politicalView: undefined,
			queryRadius: undefined,
			response: undefined,
			isLoading: false,
			error: undefined
		};

		// Reset store to initial state using setState
		setState(resetState);

		// Completely clear URL state by setting it to null
		setUrlState(null as any);

		onReset?.();
	};

	const handleSubmit = async () => {
		try {
			// Set loading state
			setState({ isLoading: true, error: undefined });

			// Use dynamic validation if available
			if (apiPlaygroundItem?.apiHandler?.validationRules) {
				const validation = validateFormData(urlState, apiPlaygroundItem.apiHandler.validationRules);
				if (!validation.isValid) {
					const firstError = Object.values(validation.errors)[0];
					throw new Error(firstError);
				}
			} else {
				// Fallback validation for backward compatibility
				if (!urlState?.queryPosition || urlState?.queryPosition.length !== 2) {
					throw new Error("Query Position is required and must contain longitude and latitude");
				}
			}

			// Use dynamic API call if available
			if (apiPlaygroundItem?.apiHandler) {
				const apiParams = mapFormDataToApiParams(urlState, apiPlaygroundItem.apiHandler.paramMapping);

				// Call the appropriate API method
				const apiMethod = apiPlaygroundItem.apiHandler.apiMethod as keyof typeof placeService;
				if (typeof placeService[apiMethod] === "function") {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const response = await (placeService[apiMethod] as any)(apiParams);

					// Transform response if needed
					const finalResponse = apiPlaygroundItem.apiHandler.transformResponse
						? apiPlaygroundItem.apiHandler.transformResponse(response)
						: response;

					setState({
						response: finalResponse,
						isLoading: false,
						error: undefined
					});

					const newState = { ...store } as StoreType;
					setUrlState({
						...newState,
						response: finalResponse,
						isLoading: false,
						error: undefined
					});
				} else {
					throw new Error(`API method ${apiMethod} not found`);
				}
			} else {
				// Fallback API call for backward compatibility
				const queryPosition = urlState?.queryPosition.map(Number);
				const params = {
					QueryPosition: queryPosition,
					AdditionalFeatures: urlState?.additionalFeatures,
					Language: urlState?.language,
					MaxResults: urlState?.maxResults,
					PoliticalView: urlState?.politicalView,
					Filter: {
						IncludePlaceTypes: urlState?.includePlaceTypes || []
					}
				};

				const response = await placeService.getPlaceByCoordinates(params);

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
			}
		} catch (error) {
			setState({
				isLoading: false,
				error: error instanceof Error ? error.message : "An error occurred during API call"
			});
			errorHandler(error, (t("error_handler__failed_reverse_geocode.text") as string) || "Failed to perform API call");
		}
	};

	return (
		<div className="container">
			<FormRender
				content={getFormContent()}
				fields={createFormFields(urlState || {})}
				onChange={handleChange}
				onReset={handleReset}
				submitButtonText={apiPlaygroundItem?.submitButtonText || "Submit"}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
