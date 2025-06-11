import { useEffect } from "react";

import { IconCopy } from "@api-playground/assets/svgs";
import { ContentProps } from "@api-playground/atomicui/atoms/Content/Content";
import { FormField, FormRender } from "@api-playground/atomicui/molecules/FormRender";
import "./styles.scss";
import { appConfig } from "@api-playground/core/constants";
import useAuthManager from "@api-playground/hooks/useAuthManager";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useReverseGeoCodeRequestStore } from "@api-playground/stores";
import { ReverseGeocodeRequestStore } from "@api-playground/stores/useReverseGeocodeRequestStore";
import { BaseStateProps } from "@api-playground/types/BaseStateProps";
import { AdditionalFeatures, IncludePlaceTypes, IntendedUse } from "@api-playground/types/ReverseGeocodeRequestForm";
import { Button, Heading, Text } from "@aws-amplify/ui-react";

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS, MAP_LANGUAGES }
} = appConfig;

const createFormFields = (urlState: ReverseGeocodeRequestStore): FormField[] => [
	{
		type: "latLonInput",
		name: "queryPosition",
		label: "Query Position",
		required: true,
		defaultValue: urlState.queryPosition?.join(" , ")
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

type StoreType = ReverseGeocodeRequestStore & BaseStateProps;

export default function ReverseGeoCodeRequest() {
	useAuthManager();

	const store = useReverseGeoCodeRequestStore();
	const { urlState, setUrlState, shareableUrl } = useUrlState({
		defaultValue: store,
		paramName: "reverseGeocode"
	});

	// Sync URL state with store state
	useEffect(() => {
		Object.assign(store, urlState);
	}, [urlState, store]);

	const handleChange = ({ name, value }: { name: string; value: unknown }) => {
		const newState = { ...store } as StoreType;

		// Handle nested fields (e.g., filter.includePlaceTypes)
		if (name === "includePlaceTypes") {
			newState.filter = {
				...newState.filter,
				includePlaceTypes: value as IncludePlaceTypes[]
			};
		} else {
			const key = name as keyof ReverseGeocodeRequestStore;
			switch (key) {
				case "queryPosition":
					newState.queryPosition = value as string[];
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

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(shareableUrl);
		} catch (err) {
			console.error("Failed to copy URL:", err);
		}
	};

	return (
		<div className="container">
			<FormRender content={formContent} fields={createFormFields(urlState)} onChange={handleChange} />

			<div className="container__snippet">
				<div>
					<Heading fontSize={"1.2rem"}>Request Snippet</Heading>
				</div>

				<div className="container__snippet__card">
					<div className="container__snippet__heading">
						<Text>Request URL</Text>
						<Button gap={"5px"} onClick={handleCopyUrl} size="small" variation="link">
							<IconCopy width={20} height={20} />
							<Text>Copy</Text>
						</Button>
					</div>
					<div className="container__snippet__content">
						<Text>{shareableUrl}</Text>
					</div>
				</div>
			</div>
		</div>
	);
}
