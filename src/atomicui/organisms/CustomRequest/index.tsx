/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";

import { FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import usePlaceService from "@api-playground/services/usePlaceService";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore, initialState } from "@api-playground/stores/useCustomRequestStore";
import { errorHandler } from "@api-playground/utils/errorHandler";
import {
	convertFormContentConfigToContentProps,
	createFormFieldsFromConfig,
	mapFormDataToApiParams
} from "@api-playground/utils/formConfigUtils";
import { GeocodeCommandOutput, ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";
import { useOptimisticSearchParams } from "nuqs/adapters/react-router";
import { useParams } from "react-router-dom";
import "./styles.scss";

interface CustomRequestProps {
	onResponseReceived?: (response: ReverseGeocodeCommandOutput | GeocodeCommandOutput) => void;
	onReset?: () => void;
}

export default function CustomRequest({ onResponseReceived, onReset }: CustomRequestProps) {
	useAuthManager();
	const isFirstLoad = useRef(true);

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);

	const store = useCustomRequestStore();
	const { setState } = useCustomRequestStore;

	// Get initial values directly from API config
	const initialUrlState = (apiPlaygroundItem?.formFields || []).reduce((acc, field) => {
		const fieldName = field.name as keyof CustomRequestStore;
		if (field.type === "text" && field.inputType === "password") {
			// Skip password fields - don't include them in URL state
			return acc;
		}

		if (field.defaultValue) {
			acc[fieldName] = field.defaultValue;
		} else if (field.type === "sliderWithInput") {
			// For slider inputs, always start with 1 as the default value
			acc[fieldName] = 1;
		} else {
			acc[fieldName] = initialState[fieldName];
		}
		return acc;
	}, {} as Record<string, any>);

	const { urlState, setUrlState } = useUrlState({
		...initialUrlState,
		response: undefined
	});
	const searchParams = useOptimisticSearchParams();
	const placeService = usePlaceService();

	const syncUrlState = useCallback(() => {
		const allSearchParams = Object.fromEntries(searchParams.entries());
		const parsedSearchParams = Object.fromEntries(
			Object.entries(allSearchParams).map(([key, value]) => [key, value ? JSON.parse(value) : value])
		);

		const response = parsedSearchParams.response ? JSON.parse(parsedSearchParams.response as string) : undefined;

		setState({
			...initialState, // Start with initial state as base
			...parsedSearchParams,
			response
		});
	}, []);

	// Update store from URL state only on first load
	useEffect(() => {
		if (isFirstLoad.current) {
			syncUrlState();
			isFirstLoad.current = false;
		}
	}, [urlState]);

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		// Update store state
		const newState = {
			...store,
			[name]: value,
			response: undefined,
			error: undefined
		};
		setState(newState);

		// Always update URL state for all form fields
		setUrlState({
			...urlState,
			[name]: value
		});
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
			const params = mapFormDataToApiParams(store, apiPlaygroundItem?.apiHandler?.paramMapping || {});
			const apiMethod = apiPlaygroundItem?.apiHandler?.apiMethod as keyof typeof placeService;

			if (typeof placeService[apiMethod] === "function") {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const response = await (placeService[apiMethod] as any)(params);
				setState({ ...store, response, error: undefined });
				setUrlState({ ...urlState, response: JSON.stringify(response) });
				onResponseReceived?.(response);
			} else {
				throw new Error(`API method ${apiMethod} not found`);
			}
		} catch (error) {
			errorHandler(error);
			setState({ ...store, error: error instanceof Error ? error.message : "An error occurred", response: undefined });
		}
	};

	const handleToggle = (fieldName: string, enabled: boolean) => {
		// Update store state
		const newState = {
			...store,
			[fieldName]: enabled ? 1 : undefined, // Set to 1 when enabled, undefined when disabled
			response: undefined,
			error: undefined
		};
		setState(newState);

		// Update URL state
		setUrlState({
			...urlState,
			[fieldName]: enabled ? 1 : undefined
		});
	};

	// Create form fields with current store values
	const formFields = createFormFieldsFromConfig(apiPlaygroundItem?.formFields || [], store);

	// Update form field values from store
	formFields.forEach(field => {
		const storeValue = store[field.name as keyof CustomRequestStore];
		if (storeValue !== undefined) {
			switch (field.type) {
				case "checkbox":
					(field as any).values = Array.isArray(storeValue) ? storeValue : [];
					break;
				case "multiSelect":
				case "lngLatInput":
					(field as any).value = Array.isArray(storeValue) ? storeValue : [];
					break;
				default:
					(field as any).value = storeValue;
			}
		}
	});

	return (
		<div className="container">
			<FormRender
				fields={formFields}
				content={convertFormContentConfigToContentProps(apiPlaygroundItem?.formContent || { type: "list", items: [] })}
				onChange={handleChange}
				onReset={handleReset}
				onSubmit={handleSubmit}
				submitButtonText={apiPlaygroundItem?.submitButtonText || "Submit"}
				onToggle={handleToggle}
			/>
		</div>
	);
}
