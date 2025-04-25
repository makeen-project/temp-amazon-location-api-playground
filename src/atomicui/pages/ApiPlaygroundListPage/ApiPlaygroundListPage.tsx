import { FC, lazy, useCallback, useMemo } from "react";

import { Flex, Heading, Link, SearchField, Text, View } from "@aws-amplify/ui-react";
import {
	IconApiPlayground,
	IconGeofence,
	IconMapOutlined,
	IconPinSolid,
	IconRadar,
	IconRoute,
	IconSearch
} from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import { useApiPlaygroundFilters, useApiPlaygroundList, useMediaQuery, useRecordViewPage } from "@demo/hooks";
import { EventTypeEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

const ApiCard = lazy(() => import("./ApiCard").then(module => ({ default: module.default })));

const {
	ROUTES: { API_PLAYGROUND }
} = appConfig;
const categoryIcons: { [key: string]: JSX.Element } = {
	Maps: <IconMapOutlined />,
	Places: <IconPinSolid />,
	Routes: <IconRoute />,
	Geofences: <IconGeofence />,
	Trackers: <IconRadar />
};

const ApiPlaygroundListPage: FC = () => {
	useRecordViewPage("ApiPlaygroundListPage");
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const { isFetching, apiListData } = useApiPlaygroundList();
	const { isFiltering, setIsFiltering, searchText, setSearchText, filteredApiListData } = useApiPlaygroundFilters();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const isTablet = useMediaQuery("(max-width: 960px)");

	const data = useMemo(
		() => (searchText ? filteredApiListData : apiListData),
		[apiListData, filteredApiListData, searchText]
	);

	const renderCategoriesDesktop = useMemo(() => {
		return (
			<Flex className="categories-container-desktop">
				<Text className="title bold regular-text">{t("API Categories")}</Text>
				<Flex className="list">
					{!isFetching && !isFiltering && !!data ? (
						Object.keys(data).map(cateogry => (
							<Link key={cateogry} href={`#${cateogry}`}>
								<Flex className="category">
									{categoryIcons[cateogry]}
									<Text className="text bold regular-text">{t(cateogry)}</Text>
								</Flex>
							</Link>
						))
					) : (
						<>LOADING!!!</>
					)}
				</Flex>
			</Flex>
		);
	}, [isFetching, isFiltering, data, t]);

	const renderCategoriesMobile = useMemo(() => {
		return (
			<Flex className="categories-container-mobile">
				<Flex className="list">
					{!isFetching && !isFiltering && !!data ? (
						Object.keys(data).map(cateogry => (
							<Link key={cateogry} href={`#${cateogry}`}>
								<Flex className="category">
									{categoryIcons[cateogry]}
									<Text className="text bold regular-text">{t(cateogry)}</Text>
								</Flex>
							</Link>
						))
					) : (
						<>LOADING!!!</>
					)}
				</Flex>
			</Flex>
		);
	}, [isFetching, isFiltering, data, t]);

	const handleCardClick = useCallback(
		(apiId: string, apiTitle: string) => () => {
			record([{ EventType: EventTypeEnum.API_CLICKED, Attributes: { apiId, apiTitle } }]);
			navigate(`${API_PLAYGROUND}/${apiId}`);
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
		},
		[navigate]
	);

	const renderList = useCallback(
		(category: string) => {
			if (!!data) {
				if (!isTablet && data[category].length > 1) {
					const col1 = data[category].filter((_, idx) => idx % 2 === 0);
					const col2 = data[category].filter((_, idx) => idx % 2 !== 0);

					return (
						<>
							<Flex className="multi-col1">
								{col1.map(
									({
										id,
										imageSource,
										title,
										description
									}: {
										id: string;
										imageSource: string;
										title: string;
										description: string;
									}) => (
										<ApiCard
											key={`${category}_${id}`}
											id={`${category}_${id}`}
											imageSource={imageSource}
											title={title}
											description={description}
											onCardClick={handleCardClick}
										/>
									)
								)}
							</Flex>
							<Flex className="multi-col2">
								{col2.map(
									({
										id,
										imageSource,
										title,
										description
									}: {
										id: string;
										imageSource: string;
										title: string;
										description: string;
									}) => (
										<ApiCard
											key={`${category}_${id}`}
											id={`${category}_${id}`}
											imageSource={imageSource}
											title={title}
											description={description}
											onCardClick={handleCardClick}
										/>
									)
								)}
							</Flex>
						</>
					);
				} else {
					return (
						<Flex className="single-col">
							{data[category].map(
								({
									id,
									imageSource,
									title,
									description
								}: {
									id: string;
									imageSource: string;
									title: string;
									description: string;
								}) => (
									<ApiCard
										key={`${category}_${id}`}
										id={`${category}_${id}`}
										imageSource={imageSource}
										title={title}
										description={description}
										onCardClick={handleCardClick}
									/>
								)
							)}
						</Flex>
					);
				}
			}
		},
		[isTablet, data, handleCardClick]
	);

	const renderSectionList = useMemo(() => {
		if (!isFetching && !isFiltering && !!data) {
			return Object.keys(data).map(category => {
				return (
					<Flex key={category} id={category} className="anchor" gap={0} direction="column">
						<Flex className="section">
							<Text className="section-title bold regular-text">{category}</Text>
							<Flex className="list">{renderList(category)}</Flex>
						</Flex>
					</Flex>
				);
			});
		} else {
			return <>LOADING!!!</>;
		}
	}, [isFetching, isFiltering, data, renderList]);

	return (
		<View className="api-playground-list-container no-side-gaps inner-container-padding">
			<Flex className="header">
				<View>
					<Heading className="bold x-large-text" level={2} textAlign={isLtr ? "start" : "end"}>
						{t("API Playground")}
					</Heading>
					<Text className="header-text regular-text" textAlign={isLtr ? "start" : "end"}>
						{t("APIs available for you to explore.")}
					</Text>
				</View>
				<View className="header-icon">
					<IconApiPlayground />
				</View>
			</Flex>
			<Flex className="content-container">
				{!isTablet && renderCategoriesDesktop}
				<Flex className="search-and-list">
					<Flex className="search-field-container">
						<SearchField
							data-testid="apis-search-field"
							className="search-field"
							label={t("search.text")}
							placeholder={t("search.text") as string}
							dir={langDir}
							hasSearchIcon={true}
							size={"large"}
							innerStartComponent={
								<Flex className="search-icon-container">
									<IconSearch />
								</Flex>
							}
							hasSearchButton={false}
							onClear={() => {
								setIsFiltering(false);
								setSearchText("");
							}}
							onChange={e => setSearchText(e.target.value)}
							value={searchText}
							crossOrigin={undefined}
						/>
					</Flex>
					{isTablet && renderCategoriesMobile}
					<Flex className="section-list-container">{renderSectionList}</Flex>
				</Flex>
			</Flex>
		</View>
	);
};

export default ApiPlaygroundListPage;
