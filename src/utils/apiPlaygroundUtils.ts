import { ApiRequestObj, ApiRequestObjValues, RequestParam } from "@api-playground/types/ApiPlaygroundModel";
import { FieldTypeEnum } from "@api-playground/types/Enums";

/* Function to check if a parameter is visible based on its dependencies */
export const isVisible = (requestObject: ApiRequestObj, param: RequestParam): boolean => {
	if (!param.visibleIf) return true;

	const [depName, depValue1, depValue2] = param.visibleIf;

	return depValue1 && depValue2
		? requestObject[depName] === depValue1 || requestObject[depName] === depValue2
		: requestObject[depName] === depValue1;
};

export const getDefaultValueForRequestObj = ({ fieldType, required, defaultValue }: RequestParam) => {
	switch (fieldType) {
		case FieldTypeEnum.STRING_INPUT:
		case FieldTypeEnum.STRING_INPUT_ARRAY:
		case FieldTypeEnum.NUMBER_INPUT:
		case FieldTypeEnum.NUMBER_INPUT_ARRAY:
		case FieldTypeEnum.COORDINATES:
		case FieldTypeEnum.COORDINATES_ARRAY:
		case FieldTypeEnum.CHECKBOX:
		case FieldTypeEnum.DROPDOWN:
			if (required) {
				return defaultValue ? defaultValue : "";
			} else {
				return defaultValue ? defaultValue : undefined;
			}
		case FieldTypeEnum.DROPDOWN:
			break;
		default:
			break;
	}
};

/* Function to build request object */
export const buildRequestObject = (params: RequestParam[]): { [key: string]: ApiRequestObjValues } => {
	const requestObject: { [key: string]: ApiRequestObjValues } = {};

	/* Function to build a nested object if needed */
	const buildNestedObject = (
		param: RequestParam,
		allParams: RequestParam[]
	): { [key: string]: ApiRequestObjValues } => {
		const nestedObject: { [key: string]: ApiRequestObjValues } = {};

		if (param.subParams) {
			param.subParams.forEach(subParamName => {
				const subParam = allParams.find(p => p.name === subParamName);

				if (subParam && isVisible(requestObject, subParam)) {
					nestedObject[subParam.name] = getDefaultValueForRequestObj(param);
				}
			});
		}
		return nestedObject;
	};

	params.forEach(param => {
		if (isVisible(requestObject, param) && param.shouldRender) {
			if (param.type === "object" && param.subParams) {
				requestObject[param.name] = buildNestedObject(param, params);
			} else {
				requestObject[param.name] = getDefaultValueForRequestObj(param);
			}
		}
	});

	return requestObject;
};
