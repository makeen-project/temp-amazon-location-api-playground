/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

export const normalizeLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180; // Normalize to [-180, 180];
