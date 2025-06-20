import { FC, useEffect, useMemo, useState } from "react";

import { FullScreenOff, FullScreenOn } from "@api-playground/assets/pngs";
import { IconCollapse, IconCopy, IconExpand } from "@api-playground/assets/svgs";
import { Accordion } from "@api-playground/atomicui/atoms/Accordion";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useReverseGeoCodeRequestStore } from "@api-playground/stores";
import { Button, Divider, Tabs, Text, View } from "@aws-amplify/ui-react";
import "./styles.scss";
import { ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";

const SNIPPETS_COLLAPSED_WIDTH = 400;
const SNIPPETS_EXPANDED_WIDTH = 750;

type TabType = "JavaScript" | "Python" | "Ruby";

interface RequestSnippetsProps {
	width: number;
	onWidthChange: (width: number) => void;
	isFullScreen: boolean;
	onFullScreenToggle: () => void;
	response?: ReverseGeocodeCommandOutput;
}

const RequestSnippets: FC<RequestSnippetsProps> = ({
	width,
	onWidthChange,
	isFullScreen,
	onFullScreenToggle,
	response
}) => {
	const store = useReverseGeoCodeRequestStore();
	const [selectedTab, setSelectedTab] = useState<TabType>("JavaScript");

	const { shareableUrl } = useUrlState({
		defaultValue: store,
		paramName: "reverseGeocode"
	});

	// Make CODE_SNIPPETS reactive to store changes
	const CODE_SNIPPETS = useMemo(
		() => ({
			JavaScript: `import { GeoPlacesClient, ReverseGeocodeCommand } from "@aws-sdk/client-geo-places";

// Initialize the client
const client = new GeoPlacesClient({
  region: "us-east-1" // Replace with your region
});

// Create the reverse geocode request
const params = {
  Position: [${store.queryPosition?.[0] || 0}, ${store.queryPosition?.[1] || 0}], // [longitude, latitude]
  MaxResults: ${store.maxResults || 1}
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
    'Position': [${store.queryPosition?.[0] || 0}, ${store.queryPosition?.[1] || 0}],  # [longitude, latitude]
    'MaxResults': ${store.maxResults || 1}
}

# Make the request
response = client.reverse_geocode(**params)
print(response)`,
			Ruby: `require 'aws-sdk-geoplaces'

# Initialize the client
client = Aws::GeoPlaces::Client.new(region: 'us-east-1')  # Replace with your region

# Create the reverse geocode request
params = {
  position: [${store.queryPosition?.[0] || 0}, ${store.queryPosition?.[1] || 0}],  # [longitude, latitude]
  max_results: ${store.maxResults || 1}
}

# Make the request
response = client.reverse_geocode(params)
puts response`
		}),
		[store.queryPosition, store.maxResults]
	);

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
				await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
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

	const renderCodeBlock = (code: string, lang: string) => (
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
		<View className="snippets-container">
			<Accordion
				defaultOpen={true}
				style={{
					width: `${width}px`
				}}
				contentClassName="scrollable-content"
				title={
					<View className="accordion-title">
						{width === SNIPPETS_EXPANDED_WIDTH ? (
							<IconCollapse onClick={handleWidthToggle} style={{ cursor: "pointer" }} />
						) : (
							<IconExpand onClick={handleWidthToggle} style={{ cursor: "pointer" }} />
						)}
						Request Snippets
						<Button className="fullscreen-button" style={{ marginLeft: "auto" }} onClick={onFullScreenToggle}>
							<img src={isFullScreen ? FullScreenOff : FullScreenOn} style={{ width: 15, height: 15 }} />
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
						<View className="snippets-container__snippet__content">
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
						<View className="snippets-container__snippet__content">
							{response ? (
								<pre style={{ margin: 0, fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
									{JSON.stringify(response, null, 2)}
								</pre>
							) : (
								<Text color="var(--tertiary-color)">No response yet. Submit a request to see the response.</Text>
							)}
						</View>
					</View>

					<Divider />

					<View className="snippets-container__snippet">
						<View className="snippets-container__snippet__heading">
							<Text>Code snippets</Text>
							<Button gap={"5px"} onClick={handleCopyCode} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>

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
									content: renderCodeBlock(CODE_SNIPPETS.JavaScript, "javascript")
								},
								{ label: "Python", value: "Python", content: renderCodeBlock(CODE_SNIPPETS.Python, "python") },
								{ label: "Ruby", value: "Ruby", content: renderCodeBlock(CODE_SNIPPETS.Ruby, "ruby") }
							]}
						/>
					</View>
				</form>
			</Accordion>
		</View>
	);
};

export default RequestSnippets;
