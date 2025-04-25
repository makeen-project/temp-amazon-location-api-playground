import { useCallback, useEffect, useState } from "react";

import { appConfig } from "@demo/core/constants";
import { ApiListItem } from "@demo/types";
import { errorHandler } from "@demo/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import useApiPlaygroundList from "./useApiPlaygroundList";

const {
	ROUTES: { NOT_FOUND }
} = appConfig;

const useApiPlaygroundDetails = () => {
	const [isFetchingApiDetails, setIsFetchingApiDetails] = useState(false);
	const [apiDetails, setApiDetails] = useState<ApiListItem | null>(null);
	const { apiId } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { apiListData } = useApiPlaygroundList();

	const fetchApiDetails = useCallback(() => {
		try {
			const category = apiId!.split("_")[0];
			const id = apiId!.split("_")[1];
			const data = apiListData![category].find(api => api.id === id);

			if (!!data) {
				setTimeout(() => setApiDetails(data), 5000);
			} else {
				navigate(NOT_FOUND);
				throw new Error("API not found.");
			}
		} catch (error) {
			errorHandler(error, t("Failed to fetch API details"));
		} finally {
			setIsFetchingApiDetails(false);
		}
	}, [apiId, apiListData, navigate, t]);

	useEffect(() => {
		if (!!apiListData && !!apiId) {
			fetchApiDetails();
		}
	}, [apiListData, apiId, fetchApiDetails]);

	return { isFetchingApiDetails, apiDetails };
};

export default useApiPlaygroundDetails;
