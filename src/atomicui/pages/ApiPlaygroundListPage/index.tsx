/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, useEffect, useMemo, useState } from "react";

import { IconCode, IconFilter, IconSearch } from "@api-playground/assets/svgs";
import ApiCard from "@api-playground/atomicui/molecules/ApiCard";
import CheckboxGroup from "@api-playground/atomicui/molecules/CheckboxGroup";
import FilterModal from "@api-playground/atomicui/molecules/FilterModal";
import apiPlaygroundFiltersData from "@api-playground/core/constants/apiPlaygroundFiltersData";
import useApiPlaygroundList, { useApiPlaygroundFilters } from "@api-playground/hooks/useApiPlaygroundList";
import useMediaQuery from "@api-playground/hooks/useMediaQuery";
import { Flex, Heading, Placeholder, SearchField, Text, View } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import "./styles.scss";

// to be used later
// const {
// 	LINKS: { AMAZON_LOCATION_GIT, AMAZON_LOCATION_BLOGS, AMAZON_LOCATION_DEV_GUIDE_SAMPLES }
// } = appConfig;

type ApiCardType = {
	id: string;
	imageSource: string;
	title: string;
	description: string;
	tags: string[];
};

type ApiListData = {
	[key: string]: ApiCardType[];
};

const ApiPlaygroundListPage: FC = () => {
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	// const navigate = useNavigate();
	// useRecordViewPage("ApiPlaygroundsListPage");
	const { t, i18n } = useTranslation();
	const { isLoading, data } = useApiPlaygroundList();
	const { filters, setFilters, filteredApiPlaygroundList, filterLoading, setFilterLoading } = useApiPlaygroundFilters();
	const apiPlaygroundList = filteredApiPlaygroundList ?? data ?? [];
	const tabScreen = useMediaQuery("(max-width: 1023px)");
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const loading = () => {
		return [...Array(3)].map((_, index) => (
			<View key={index} className="placeholder-container">
				<Placeholder className="placeholder-image" />
				<Placeholder className="placeholder-title" />
				<Placeholder className="placeholder-description" />
				<Placeholder className="placeholder-tags" />
			</View>
		));
	};

	const column1ApiPlaygrounds = useMemo(() => {
		return tabScreen ? apiPlaygroundList : apiPlaygroundList?.filter((_: any, index: number) => index % 2 === 0);
	}, [apiPlaygroundList, tabScreen]);

	const column2ApiPlaygrounds = useMemo(() => {
		return tabScreen ? [] : apiPlaygroundList?.filter((_: any, index: number) => index % 2 !== 0);
	}, [apiPlaygroundList, tabScreen]);

	const handleCardClick = (apiPlaygroundId: string, apiPlaygroundTitle: string) => () => {
		// record([{ EventType: EventTypeEnum.SAMPLE_CLICKED, Attributes: { apiPlaygroundId, apiPlaygroundTitle } }]);
		// navigate(`/apiPlayground/${apiPlaygroundId}`);
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	};

	const handleSearchChange = (searchText: string) => {
		setFilterLoading(true);
		setFilters(prevFilters => ({ ...prevFilters, searchText }));
	};

	const handleFilterChange = (key: string, values: string[]): void => {
		setFilterLoading(true);
		setFilters(prevFilters => ({ ...prevFilters, [key]: values }));
	};

	useEffect(() => {
		if (filterLoading) {
			setFilterLoading(false);
		}
	}, [filterLoading, filteredApiPlaygroundList, setFilterLoading]);

	return (
		<>
			<View
				data-testid="apiPlayground-list-header"
				className="apiPlaygrounds-list-container no-side-gaps inner-container-padding"
			>
				<Flex className="header">
					<View>
						<View>
							<Heading className="header-text bold x-large-text" level={2} textAlign={isLtr ? "start" : "end"}>
								API Playground
							</Heading>
							<Text className="header-text regular-text" textAlign={isLtr ? "start" : "end"}>
								Use serverless patterns to quickly build integrations using AWS SAM and CDK templates. Filter by pattern
								and copy the template directly into your application. &nbsp;
							</Text>
						</View>
						<View className="header-icon">
							<IconCode />
						</View>
					</View>
				</Flex>

				<Flex className="content-container">
					<View className="checkbox-filter-container">
						{apiPlaygroundFiltersData.map(apiPlaygroundListFilter => (
							<CheckboxGroup
								key={apiPlaygroundListFilter.key}
								title={"Features"}
								options={apiPlaygroundListFilter.options}
								values={filters?.[apiPlaygroundListFilter.key] || []}
								onChange={val => handleFilterChange(apiPlaygroundListFilter.key, val)}
							/>
						))}
					</View>
					<View flex={3}>
						<Flex flex={1} width={"100%"} className="search-field-container">
							<SearchField
								data-testid="apiPlaygrounds-search-field"
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
								onChange={e => handleSearchChange(e.target.value)}
								value={filters?.searchText || ""}
							/>
							<IconFilter
								data-testid="apiPlaygrounds-filter-icon"
								fill="red"
								className="filter-icon"
								onClick={() => setIsFilterModalOpen(true)}
							/>
						</Flex>
						<Flex className="apiPlayground-list">
							<View className="apiPlayground-list-cards-container">
								{!data || isLoading || filterLoading
									? loading()
									: column1ApiPlaygrounds?.map((apiPlayground: any) => (
											<ApiCard
												key={apiPlayground.id}
												id={apiPlayground.id}
												title={apiPlayground.title}
												imageSource={apiPlayground.imageSource}
												brief={apiPlayground.brief}
												category={apiPlayground.category}
												onCardClick={handleCardClick}
											/>
									  ))}
							</View>

							<View className="apiPlayground-list-cards-container">
								{!data || isLoading || filterLoading
									? loading()
									: column2ApiPlaygrounds?.map((apiPlayground: any) => (
											<ApiCard
												key={apiPlayground.id}
												id={apiPlayground.id}
												title={apiPlayground.title}
												imageSource={apiPlayground.imageSource}
												brief={apiPlayground.brief}
												category={apiPlayground.category}
												onCardClick={handleCardClick}
											/>
									  ))}
							</View>
						</Flex>
					</View>
				</Flex>
			</View>
			<View
				data-testid="apiPlayground-list-filter-container"
				className={`apiPlayground-list-filter-modal-container ${isFilterModalOpen ? "disable-body-scroll" : ""}`}
			>
				<FilterModal
					title={"Features"}
					isOpen={isFilterModalOpen}
					onClose={() => setIsFilterModalOpen(false)}
					onChange={filters => {
						setFilters(prevFilters => ({ ...prevFilters, ...filters }));
					}}
					options={apiPlaygroundFiltersData}
					values={filters ? { features: filters.features || [] } : {}}
				/>
			</View>
		</>
	);
};

export default ApiPlaygroundListPage;
