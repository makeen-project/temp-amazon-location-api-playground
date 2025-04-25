import { FC, createRef, lazy, useMemo, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "./styles.scss";

const CopyText = lazy(() => import("../CopyText").then(module => ({ default: module.CopyText })));

interface CodeSnippetProps {
	title: string;
	placeholderText?: string;
	singleCodeSnippet?: string;
	multiCodeSnippets?: {
		[key: string]: string;
	};
}

const CodeSnippet: FC<CodeSnippetProps> = ({ title, placeholderText, singleCodeSnippet, multiCodeSnippets }) => {
	const [selectedTab, setSelectedTab] = useState(0);
	const codeSnippetCopyTextRef = createRef<HTMLSpanElement>();

	const languageAndSnippet = useMemo(
		() => (!!multiCodeSnippets ? Object.entries(multiCodeSnippets) : []),
		[multiCodeSnippets]
	);

	return (
		<Flex data-testid="code-snippet-container" className="code-snippet-container">
			<Flex className="code-snippet-header">
				<Text className="title regular-text">{title}</Text>
			</Flex>
			{languageAndSnippet.length > 0 && (
				<Flex className="tabs-section">
					{languageAndSnippet.map(([tabTitle], idx) => (
						<Flex
							key={tabTitle}
							className={`tab ${selectedTab === idx ? "selected" : ""}`}
							onClick={() => setSelectedTab(idx)}
						>
							<Text className="text medium xs-text">{tabTitle}</Text>
						</Flex>
					))}
				</Flex>
			)}
			<Flex className="code-snippet-body">
				{placeholderText && !singleCodeSnippet && languageAndSnippet.length === 0 && (
					<Text className="placeholder-text regular-text">{placeholderText}</Text>
				)}
				{singleCodeSnippet && (
					<SyntaxHighlighter
						data-testid="syntax-highlighter"
						className={"syntax-highlighter"}
						wrapLongLines
						language="jsx"
					>
						{singleCodeSnippet}
					</SyntaxHighlighter>
				)}
				{languageAndSnippet.length > 0 && (
					<Flex className="copy-snippet" onClick={() => codeSnippetCopyTextRef.current?.click()}>
						<CopyText
							ref={codeSnippetCopyTextRef}
							text={languageAndSnippet[selectedTab][1]}
							iconSize={24}
							copyIconColor={"var(--primary-color)"}
							tickIconColor={"var(--primary-color)"}
							// afterCopied={() =>
							// 	record([
							// 		{
							// 			EventType: EventTypeEnum.CODE_SNIPPET_COPIED,
							// 			Attributes: { sampleId: sampleId!, sampleTitle: title }
							// 		}
							// 	])
							// }
						/>
					</Flex>
				)}
				{languageAndSnippet.length > 0 && (
					<SyntaxHighlighter
						data-testid="syntax-highlighter"
						className={"syntax-highlighter"}
						wrapLongLines
						language="jsx"
					>
						{languageAndSnippet[selectedTab][1]}
					</SyntaxHighlighter>
				)}
			</Flex>
		</Flex>
	);
};

export default CodeSnippet;
