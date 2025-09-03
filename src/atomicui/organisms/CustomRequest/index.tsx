/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { SegmentedControl } from "@api-playground/atomicui/atoms/SegmentedControl";
import { FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { appConfig } from "@api-playground/core/constants";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import useMap from "@api-playground/hooks/useMap";
import usePlace from "@api-playground/hooks/usePlace";
import usePlaceService from "@api-playground/services/usePlaceService";
import { useCustomRequestStore } from "@api-playground/stores";
import { CustomRequestStore } from "@api-playground/stores/useCustomRequestStore";
import { errorHandler } from "@api-playground/utils/errorHandler";
import {
	convertFormContentConfigToContentProps,
	createFormFieldsFromConfig,
	mapFormDataToApiParams
} from "@api-playground/utils/formConfigUtils";

import { GeocodeCommandOutput, ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";
import { useOptimisticSearchParams } from "nuqs/adapters/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import "./styles.scss";

const {
	MAP_RESOURCES: { MAP_LANGUAGES }
} = appConfig;

interface CustomRequestProps {
	onResponseReceived?: (response: ReverseGeocodeCommandOutput | GeocodeCommandOutput) => void;
	onReset?: () => void;
	mapContainerHeight?: number;
	urlState: Record<string, any>;
	setUrlState: (state: Record<string, any>) => void;
	handleReset: () => void;
}

export type GeocodeQueryType = "Text" | "Components" | "Hybrid";

export default function CustomRequest({
	onResponseReceived,
	urlState,
	setUrlState,
	mapContainerHeight,
	handleReset
}: CustomRequestProps) {
	useAuthManager();
	const isFirstLoad = useRef(true);
	const isSyncing = useRef(false);
	const [containerRef, setContainerRef] = useState<HTMLDivElement>();

	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const { setMapLanguage, mapLanguage } = useMap();
	const { setSuggestions } = usePlace();

	const store = useCustomRequestStore();
	const { setState } = useCustomRequestStore;

	const searchParams = useOptimisticSearchParams();
	const placeService = usePlaceService();

	const syncUrlState = useCallback(() => {
		const allSearchParams = Object.fromEntries(searchParams.entries());
		const parsedSearchParams = Object.fromEntries(
			Object.entries(allSearchParams).map(([key, value]) => [key, value ? JSON.parse(value) : value])
		);

		const response = parsedSearchParams.response ? JSON.parse(parsedSearchParams.response as string) : undefined;

		setState({
			...parsedSearchParams,
			response
		});
	}, []);

	useEffect(() => {
		if (isFirstLoad.current) {
			syncUrlState();
			isFirstLoad.current = false;
		}
	}, [urlState]);

	useEffect(() => {
		if (isSyncing.current) return;

		isSyncing.current = true;

		if (store.language !== undefined && store.language !== mapLanguage.value) {
			const languageOption = MAP_LANGUAGES.find(option => option.value === store.language) || MAP_LANGUAGES[0];

			setMapLanguage(languageOption);
		}

		isSyncing.current = false;
	}, [store.politicalView, store.language, mapLanguage.value, setMapLanguage]);

	useEffect(() => {
		if (isFirstLoad.current && !isSyncing.current) {
			isSyncing.current = true;

			if (mapLanguage.value !== store.language) {
				setState(prevState => ({
					...prevState,
					language: mapLanguage.value
				}));
			}

			isSyncing.current = false;
		}
	}, [mapLanguage.value, store.language, setState]);

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		const effectiveValue = value === undefined || value === null || value === "" ? null : value;

		const newState = {
			...store,
			[name]: effectiveValue,
			error: undefined
		};
		setState(newState);

		if (Array.isArray(effectiveValue) && effectiveValue.length === 0) {
			setUrlState({ ...urlState, [name]: null });
		} else {
			setUrlState({ ...urlState, [name]: effectiveValue });
		}
	};

	const handleSubmit = async () => {
		setSuggestions();
		try {
			const allSearchParams = Object.fromEntries(searchParams.entries());
			const parsedSearchParams = Object.fromEntries(
				Object.entries(allSearchParams).map(([key, value]) => [key, value ? JSON.parse(value) : value])
			);

			const formFields = apiPlaygroundItem?.formFields || [];
			const defaultValues = formFields.reduce((acc, field) => {
				if (field.defaultValue !== undefined && parsedSearchParams[field.name] === undefined) {
					acc[field.name] = field.defaultValue;
				}
				return acc;
			}, {} as Record<string, any>);

			const storeValues = Object.entries(store).reduce((acc, [key, value]) => {
				if (value === undefined || value === null || value === "") {
					return acc;
				}
				if (Array.isArray(value) && value.length === 0) {
					return acc;
				}
				if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
					return acc;
				}

				acc[key] = value;
				return acc;
			}, {} as Record<string, any>);

			const paramsWithDefaults = Object.entries(defaultValues).reduce(
				(acc, [key, value]) => {
					if (!(key in store)) {
						acc[key] = value;
					}
					return acc;
				},
				{ ...storeValues }
			);

			Object.entries(paramsWithDefaults).forEach(([key, value]) => {
				setUrlState((prev: Record<string, any>) => ({ ...prev, [key]: value }));
			});

			const params = mapFormDataToApiParams(paramsWithDefaults, apiPlaygroundItem?.apiHandler?.paramMapping || {});

			if ((apiPlaygroundItem?.type === "geocode" || apiPlaygroundItem?.id === "geocode") && queryType) {
				if (queryType === "Text") {
					delete (params as any).QueryComponents;
				} else if (queryType === "Components") {
					delete (params as any).QueryText;
				}
			}
			const apiMethod = apiPlaygroundItem?.apiHandler?.apiMethod as keyof typeof placeService;

			if (typeof placeService[apiMethod] === "function") {
				const response = await (placeService[apiMethod] as any)(params);
				setState({
					...store,
					...defaultValues,
					response,
					submittedQueryRadius: store.queryRadius || undefined,
					error: undefined
				});
				setUrlState((prev: Record<string, any>) => ({ ...prev, response: JSON.stringify(response) }));
				onResponseReceived?.(response);
			} else {
				throw new Error(`API method ${apiMethod} not found`);
			}
		} catch (error) {
			errorHandler(error);
			setUrlState((prev: Record<string, any>) => ({ ...prev, response: { ResultItems: (error as Error).message }  }));
			onResponseReceived?.(error as ReverseGeocodeCommandOutput | GeocodeCommandOutput);
			setState({ ...store, response: { ResultItems: (error as Error).message } as unknown as ReverseGeocodeCommandOutput | GeocodeCommandOutput });
		}
	};

	const handleToggle = (fieldName: string, enabled: boolean) => {
		const newState = {
			...store,
			[fieldName]: enabled ? 1 : null,
			...(fieldName === "queryRadius" && !enabled ? { submittedQueryRadius: undefined } : {}),
			error: undefined
		};
		setState(newState);

		const value = enabled ? 1 : null;
		if (Array.isArray(value) && value.length === 0) {
			setUrlState({ ...urlState, [fieldName]: null });
		} else {
			setUrlState({ ...urlState, [fieldName]: value });
		}
	};

	const formFields = createFormFieldsFromConfig(apiPlaygroundItem?.formFields || [], store);

	const isGeocode = apiPlaygroundItem?.type === "geocode" || apiPlaygroundItem?.id === "geocode";
	const queryType: GeocodeQueryType = (store.queryType as any) || "Text";
	const queryComponentsFieldNames = new Set([
		"addressNumber",
		"country",
		"district",
		"locality",
		"postalCode",
		"region",
		"street",
		"subRegion"
	]);

	const filteredFields = isGeocode
		? formFields.filter(field => {
				if (field.name === "query") {
					return queryType !== "Components";
				}
				if (queryComponentsFieldNames.has(field.name)) {
					return queryType !== "Text";
				}
				return true;
		  })
		: formFields;

	formFields.forEach(field => {
		const storeValue = store[field.name as keyof CustomRequestStore];
		if (storeValue !== undefined) {
			switch (field.type) {
				case "checkbox":
					(field as any).values = Array.isArray(storeValue) ? storeValue : [];
					break;
				case "multiSelect":
				case "lngLatInput":
				case "coordinateInput":
					(field as any).value = Array.isArray(storeValue) ? storeValue : [];
					break;
				case "dropdown":
					(field as any).value = storeValue || field.defaultValue;
					break;
				default:
					(field as any).value = storeValue;
			}
		}
	});

	const isSubmitDisabled = (() => {
		const visibleFields = isGeocode ? filteredFields : formFields;
		const requiredFields = visibleFields.filter((f: any) => f.required);

		const anyQueryComponentsFilled = (() => {
			const names = Array.from(queryComponentsFieldNames);
			return names.some(n => {
				const v = store[n as keyof CustomRequestStore];
				return typeof v === "string" ? v.trim().length > 0 : false;
			});
		})();

		if (isGeocode && queryType === "Components" && !anyQueryComponentsFilled) return true;
		if (isGeocode && queryType === "Text" && (!store.query || store.query.trim() === "")) return true;

		return requiredFields.some((f: any) => {
			const key = f.name as keyof CustomRequestStore;
			const val = store[key];
			const isCoordinateField = f.name === "queryPosition" || f.name === "biasPosition";

			if (Array.isArray(val)) {
				if (val.length === 0) return true;

				if (isCoordinateField) {
					return val.some(v => v === undefined || v === null || v === "");
				}

				return (val as unknown[]).every((v: unknown) => v === "" || v === "0" || !v);
			}

			if (typeof val === "string") {
				return isCoordinateField ? val === "" : val === "" || val === "0";
			}

			if (typeof val === "number") {
				return isCoordinateField ? false : val === 0;
			}

			return val === undefined || val === null;
		});
	})();

	const handleQueryTypeChange = (queryType: GeocodeQueryType) => {
		const cleared: Partial<CustomRequestStore> = { queryType: queryType };
		if (queryType === "Text") {
			cleared.addressNumber = "";
			cleared.country = "";
			cleared.district = "";
			cleared.locality = "";
			cleared.postalCode = "";
			cleared.region = "";
			cleared.street = "";
			cleared.subRegion = "";
		} else if (queryType === "Components") {
			cleared.query = undefined as any;
		}
		setState({ ...store, ...cleared });
		setUrlState({
			...urlState,
			queryType: queryType,
			...(queryType === "Text"
				? {
						addressNumber: null,
						country: null,
						district: null,
						locality: null,
						postalCode: null,
						region: null,
						street: null,
						subRegion: null
				  }
				: queryType === "Components"
				? { query: null }
				: {})
		});
	};
	const headerContent = isGeocode ? (
		<SegmentedControl
			label="Query Type"
			options={[
				{ label: "Text", value: "Text" },
				{ label: "Components", value: "Components" },
				{ label: "Hybrid", value: "Hybrid" }
			]}
			value={queryType}
			onChange={value => handleQueryTypeChange(value as GeocodeQueryType)}
		/>
	) : null;

	return (
		<div className="custom-request-container" ref={ref => setContainerRef(ref as HTMLDivElement)}>
			<FormRender
				fields={filteredFields}
				content={convertFormContentConfigToContentProps(apiPlaygroundItem?.formContent || { type: "list", items: [] })}
				onChange={handleChange}
				onReset={handleReset}
				onSubmit={handleSubmit}
				submitButtonText={apiPlaygroundItem?.submitButtonText || "Submit"}
				onToggle={handleToggle}
				containerHeight={containerRef?.clientHeight}
				submitButtonDisabled={isSubmitDisabled}
				mapContainerHeight={mapContainerHeight}
				headerContent={headerContent}
			/>
		</div>
	);
}
