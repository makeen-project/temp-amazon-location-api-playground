import { FC, Fragment } from "react";

import { Text, View } from "@aws-amplify/ui-react";

import "./styles.scss";

interface ContentItem {
	text: string;
}

export interface ContentProps {
	items: ContentItem[];
	type?: "text" | "list";
	className?: string;
}

const parseHighlightedText = (text: string) => {
	const parts = text.split(/(\[\[.*?\]\])/g);
	return parts.map((part, i) => {
		if (part.startsWith("[[") && part.endsWith("]]")) {
			const highlightedText = part.slice(2, -2);
			return (
				<Text key={i} as="span" className="ct__text--highlighted">
					{highlightedText}
				</Text>
			);
		}
		return <Fragment key={i}>{part}</Fragment>;
	});
};

export const Content: FC<ContentProps> = ({ items, type = "text", className = "" }) => {
	const renderTextItems = () => {
		return items.map((item, index) => (
			<Text key={index} className={`ct__text ${className}`}>
				{parseHighlightedText(item.text)}
			</Text>
		));
	};

	const renderListItems = () => (
		<ol className={`ct__list ${className}`}>
			{items.map((item, index) => (
				<li key={index} className="ct__list-item">
					{parseHighlightedText(item.text)}
				</li>
			))}
		</ol>
	);

	return <View className="ct">{type === "list" ? renderListItems() : renderTextItems()}</View>;
};

export default Content;
