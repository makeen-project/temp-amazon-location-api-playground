import { FC } from "react";

import "./styles.scss";
import ReverseGeoCodeRequest from "@api-playground/atomicui/organisms/ReverseGeocodeRequest";

const TestingPage: FC = () => {
	return (
		<section className="testing-page">
			<h1>Reverse Geocode Request</h1>
			<ReverseGeoCodeRequest />
		</section>
	);
};

export default TestingPage;
