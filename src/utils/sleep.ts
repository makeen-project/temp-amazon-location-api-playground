/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default sleep;
