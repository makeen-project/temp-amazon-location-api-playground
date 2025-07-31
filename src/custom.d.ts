/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

declare module "*.svg" {
	import { FC, SVGProps } from "react";
	export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}
