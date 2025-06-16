import { FC, useState } from "react";

import { IconCopy, IconExpand } from "@api-playground/assets/svgs";
import { Accordion } from "@api-playground/atomicui/atoms/Accordion";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useReverseGeoCodeRequestStore } from "@api-playground/stores";
import { Button, Divider, Tabs, Text, View } from "@aws-amplify/ui-react";
import "./styles.scss";

type TabType = "JavaScript" | "Python" | "Java";

const RequestSnippets: FC = () => {
	const store = useReverseGeoCodeRequestStore();
	const [selectedTab, setSelectedTab] = useState<TabType>("JavaScript");

	const { shareableUrl } = useUrlState({
		defaultValue: store,
		paramName: "reverseGeocode"
	});

	const CODE_SNIPPETS = {
		JavaScript: `const response = await fetch('${shareableUrl}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
		Python: `import requests\n\nresponse = requests.get('${shareableUrl}')\ndata = response.json()`,
		Java: `import java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\nHttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create(\"${shareableUrl}\"))\n    .build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nString data = response.body();`
	};

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(shareableUrl);
		} catch (err) {
			console.error("Failed to copy URL:", err);
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

	return (
		<View className="snippets-container">
			<Accordion
				defaultOpen={true}
				title={
					<View className="accordion-title">
						<IconExpand /> Request Snippets
					</View>
				}
			>
				<form onSubmit={() => {}} className="form-render">
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
							<Button gap={"5px"} onClick={() => {}} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>
						<View className="snippets-container__snippet__content">
							<Text>Placeholder</Text>
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
								{ label: "Java", value: "Java", content: renderCodeBlock(CODE_SNIPPETS.Java, "java") }
							]}
						/>
					</View>
				</form>
			</Accordion>
		</View>
	);
};

export default RequestSnippets;
