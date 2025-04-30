import { Fragment, forwardRef, lazy, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";

// import { CheckboxField, Flex } from "@aws-amplify/ui-react";
// import {
// 	CalculateRouteCommandInput,
// 	DescribeTrackerCommandInput,
// 	GetDevicePositionCommandInput,
// 	GetGeofenceCommandInput,
// 	GetMapTileCommandInput,
// 	ListGeofencesCommandInput,
// 	SearchPlaceIndexForPositionCommandInput,
// 	SearchPlaceIndexForSuggestionsCommandInput,
// 	SearchPlaceIndexForTextCommandInput
// } from "@aws-sdk/client-location";
// import { IconInfo } from "@api-playground/assets/svgs";
// import { showToast } from "@api-playground/core/Toast";
// import { useApiPlayground } from "@api-playground/hooks";
import { ApiIdEnum, ApiRequestObj, FieldTypeEnum, RequestParam, ToastType } from "@api-playground/types";
// import { buildRequestObject, isVisible } from "@api-playground/utils";
// import { Tooltip } from "react-tooltip";
// import "./styles.scss";

// const InputField = lazy(() =>
// 	import("@api-playground/atomicui/molecules/InputField").then(module => ({ default: module.InputField }))
// );
// const SimpleDropdownEl = lazy(() =>
// 	import("../SimpleDropdownEl").then(module => ({ default: module.SimpleDropdownEl }))
// );

export interface RequestParamsFormRef {
	handleSubmit: () => void;
	handleReset: () => void;
}

interface RequestParamsFormProps {
	apiId: string;
	requestParams: RequestParam[];
}

const RequestParamsForm = forwardRef<RequestParamsFormRef, RequestParamsFormProps>(({ apiId, requestParams }, ref) => { return null });
// 	const [formValues, setFormValues] = useState<{ [key: string]: string | boolean }>({});
// 	const [apiRequest, setApiRequest] = useState<ApiRequestObj>({});
// 	const [paramsToRender, setParamsToRender] = useState<RequestParam[]>([]);
// 	const {
// 		getMapTile,
// 		searchPlaceIndexForPosition,
// 		searchPlaceIndexForSuggestions,
// 		searchPlaceIndexForText,
// 		calculateRoute,
// 		getGeofence,
// 		listGeofences,
// 		describeTracker,
// 		getDevicePosition,
// 		resetStore: resetApiPlaygroundStore
// 	} = useApiPlayground();
// 	console.log({ apiRequest });

// 	const requestObj = useMemo(() => buildRequestObject(requestParams), [requestParams]);
// 	const requiredParams = useMemo(() => requestParams.filter(param => param.required), [requestParams]);
// 	// const dependentParams = useMemo(() => requestParams.filter(param => !!param.visibleIf), [requestParams]);
// 	// const editableParams = useMemo(() => requestParams.filter(param => param.isEditable), [requestParams]);
// 	// const nestedParams = useMemo(() => requestParams.filter(param => !!param.subParams), [requestParams]);
// 	// const conditionalParams = useMemo(() => requestParams.filter(param => !!param.visibleIf), [requestParams]);

// 	const handleReset = () => {
// 		setFormValues({});
// 		setApiRequest({});
// 		resetApiPlaygroundStore();
// 	};

// 	const handleSubmit = () => {
// 		const existsInApiRequest = requiredParams.every(param => !!apiRequest[param.name]);

// 		if (existsInApiRequest) {
// 			switch (apiId) {
// 				case ApiIdEnum.GetMapTileCommand:
// 					getMapTile(apiRequest as unknown as GetMapTileCommandInput);
// 					break;
// 				case ApiIdEnum.SearchPlaceIndexForPositionCommand:
// 					searchPlaceIndexForPosition(apiRequest as unknown as SearchPlaceIndexForPositionCommandInput);
// 					break;
// 				case ApiIdEnum.SearchPlaceIndexForSuggestionsCommand:
// 					searchPlaceIndexForSuggestions(apiRequest as unknown as SearchPlaceIndexForSuggestionsCommandInput);
// 					break;
// 				case ApiIdEnum.SearchPlaceIndexForTextCommand:
// 					searchPlaceIndexForText(apiRequest as unknown as SearchPlaceIndexForTextCommandInput);
// 					break;
// 				case ApiIdEnum.CalculateRouteCommand:
// 					calculateRoute(apiRequest as unknown as CalculateRouteCommandInput);
// 					break;
// 				case ApiIdEnum.GetGeofenceCommand:
// 					getGeofence(apiRequest as unknown as GetGeofenceCommandInput);
// 					break;
// 				case ApiIdEnum.ListGeofencesCommand:
// 					listGeofences(apiRequest as unknown as ListGeofencesCommandInput);
// 					break;
// 				case ApiIdEnum.DescribeTrackerCommand:
// 					describeTracker(apiRequest as unknown as DescribeTrackerCommandInput);
// 					break;
// 				case ApiIdEnum.GetDevicePositionCommand:
// 					getDevicePosition(apiRequest as unknown as GetDevicePositionCommandInput);
// 					break;
// 				default:
// 					break;
// 			}
// 		} else {
// 			showToast({ content: "Missing one or more mandatory fields", type: ToastType.ERROR });
// 		}
// 	};

// 	useImperativeHandle(ref, () => ({
// 		handleReset,
// 		handleSubmit
// 	}));

// 	/* Updates paramsToRender state based on API request object */
// 	const updateParamsToRender = useCallback(
// 		(requestObj: ApiRequestObj) => {
// 			const formParams = requestParams.filter(param => param.shouldRender && isVisible(requestObj, param));
// 			setParamsToRender(formParams);
// 		},
// 		[requestParams]
// 	);

// 	/* Create initial apiRequest and update paramsToRender */
// 	useEffect(() => {
// 		if (Object.keys(apiRequest).length === 0) {
// 			setApiRequest(requestObj);
// 		} else {
// 			updateParamsToRender(requestObj);
// 		}
// 	}, [apiRequest, requestObj, setApiRequest, updateParamsToRender]);

// 	/* Update formvValues and apiRequest when form values changes */
// 	const handleInputChange = (fieldType: FieldTypeEnum, name: string, value: string | boolean) => {
// 		setFormValues(s => ({ ...s, [name]: value }));
// 		const strArr = value.toString().split(",");
// 		const isValidStringArr = strArr.every(str => str.trim().length > 0) && strArr.length >= 1;
// 		const numArr = value
// 			.toString()
// 			.split(",")
// 			.map(str => Number(str.trim()));
// 		const isValidNumberArr = numArr.every(num => !isNaN(num)) && numArr.length >= 2;

// 		switch (fieldType) {
// 			case FieldTypeEnum.STRING_INPUT:
// 				setApiRequest(s => ({ ...s, [name]: value ? `${value}` : undefined }));
// 				break;
// 			case FieldTypeEnum.STRING_INPUT_ARRAY:
// 				setApiRequest(s => ({
// 					...s,
// 					[name]: isValidStringArr ? strArr : undefined
// 				}));
// 				break;
// 			case FieldTypeEnum.NUMBER_INPUT:
// 				setApiRequest(s => ({ ...s, [name]: value ? Number(value) : undefined }));
// 				break;
// 			case FieldTypeEnum.NUMBER_INPUT_ARRAY:
// 				setApiRequest(s => ({ ...s, [name]: isValidNumberArr ? numArr : undefined }));
// 				break;
// 			case FieldTypeEnum.COORDINATES:
// 				setApiRequest(s => ({
// 					...s,
// 					[name]: isValidNumberArr ? [numArr[1], numArr[0]] : undefined
// 				}));
// 				break;
// 			case FieldTypeEnum.COORDINATES_ARRAY:
// 				break;
// 			case FieldTypeEnum.CHECKBOX:
// 				break;
// 			case FieldTypeEnum.DROPDOWN:
// 				setApiRequest(s => ({ ...s, [name]: value ? `${value}` : undefined }));
// 				break;
// 			case FieldTypeEnum.PARENT:
// 				break;
// 			default:
// 				break;
// 		}
// 	};

// 	const renderLabel = (param: RequestParam) => {
// 		const { name, required, description } = param;
// 		return (
// 			<Flex className="label">
// 				<label className="text bold small-text" htmlFor={name}>
// 					{required ? `${name}*` : name}
// 				</label>
// 				<IconInfo
// 					className="info-icon"
// 					data-tooltip-id={name}
// 					data-tooltip-place="top"
// 					data-tooltip-content={description}
// 				/>
// 				<Tooltip id={name} />
// 			</Flex>
// 		);
// 	};

// 	const renderFormField = (param: RequestParam) => {
// 		const {
// 			fieldType,
// 			name,
// 			defaultValue,
// 			isEditable,
// 			validValues
// 			// type,
// 			// subParams
// 		} = param;
// 		const defaultVal = defaultValue ? defaultValue : "";

// 		switch (fieldType) {
// 			case FieldTypeEnum.STRING_INPUT:
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						<InputField
// 							dataTestId={`input-${name}`}
// 							id={name}
// 							name={name}
// 							type={"text"}
// 							value={Object.hasOwn(formValues, name) ? (formValues[name] as string) : (defaultVal as string)}
// 							onChange={e => handleInputChange(fieldType, name, e.target.value)}
// 							disabled={!isEditable}
// 						/>
// 					</Flex>
// 				);
// 			case FieldTypeEnum.STRING_INPUT_ARRAY:
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						<InputField
// 							dataTestId={`input-${name}`}
// 							id={name}
// 							name={name}
// 							type={"text"}
// 							value={Object.hasOwn(formValues, name) ? (formValues[name] as string) : (defaultVal as string)}
// 							onChange={e => handleInputChange(fieldType, name, e.target.value)}
// 							disabled={!isEditable}
// 						/>
// 					</Flex>
// 				);
// 			case FieldTypeEnum.NUMBER_INPUT:
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						<InputField
// 							dataTestId={`input-${name}`}
// 							id={name}
// 							name={name}
// 							type={"number"}
// 							value={Object.hasOwn(formValues, name) ? (formValues[name] as string) : (defaultVal as string)}
// 							onChange={e => handleInputChange(fieldType, name, e.target.value)}
// 							disabled={!isEditable}
// 						/>
// 					</Flex>
// 				);
// 			case FieldTypeEnum.NUMBER_INPUT_ARRAY:
// 			case FieldTypeEnum.COORDINATES:
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						<InputField
// 							dataTestId={`input-${name}`}
// 							id={name}
// 							name={name}
// 							type={"text"}
// 							value={Object.hasOwn(formValues, name) ? (formValues[name] as string) : (defaultVal as string)}
// 							onChange={e => handleInputChange(fieldType, name, e.target.value)}
// 							disabled={!isEditable}
// 						/>
// 					</Flex>
// 				);
// 			case FieldTypeEnum.COORDINATES_ARRAY:
// 				// [[-12.12, 12.12], [-12.12, 12.12]]
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						coordinates-array
// 					</Flex>
// 				);
// 			case FieldTypeEnum.CHECKBOX:
// 				return (
// 					<Flex className="form-field">
// 						<CheckboxField
// 							data-testid={`checkbox-${name}`}
// 							id={name}
// 							// className="sm-checkbox"
// 							name={name}
// 							label={""}
// 							value={name}
// 							checked={apiRequest[name] ? (apiRequest[name] as boolean) : (defaultValue as boolean)}
// 							onChange={e => handleInputChange(fieldType, name, e.target.checked)}
// 						/>
// 						{renderLabel(param)}
// 					</Flex>
// 				);
// 			case FieldTypeEnum.DROPDOWN:
// 				return (
// 					<Flex className="form-field col">
// 						{renderLabel(param)}
// 						<SimpleDropdownEl
// 							defaultOption={defaultValue as string}
// 							options={validValues as string[]}
// 							onSelect={option => handleInputChange(fieldType, name, option)}
// 							disabled={!isEditable}
// 						/>
// 					</Flex>
// 				);
// 			case FieldTypeEnum.PARENT:
// 				return null;
// 			default:
// 				return null;
// 		}
// 	};

// 	return (
// 		<Flex className="request-params-form">
// 			{paramsToRender.map((param, idx) => (
// 				<Fragment key={idx}>{renderFormField(param)}</Fragment>
// 			))}
// 		</Flex>
// 	);
// });

export default RequestParamsForm;
