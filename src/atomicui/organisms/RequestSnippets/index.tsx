/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { FullScreenOff, FullScreenOn } from "@api-playground/assets/pngs";
import { IconCollapse, IconCopy, IconExpand } from "@api-playground/assets/svgs";
import { Accordion } from "@api-playground/atomicui/atoms/Accordion";
import { useApiPlaygroundItem } from "@api-playground/hooks/useApiPlaygroundList";
import { useUrlState } from "@api-playground/hooks/useUrlState";
import { useCustomRequestStore } from "@api-playground/stores";
import { RequestSnippetsProps } from "@api-playground/stores/useCustomRequestStore";

import { Button, Divider, Tabs, Text, View } from "@aws-amplify/ui-react";
import React, { FC, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles.scss";

type TabType = "JavaScript" | "Python" | "Ruby";

const RequestSnippets: FC<RequestSnippetsProps> = ({
	isFullScreen,
	onFullScreenToggle,
	response,
	isOpen = true,
	onToggle,
	onWidthChange
}) => {
	const store = useCustomRequestStore();
	const [selectedTab, setSelectedTab] = useState<TabType>("JavaScript");
	const { apiPlaygroundId } = useParams();
	const apiPlaygroundItem = useApiPlaygroundItem(apiPlaygroundId);
	const [isExpanded, setIsExpanded] = useState(false);

	const { shareableUrl } = useUrlState({
		defaultValue: store,
		paramName: apiPlaygroundItem?.id || "reverseGeocode"
	});

	const getDefaultParams = () => {
		const defaultParams: Record<string, unknown> = {};
		const paramMapping = apiPlaygroundItem?.apiHandler?.paramMapping || {};
		const placeholders = apiPlaygroundItem?.codeSnippets?.paramPlaceholders || {};

		Object.entries(placeholders).forEach(([key, value]) => {
			const matchingParam = Object.entries(paramMapping).find(
				([paramKey]) => paramKey.toLowerCase() === key.toLowerCase()
			);

			if (matchingParam) {
				const [, paramName] = matchingParam;
				let parsedValue: unknown;
				try {
					parsedValue = JSON.parse(value);
				} catch {
					parsedValue = value;
				}

				const parts = paramName.split(".");
				let current = defaultParams;
				parts.forEach((part, index) => {
					if (index === parts.length - 1) {
						current[part] = parsedValue;
					} else {
						current[part] = current[part] || {};
						current = current[part] as Record<string, unknown>;
					}
				});
			}
		});

		const isGeocode = apiPlaygroundItem?.id === "geocode" || apiPlaygroundItem?.type === "geocode";
		if (isGeocode) {
			if (store.queryType === "Components") {
				delete (defaultParams as any).QueryText;
			} else if (store.queryType === "Text") {
				delete (defaultParams as any).QueryComponents;
			}
		}

		return defaultParams;
	};

	const isRequestObjectDefault = (requestObj: Record<string, unknown>): boolean => {
		const defaultParams = getDefaultParams();

		if (Object.keys(requestObj).length === 0) {
			return false;
		}

		const requestKeys = Object.keys(requestObj);
		const defaultKeys = Object.keys(defaultParams);

		if (requestKeys.length !== defaultKeys.length) {
			return false;
		}

		return requestKeys.every(key => {
			const requestValue = requestObj[key];
			const defaultValue = defaultParams[key];

			if (
				requestValue &&
				typeof requestValue === "object" &&
				!Array.isArray(requestValue) &&
				defaultValue &&
				typeof defaultValue === "object" &&
				!Array.isArray(defaultValue)
			) {
				return isRequestObjectDefault(requestValue as Record<string, unknown>);
			}

			if (Array.isArray(requestValue) && Array.isArray(defaultValue)) {
				return JSON.stringify(requestValue) === JSON.stringify(defaultValue);
			}

			return requestValue === defaultValue;
		});
	};

	const requestObject = useMemo(() => {
		if (!response) {
			return getDefaultParams();
		}

		const defaultParams = getDefaultParams();
		const placeholderParams = getDefaultParams();

		const urlParams: Record<string, unknown> = {};
		const searchParams = Array.from(new URL(shareableUrl).searchParams.entries()).filter(([key]) => key !== "response");

		searchParams.forEach(([key, value]) => {
			const matchingParam = Object.entries(apiPlaygroundItem?.apiHandler?.paramMapping || {}).find(
				([paramKey]) => paramKey.toLowerCase() === key.toLowerCase()
			);

			const paramName = matchingParam?.[1] || key;
			let parsedValue: unknown;
			try {
				parsedValue = JSON.parse(value);
			} catch {
				parsedValue = value;
			}

			const parts = paramName.split(".");
			let current = urlParams;
			parts.forEach((part, index) => {
				if (index === parts.length - 1) {
					current[part] = parsedValue;
				} else {
					current[part] = current[part] || {};
					current = current[part] as Record<string, unknown>;
				}
			});
		});

		const combined = { ...defaultParams, ...placeholderParams, ...urlParams } as Record<string, unknown>;

		const isGeocode = apiPlaygroundItem?.id === "geocode" || apiPlaygroundItem?.type === "geocode";
		if (isGeocode) {
			if (store.queryType === "Components") {
				delete (combined as any).QueryText;
			} else if (store.queryType === "Text") {
				delete (combined as any).QueryComponents;
			}
		}

		return combined;
	}, [response, apiPlaygroundItem?.apiHandler?.paramMapping, apiPlaygroundItem?.formFields]);

	const CODE_SNIPPETS = useMemo(() => {
		if (!apiPlaygroundItem?.codeSnippets) {
			return {
				JavaScript: "",
				Python: "",
				Ruby: ""
			};
		}

		const snippets = { ...apiPlaygroundItem.codeSnippets } as unknown as Record<string, string>;

		// Replace placeholder values with default values
		(["JavaScript", "Python", "Ruby"] as const).forEach(language => {
			let code = snippets[language];
			const defaultParams = getDefaultParams();

			// Find all placeholders in the format [{{key}}]
			const placeholderRegex = /\[{{(\w+)}}\]/g;
			let match;
			while ((match = placeholderRegex.exec(code)) !== null) {
				const placeholder = match[0];
				const key = match[1];

				// First try to get value from paramPlaceholders
				const placeholderValue = apiPlaygroundItem?.codeSnippets?.paramPlaceholders?.[key];
				if (placeholderValue !== undefined) {
					code = code.replace(placeholder, placeholderValue);
					continue;
				}

				// If no placeholder value, try to get from paramMapping
				const matchingParam = Object.entries(apiPlaygroundItem?.apiHandler?.paramMapping || {}).find(
					([paramKey]) => paramKey.toLowerCase() === key.toLowerCase()
				);

				if (matchingParam) {
					const [, paramName] = matchingParam;
					const defaultValue = defaultParams[paramName];
					if (defaultValue !== undefined) {
						// Replace the placeholder with the default value
						code = code.replace(
							placeholder,
							Array.isArray(defaultValue) ? `[${defaultValue.join(", ")}]` : String(defaultValue ?? "")
						);
					}
				}
			}
			snippets[language] = code;
		});

		// If no response yet, return the snippets with default values
		if (!response || !requestObject) {
			return snippets;
		}

		(["JavaScript", "Python", "Ruby"] as const).forEach(language => {
			let code = snippets[language];

			let paramsStart = code.indexOf("const params = {");
			let paramsEnd = code.indexOf("};", paramsStart);

			if (language === "Python") {
				paramsStart = code.indexOf("params = {");
				paramsEnd = code.indexOf("\n}\n", paramsStart);
			}

			if (language === "Ruby") {
				paramsStart = code.indexOf("params = {");
				paramsEnd = code.indexOf("\n}\n\n", paramsStart);
			}

			if (paramsStart === -1 || paramsEnd === -1) return;

			const getIndentConfig = (language: string) => {
				switch (language) {
					case "Python":
						return { size: 4, char: " " };
					case "Ruby":
					case "JavaScript":
					default:
						return { size: 2, char: " " };
				}
			};

			const formatKey = (key: string, language: string, level: number) => {
				const { size, char } = getIndentConfig(language);
				const indent = char.repeat(level * size);
				if (language === "Python") {
					return `${indent}'${key}'`;
				}
				return `${indent}${key}`;
			};

			const formatValue = (value: unknown, isString: boolean, language: string) => {
				if (language === "Python") {
					return isString ? `'${value}'` : value;
				}
				return isString ? `"${value}"` : value;
			};

			const formatObject = (obj: Record<string, unknown>, language: string, level = 1): string => {
				const { size, char } = getIndentConfig(language);
				const parentIndent = char.repeat((level - 1) * size);

				const lines = Object.entries(obj).map(([key, value]) => {
					if (value && typeof value === "object" && !Array.isArray(value)) {
						const nestedObj = formatObject(value as Record<string, unknown>, language, level + 1);
						return `${formatKey(key, language, level)}: ${nestedObj}`;
					}
					if (Array.isArray(value)) {
						const formattedValues = value
							.map((v: unknown) => formatValue(v, typeof v === "string", language))
							.join(", ");
						return `${formatKey(key, language, level)}: [${formattedValues}]`;
					}
					return `${formatKey(key, language, level)}: ${formatValue(value, typeof value === "string", language)}`;
				});

				return `{\n${lines.join(",\n")}\n${parentIndent}}`;
			};

			const paramsLines = Object.entries(requestObject).map(([key, value]) => {
				let line = "";
				const { size, char } = getIndentConfig(language);
				const indent = char.repeat(size);

				if (value && typeof value === "object" && !Array.isArray(value)) {
					const nestedObj = formatObject(value as Record<string, unknown>, language, 2);
					if (language === "Python") {
						line = `${indent}'${key}': ${nestedObj}`;
					} else {
						line = `${indent}${key}: ${nestedObj}`;
					}
				} else if (Array.isArray(value)) {
					const formattedValues = value.map((v: unknown) => formatValue(v, typeof v === "string", language)).join(", ");
					if (language === "Python") {
						line = `${indent}'${key}': [${formattedValues}]`;
					} else {
						line = `${indent}${key}: [${formattedValues}]`;
					}
				} else {
					if (language === "Python") {
						line = `${indent}'${key}': ${formatValue(value, typeof value === "string", language)}`;
					} else {
						line = `${indent}${key}: ${formatValue(value, typeof value === "string", language)}`;
					}
				}

				return line;
			});

			let newParamsSection = "{\n" + paramsLines.join(",\n") + "\n";
			if (language === "Python") {
				newParamsSection = "{\n" + paramsLines.join(",\n") + "\n";
			} else if (language === "Ruby") {
				newParamsSection = "{\n" + paramsLines.join(",\n") + "\n";
			} else {
				newParamsSection = "{\n" + paramsLines.join(",\n") + "\n}";
			}
			code =
				code.substring(0, paramsStart) +
				code.substring(paramsStart, code.indexOf("{", paramsStart) + 1) +
				newParamsSection.substring(1) +
				code.substring(paramsEnd + 1);

			snippets[language] = code;
		});

		return snippets;
	}, [apiPlaygroundItem?.codeSnippets, requestObject, response]);

	const handleCopyRequestObject = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify(requestObject, null, 2));
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
		const willExpand = !isExpanded;
		setIsExpanded(willExpand);
		onWidthChange?.();

		if (willExpand && !isOpen) {
			onToggle?.();
		}
	};

	return (
		<View className={`snippets-container ${isExpanded ? "expanded" : ""}`}>
			<Accordion
				open={isOpen}
				onToggle={onToggle}
				contentClassName="snippets-content-container"
				title={
					<View className="accordion-title">
						{isExpanded ? (
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
							<Text>Request</Text>
							<Button gap={"5px"} onClick={handleCopyRequestObject} size="small" variation="link">
								<IconCopy width={20} height={20} />
								<Text>Copy</Text>
							</Button>
						</View>
						<View className={"snippets-container__snippet__content expandable"}>
							{!isRequestObjectDefault(requestObject) || Object.keys(requestObject).length < 1 ? (
								<pre className="response-pre">{JSON.stringify(requestObject, null, 2)}</pre>
							) : (
								<Text color="var(--tertiary-color)">No request yet. Submit a request to see the request object.</Text>
							)}
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

						{response ? (
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
						) : (
							<View className={"snippets-container__snippet__content "}>
								<Text color="var(--tertiary-color)">No response yet. Submit a request to see the code snippets.</Text>
							</View>
						)}
					</View>
				</form>
			</Accordion>
		</View>
	);
};

export default RequestSnippets;
