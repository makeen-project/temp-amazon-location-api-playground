import { useEffect } from "react";

import { appConfig } from "@api-playground/core/constants";
import { EventTypeEnum } from "@api-playground/types/Enums";

import { record } from "@api-playground/utils/analyticsUtils";
import { uuid } from "@api-playground/utils/uuid";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, PAGE_VIEW_IDENTIFIERS }
} = appConfig;
const pageViewIdentifiersKey = `${LOCAL_STORAGE_PREFIX}${PAGE_VIEW_IDENTIFIERS}`;

let pageViewIdentifier: string;

const useRecordViewPage = (pageName: string) => {
	useEffect(() => {
		pageViewIdentifier = `${uuid.randomUUID()}__${pageName}`;
		const pageViewIdentifiersObj = JSON.parse(localStorage.getItem(pageViewIdentifiersKey) || "{}");
		pageViewIdentifiersObj[location.pathname.replace(/\//g, "_")] = pageViewIdentifier;
		localStorage.setItem(pageViewIdentifiersKey, JSON.stringify(pageViewIdentifiersObj));

		const path = location.pathname;
		record([{ EventType: EventTypeEnum.VIEW_PAGE, Attributes: { path, pageName, pageViewIdentifier } }]);

		return () => {
			record([{ EventType: EventTypeEnum.LEAVE_PAGE, Attributes: { path, pageName, pageViewIdentifier } }]);
		};
	}, [pageName]);

	return {};
};

export default useRecordViewPage;
