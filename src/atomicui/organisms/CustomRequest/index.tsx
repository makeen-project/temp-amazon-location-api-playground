/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";

import { FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { appConfig } from "@api-playground/core/constants";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import useMap from "@api-playground/hooks/useMap";
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

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS, MAP_LANGUAGES }
} = appConfig;

interface CustomRequestProps {
	onResponseReceived?: (response: ReverseGeocodeCommandOutput | GeocodeCommandOutput) => void;
	onReset?: () => void;
	mapRef?: React.RefObject<{
		flyTo: (options: { center: [number, number]; zoom: number; duration?: number }) => void;
		zoomTo: (number: number) => void;
		fitBounds: (
			bounds: [[number, number], [number, number]],
			options?: { padding?: number; duration?: number; essential?: boolean }
		) => void;
	}>;
	isExpanded?: boolean;
}

export default function CustomRequest({ onResponseReceived, onReset, mapRef, isExpanded }: CustomRequestProps) {
	useAuthManager();
	const isFirstLoad = useRef(true);
	const isSyncing = useRef(false);
	const [containerRef, setContainerRef] = useState<HTMLDivElement>();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);

	const store = useCustomRequestStore();
	const { setState } = useCustomRequestStore;
	const {
		setClickedPosition,
		setBiasPosition,
		setViewpoint,
		setCurrentLocation,
		setMapPoliticalView,
		setMapLanguage,
		mapPoliticalView,
		mapLanguage
	} = useMap();

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

	// Sync custom request store changes back to map store
	useEffect(() => {
		if (isSyncing.current) return;

		isSyncing.current = true;

		// Sync political view - map from alpha2 (API config) to alpha3 (map store)
		if (store.politicalView !== undefined && store.politicalView !== mapPoliticalView.alpha2) {
			const politicalViewOption =
				MAP_POLITICAL_VIEWS.find(option => option.alpha2 === store.politicalView) || MAP_POLITICAL_VIEWS[0]; // Default to first option (no political view)

			setMapPoliticalView(politicalViewOption);
		}

		// Sync language
		if (store.language !== undefined && store.language !== mapLanguage.value) {
			const languageOption = MAP_LANGUAGES.find(option => option.value === store.language) || MAP_LANGUAGES[0]; // Default to first option (English)

			setMapLanguage(languageOption);
		}

		isSyncing.current = false;
	}, [
		store.politicalView,
		store.language,
		mapPoliticalView.alpha2,
		mapLanguage.value,
		setMapPoliticalView,
		setMapLanguage
	]);

	// Initial sync from map store to custom request store
	useEffect(() => {
		if (isFirstLoad.current && !isSyncing.current) {
			isSyncing.current = true;

			// Sync map political view to custom request store - map from alpha3 to alpha2
			if (mapPoliticalView.alpha2 !== store.politicalView) {
				setState(prevState => ({
					...prevState,
					politicalView: mapPoliticalView.alpha2 || ""
				}));
			}

			// Sync map language to custom request store
			if (mapLanguage.value !== store.language) {
				setState(prevState => ({
					...prevState,
					language: mapLanguage.value
				}));
			}

			isSyncing.current = false;
		}
	}, [mapPoliticalView.alpha2, mapLanguage.value, store.politicalView, store.language, setState]);

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		// Update store state
		const newState = {
			...store,
			[name]: value,
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
			biasPosition: [],
			additionalFeatures: [],
			includeCountries: [],
			includePlaceTypes: [],
			intendedUse: undefined,
			key: "",
			apiKey: "",
			language: "en",
			maxResults: 1,
			politicalView: "",
			queryRadius: 1,
			addressNumber: "",
			country: "",
			district: "",
			locality: "",
			postalCode: "",
			region: "",
			street: "",
			subRegion: "",
			response: undefined,
			isLoading: false,
			error: undefined
		};

		// Reset store to initial state using setState
		setState(resetState);

		// Reset map state
		setClickedPosition([]);
		setBiasPosition([]);

		// Reset map political view and language to defaults
		setMapPoliticalView(MAP_POLITICAL_VIEWS[0]); // No political view
		setMapLanguage(MAP_LANGUAGES[0]); // English

		// Set map to current location without reloading
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				currentLocation => {
					const {
						coords: { latitude, longitude }
					} = currentLocation;

					setCurrentLocation({ currentLocation: { latitude, longitude }, error: undefined });
					setViewpoint({ latitude, longitude });

					// Actually move the map to the current location
					mapRef?.current?.flyTo({
						center: [longitude, latitude],
						zoom: 15,
						duration: 2000
					});
				},
				error => {
					console.warn("Failed to get current location:", error);
					// Fallback to default location if geolocation fails
					setCurrentLocation({ currentLocation: undefined, error });
				},
				{
					maximumAge: 0,
					enableHighAccuracy: true
				}
			);
		}

		// Completely clear URL state by setting it to null
		setUrlState(null as any);

		// Call onReset callback to handle additional reset logic in parent component
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
			[fieldName]: enabled ? 1 : null, // Set to 1 when enabled, undefined when disabled
			error: undefined
		};
		setState(newState);

		// Update URL state
		setUrlState({
			...urlState,
			[fieldName]: enabled ? 1 : null
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

	// Check if submit button should be disabled
	const isSubmitDisabled = (() => {
		// Disable if there's already a response
		if (store.response) {
			return true;
		}

		// Check if required fields are empty
		const requiredFields = (apiPlaygroundItem?.formFields || []).filter((f: any) => f.required);
		const hasMissingRequired = requiredFields.some((f: any) => {
			const key = f.name as keyof CustomRequestStore;
			const val = store[key];

			if (Array.isArray(val))
				return (
					val.length === 0 ||
					val.every(v => (typeof v === "string" ? v === "" || v === "0" : typeof v === "number" ? v === 0 : false))
				);
			if (typeof val === "string") return val === "" || val === "0";
			if (typeof val === "number") return val === 0;

			return val === undefined || val === null;
		});

		return hasMissingRequired;
	})();

	return (
		<div className={`container ${isExpanded ? "expanded" : ""}`} ref={ref => setContainerRef(ref as HTMLDivElement)}>
			<FormRender
				fields={formFields}
				content={convertFormContentConfigToContentProps(apiPlaygroundItem?.formContent || { type: "list", items: [] })}
				onChange={handleChange}
				onReset={handleReset}
				onSubmit={handleSubmit}
				submitButtonText={apiPlaygroundItem?.submitButtonText || "Submit"}
				onToggle={handleToggle}
				containerHeight={containerRef?.clientHeight}
				submitButtonDisabled={isSubmitDisabled}
			/>
		</div>
	);
}
