/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import appTheme from "@api-playground/theme";
import { ThemeProvider } from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";
import "react-toastify/dist/ReactToastify.min.css";
import "@api-playground/theme/appStyles.scss";
import { FC, ReactNode } from "react";
import "react-tooltip/dist/react-tooltip.css";

interface AppWrapperProps {
	children?: ReactNode;
}

const AppWrapper: FC<AppWrapperProps> = ({ children }) => <ThemeProvider theme={appTheme}>{children}</ThemeProvider>;

export default AppWrapper;
