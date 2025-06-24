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
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/CustomRequestForm";
import { errorHandler } from "@api-playground/utils/errorHandler";
import {
	convertFormContentConfigToContentProps,
	createFormFieldsFromConfig,
	mapFormDataToApiParams,
	validateFormData
} from "@api-playground/utils/formConfigUtils";
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
		value: urlState?.queryPosition?.map(Number) as number[]
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
		value: urlState?.filter?.includePlaceTypes
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
		value: urlState?.intendedUse
	},
	{
		type: "text",
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
		name: "queryResults",
		label: "Query Results",
		min: 1,
		max: 100,
		step: 1,
		required: false,
		value: urlState?.queryResults
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
}

export default function CustomRequest({ onResponseReceived }: CustomRequestProps) {
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
		Object.assign(store, urlState);
	}, [urlState, store]);

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
				default:
					// Handle dynamic fields from configuration
					(newState as any)[key] = value;
			}
		}

		Object.assign(store, newState);
		setUrlState(newState);
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
					PoliticalView: urlState?.politicalView
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
				submitButtonText={apiPlaygroundItem?.submitButtonText || "Submit"}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
