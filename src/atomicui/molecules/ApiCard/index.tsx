import { FC, useEffect, useRef, useState } from "react";

import { Content } from "@api-playground/atomicui/atoms/Content";
import appConfig from "@api-playground/core/constants/appConfig";
import { Badge, Card, Flex, Image, Text, View, useTheme } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	ENV: { API_PLAYGROUND_URL }
} = appConfig;

export interface ApiCardProps {
	id: string;
	title: string;
	imageSource?: string;
	description: string;
	tags?: string[];
	onCardClick: (apiId: string, apiTitle: string) => () => void;
}

const ApiCard: FC<ApiCardProps> = ({ id, title, imageSource, description, tags, onCardClick }) => {
	const { tokens } = useTheme();
	const { i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const [isExpanded, setIsExpanded] = useState(false);
	const [isCollapsible, setIsCollapsible] = useState(false);
	const textRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (textRef.current) {
			const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight || "20");
			const maxLines = 3;
			const maxHeight = lineHeight * maxLines;
			if (textRef.current.scrollHeight > maxHeight + 2) {
				setIsCollapsible(true);
			}
		}
	}, [description]);

	return (
		<View data-testid="api-card-container" key={id} className={"card-container"}>
			<Card data-testid="api-card" onClick={onCardClick(id, title)} variation="outlined">
				<Flex direction={"column"} alignItems="flex-start" gap="0">
					{!!imageSource && (
						<Image className="card-image" alt="API Image" src={`${API_PLAYGROUND_URL.trim()}/${imageSource}`} />
					)}
					<Flex className="card-content" direction="column" gap={tokens.space.xs}>
						<Text
							className="card-title medium-text bold"
							textAlign={isLtr ? "start" : "end"}
							alignSelf={isLtr ? "start" : "end"}
						>
							{title}
						</Text>

						<div
							className={`card-text regular-text${isCollapsible && !isExpanded ? " collapsed" : ""}`}
							style={
								isCollapsible && !isExpanded ? { maxHeight: "4.2em", overflow: "hidden", position: "relative" } : {}
							}
							ref={textRef}
						>
							<Content items={[{ text: description }]} />
						</div>
						{isCollapsible && (
							<button
								type="button"
								className="show-more-btn"
								onClick={e => {
									e.stopPropagation();
									setIsExpanded(v => !v);
								}}
							>
								{isExpanded ? "Show less" : "Show more"}
							</button>
						)}

						{!!tags && (
							<Flex className="card-category">
								{tags.map(tag => (
									<Badge size={"large"} className="small-text">
										{tag}
									</Badge>
								))}
							</Flex>
						)}
					</Flex>
				</Flex>
			</Card>
		</View>
	);
};

export default ApiCard;
