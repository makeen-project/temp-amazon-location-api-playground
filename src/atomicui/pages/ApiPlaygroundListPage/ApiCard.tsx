import { FC, lazy } from "react";

// import { Flex, Text } from "@aws-amplify/ui-react";
// import { appConfig } from "@api-playground/core/constants";
// import { useTranslation } from "react-i18next";

// const ImageEl = lazy(() => import("@api-playground/atomicui/atoms/ImageEl").then(module => ({ default: module.ImageEl })));
// const {
// 	ENV: { API_PLAYGROUND_URL }
// } = appConfig;

interface ApiCardProps {
	id: string;
	imageSource: string;
	title: string;
	description: string;
	onCardClick: (id: string, title: string) => () => void;
}

const ApiCard: FC<ApiCardProps> = ({ id, imageSource, title, description, onCardClick }) => { return null; };
// 	const { t, i18n } = useTranslation();
// 	const langDir = i18n.dir();
// 	const isLtr = langDir === "ltr";

// 	return (
// 		<Flex data-testid="card-container" key={id} className="card-container" onClick={onCardClick(id, title)}>
// 			<ImageEl
// 				className="card-image"
// 				alt="image"
// 				src={`${API_PLAYGROUND_URL.trim()}/${imageSource ? imageSource : "images/placeholder.png"}`}
// 			/>
// 			<Flex className="card-content">
// 				<Text
// 					className="title medium-text bold"
// 					style={{
// 						textOverflow: "ellipsis",
// 						whiteSpace: "nowrap"
// 					}}
// 					textAlign={isLtr ? "start" : "end"}
// 					alignSelf={isLtr ? "start" : "end"}
// 				>
// 					{t(title)}
// 				</Text>
// 				<Text className="desc regular-text" textAlign={isLtr ? "start" : "end"}>
// 					{t(description)}
// 				</Text>
// 			</Flex>
// 		</Flex>
// 	);
// };

export default ApiCard;
