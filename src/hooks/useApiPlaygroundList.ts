import { useCallback, useEffect, useState } from "react";

import { appConfig } from "@demo/core/constants";
import { ApiListData } from "@demo/types";
import { errorHandler } from "@demo/utils";
import { useTranslation } from "react-i18next";

const {
	ENV: { API_PLAYGROUND_URL, API_PLAYGROUND_LIST_FILENAME }
} = appConfig;

const downloadJson = async () => {
	const bucketURL = `${API_PLAYGROUND_URL.trim()}/${API_PLAYGROUND_LIST_FILENAME}`;

	const res = await fetch(bucketURL, {
		method: "get"
	});

	if (res.status > 399) {
		throw res;
	}

	if (res.status === 200) {
		return await res.json();
	}
};

const useApiPlaygroundList = () => {
	const [isFetching, setIsFetching] = useState(false);
	const [apiListData, setApiListData] = useState<ApiListData | null>(null);
	const { t } = useTranslation();

	const fetchApiList = useCallback(async () => {
		try {
			setIsFetching(true);
			const data = await downloadJson();
			setApiListData(data.apis);
		} catch (error) {
			errorHandler(error, t("Failed to fetch API playground list."));
		} finally {
			setIsFetching(false);
		}
	}, [t]);

	useEffect(() => {
		fetchApiList();
	}, [fetchApiList]);

	return { isFetching, apiListData };
};

export default useApiPlaygroundList;
