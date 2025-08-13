/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { FormRender } from "@api-playground/atomicui/molecules/FormRender";
import { appConfig } from "@api-playground/core/constants";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import useMap from "@api-playground/hooks/useMap";
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
	const { setMapPoliticalView, setMapLanguage, mapPoliticalView, mapLanguage } = useMap();

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
			...initialState,
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
		const newState = {
			...store,
			[name]: value,
			error: undefined
		};
		setState(newState);

		// Remove empty arrays from URL using immutable logic
		if (Array.isArray(value) && value.length === 0) {
			setUrlState({ ...urlState, [name]: null });
		} else {
			setUrlState({ ...urlState, [name]: value });
		}
	};

	const handleSubmit = async () => {
		try {
			const params = mapFormDataToApiParams(urlState, apiPlaygroundItem?.apiHandler?.paramMapping || {});
			const apiMethod = apiPlaygroundItem?.apiHandler?.apiMethod as keyof typeof placeService;

			if (typeof placeService[apiMethod] === "function") {
				const response = await (placeService[apiMethod] as any)(params);
				setState({
					...store,
					response,
					submittedQueryRadius: store.queryRadius || undefined,
					error: undefined
				});
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
		const newState = {
			...store,
			[fieldName]: enabled ? 1 : null,
			// Clear submittedQueryRadius when queryRadius is disabled
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
		const requiredFields = (apiPlaygroundItem?.formFields || []).filter((f: any) => f.required);

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

	return (
		<div className="custom-request-container" ref={ref => setContainerRef(ref as HTMLDivElement)}>
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
				mapContainerHeight={mapContainerHeight}
			/>
		</div>
	);
}
