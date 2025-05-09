import { FC } from "react";

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
	brief: string;
	category?: string;
	onCardClick: (apiId: string, apiTitle: string) => () => void;
}

const ApiCard: FC<ApiCardProps> = ({ id, title, imageSource, brief, category, onCardClick }) => {
	const { tokens } = useTheme();
	const { i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

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

						<Text className="card-text regular-text" variation="tertiary" textAlign={isLtr ? "start" : "end"}>
							{brief}
						</Text>

						{!!category && (
							<Flex className="card-category">
								<Badge size={"large"} className="small-text">
									{category}
								</Badge>
							</Flex>
						)}
					</Flex>
				</Flex>
			</Card>
		</View>
	);
};

export default ApiCard;
