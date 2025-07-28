import React, { FC, useMemo, useState } from "react";

import { FullScreenOff, FullScreenOn } from "@api-playground/assets/pngs";
import { IconCollapse, IconCopy, IconExpand } from "@api-playground/assets/svgs";
import { Accordion } from "@api-playground/atomicui/atoms/Accordion";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useCustomRequestStore } from "@api-playground/stores";
import { RequestSnippetsProps } from "@api-playground/stores/useCustomRequestStore";
import { generateCodeSnippets } from "@api-playground/utils/formConfigUtils";
import { Button, Divider, Tabs, Text, View } from "@aws-amplify/ui-react";
import { useParams } from "react-router-dom";
import "./styles.scss";

const SNIPPETS_COLLAPSED_WIDTH = 400;
const SNIPPETS_EXPANDED_WIDTH = 850;

type TabType = "JavaScript" | "Python" | "Ruby";

const RequestSnippets: FC<RequestSnippetsProps> = ({
	width,
	onWidthChange,
	isFullScreen,
	onFullScreenToggle,
	response,
	isOpen = true,
	onToggle,
	isExpanded
}) => {
	const store = useCustomRequestStore();
	const [selectedTab, setSelectedTab] = useState<TabType>("JavaScript");
	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);

	const { shareableUrl } = useUrlState({
		defaultValue: store,
		paramName: apiPlaygroundItem?.id || "reverseGeocode"
	});

	const CODE_SNIPPETS = useMemo(() => {
		if (apiPlaygroundItem?.codeSnippets) {
			return generateCodeSnippets(apiPlaygroundItem.codeSnippets, {});
		}

		const buildFilterObject = () => {
			if (store?.includePlaceTypes && store.includePlaceTypes.length > 0) {
				return `  Filter: {
    IncludePlaceTypes: [${store.includePlaceTypes.map(type => `"${type}"`).join(", ")}]
  }`;
			}
			return "";
		};

		const buildAdditionalFeatures = () => {
			if (store?.additionalFeatures && store.additionalFeatures.length > 0) {
				return `  AdditionalFeatures: [${store.additionalFeatures.map(feature => `"${feature}"`).join(", ")}]`;
			}
			return "";
		};

		const buildParamsObject = () => {
			const params = [];

			params.push(
				`  Position: [${store?.queryPosition?.[0] || 0}, ${store?.queryPosition?.[1] || 0}] // [longitude, latitude]`
			);

			if (store?.maxResults) {
				params.push(`  MaxResults: ${store.maxResults}`);
			}
			if (store?.language) {
				params.push(`  Language: "${store.language}"`);
			}
			if (store?.politicalView) {
				params.push(`  PoliticalView: "${store.politicalView}"`);
			}
			if (store?.intendedUse) {
				params.push(`  IntendedUse: "${store.intendedUse}"`);
			}
			if (store?.queryRadius) {
				params.push(`  QueryRadius: ${store.queryRadius}`);
			}

			const additionalFeatures = buildAdditionalFeatures();
			if (additionalFeatures) {
				params.push(additionalFeatures);
			}

			const filter = buildFilterObject();
			if (filter) {
				params.push(filter);
			}

			return params.join(",\n");
		};

		return {
			JavaScript: `import { GeoPlacesClient, ReverseGeocodeCommand } from "@aws-sdk/client-geo-places";

// Initialize the client
const client = new GeoPlacesClient({
  region: "us-east-1" // Replace with your region
});

// Create the reverse geocode request
const params = {
${buildParamsObject()}
};

// Make the request
const command = new ReverseGeocodeCommand(params);
const response = await client.send(command);
console.log(response);`,
			Python: `import boto3

# Initialize the client
client = boto3.client('geo-places', region_name='us-east-1')  # Replace with your region

# Create the reverse geocode request
params = {
${buildParamsObject()
	.split("\n")
	.map(line => `    ${line.replace("  ", "")}`)
	.join("\n")}
}

# Make the request
response = client.reverse_geocode(**params)
print(response)`,
			Ruby: `require 'aws-sdk-geoplaces'

# Initialize the client
client = Aws::GeoPlaces::Client.new(region: 'us-east-1')  # Replace with your region

# Create the reverse geocode request
params = {
${buildParamsObject()
	.split("\n")
	.map(line => `  ${line.replace("  ", "")}`)
	.join("\n")}
}

# Make the request
response = client.reverse_geocode(params)
puts response`
		};
	}, [
		apiPlaygroundItem?.codeSnippets,
		store?.queryPosition,
		store?.maxResults,
		store?.language,
		store?.politicalView,
		store?.intendedUse,
		store?.queryRadius,
		store?.additionalFeatures,
		store?.includePlaceTypes
	]);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(shareableUrl);
		} catch (err) {
			console.error("Failed to copy URL:", err);
		}
	};

	const handleCopyResponse = async () => {
		try {
			if (response) {
				await navigator.clipboard.writeText(
					JSON.stringify(
						{
							ResultItems: response.ResultItems
						},
						null,
						2
					)
				);
			}
		} catch (err) {
			console.error("Failed to copy response:", err);
		}
	};

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(CODE_SNIPPETS[selectedTab].replace(/\\n/g, "\n"));
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	const handleTabChange = (value: string) => {
		setSelectedTab(value as TabType);
	};

	const renderCodeBlock = (code: string) => (
		<View className="snippets-container__snippet__content">
			<pre style={{ margin: 0 }}>
				<code>{code.replace(/\\n/g, "\n")}</code>
			</pre>
		</View>
	);

	const handleWidthToggle = (e: React.MouseEvent<SVGSVGElement>) => {
		e.stopPropagation();
		e.preventDefault();
		onWidthChange(width === SNIPPETS_EXPANDED_WIDTH ? SNIPPETS_COLLAPSED_WIDTH : SNIPPETS_EXPANDED_WIDTH);
	};

	return (
		<View className={`snippets-container ${isExpanded ? "expanded" : ""}`}>
			<Accordion
				open={isOpen}
				onToggle={onToggle}
				style={{
					maxWidth: `${width}px`
				}}
				contentClassName="snippets-content-container"
				title={
					<View className="accordion-title">
						{width === SNIPPETS_EXPANDED_WIDTH ? (
							<IconCollapse onClick={handleWidthToggle} style={{ cursor: "pointer" }} />
						) : (
							<IconExpand onClick={handleWidthToggle} style={{ cursor: "pointer" }} />
						)}
						Request Snippets
						<Button
							className="fullscreen-button"
							style={{ marginLeft: "auto" }}
							onClick={e => {
								e.stopPropagation();
								e.preventDefault();
								onFullScreenToggle();
							}}
						>
							<img
								src={isFullScreen ? FullScreenOff : FullScreenOn}
								style={{ width: 15, height: 15 }}
								alt="Toggle Fullscreen"
							/>
						</Button>
					</View>
				}
			>
				<form onSubmit={() => {}} className="snippets-form">
					<View className="snippets-container__snippet">
						<View className="snippets-container__snippet__heading">
							<Text>Request URL</Text>
							<Button gap={"5px"} onClick={handleCopyUrl} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>
						<View className={"snippets-container__snippet__content expandable"}>
							<Text>{shareableUrl}</Text>
						</View>
					</View>

					<Divider />

					<View className="snippets-container__snippet">
						<View className="snippets-container__snippet__heading">
							<Text>Response</Text>
							<Button gap={"5px"} onClick={handleCopyResponse} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>
						<View className={"snippets-container__snippet__content expandable"}>
							{response ? (
								<pre className="response-pre">
									{JSON.stringify(
										{
											ResultItems: response.ResultItems
										},
										null,
										2
									)}
								</pre>
							) : (
								<Text color="var(--tertiary-color)">No response yet. Submit a request to see the response.</Text>
							)}
						</View>
					</View>

					<Divider />

					<View className="snippets-container__snippet code">
						<View className="snippets-container__snippet__heading">
							<Text>Code snippets</Text>
							<Button gap={"5px"} onClick={handleCopyCode} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>

						<View className="expandable-container">
							<Tabs
								justifyContent="flex-start"
								defaultValue="JavaScript"
								value={selectedTab}
								onValueChange={handleTabChange}
								onClick={e => e.preventDefault()}
								items={[
									{
										label: "JavaScript",
										value: "JavaScript",
										content: renderCodeBlock(CODE_SNIPPETS.JavaScript)
									},
									{ label: "Python", value: "Python", content: renderCodeBlock(CODE_SNIPPETS.Python) },
									{ label: "Ruby", value: "Ruby", content: renderCodeBlock(CODE_SNIPPETS.Ruby) }
								]}
							/>
						</View>
					</View>
				</form>
			</Accordion>
		</View>
	);
};

export default RequestSnippets;
