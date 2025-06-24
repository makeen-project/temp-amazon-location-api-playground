/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FormField } from "@api-playground/atomicui/molecules/FormRender";
import { FormFieldConfig, FormContentConfig } from "@api-playground/types/ApiPlaygroundTypes";
import { createFormFieldsFromConfig, convertFormContentConfigToContentProps, mapFormDataToApiParams, validateFormData } from "./formConfigUtils";

describe("formConfigUtils", () => {
	describe("createFormFieldsFromConfig", () => {
		it("should convert FormFieldConfig to FormField", () => {
			const formFields: FormFieldConfig[] = [
				{
					type: "text",
					name: "query",
					label: "Address Query",
					required: true,
					placeholder: "Enter an address"
				},
				{
					type: "dropdown",
					name: "language",
					label: "Language",
					required: false,
					options: [
						{ label: "English", value: "en" },
						{ label: "Spanish", value: "es" }
					]
				}
			];

			const urlState = { query: "123 Main St", language: "en" };
			const result = createFormFieldsFromConfig(formFields, urlState);

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				type: "text",
				name: "query",
				label: "Address Query",
				required: true,
				placeholder: "Enter an address",
				value: "123 Main St"
			});
			expect(result[1]).toMatchObject({
				type: "dropdown",
				name: "language",
				label: "Language",
				required: false,
				value: "en",
				options: [
					{ label: "English", value: "en" },
					{ label: "Spanish", value: "es" }
				]
			});
		});
	});

	describe("convertFormContentConfigToContentProps", () => {
		it("should convert FormContentConfig to ContentProps", () => {
			const contentConfig: FormContentConfig = {
				type: "list",
				items: [
					{ text: "Step 1: Enter an address" },
					{ text: "Step 2: Click Geocode" }
				]
			};

			const result = convertFormContentConfigToContentProps(contentConfig);

			expect(result).toEqual({
				type: "list",
				items: [
					{ text: "Step 1: Enter an address" },
					{ text: "Step 2: Click Geocode" }
				]
			});
		});
	});

	describe("validateFormData", () => {
		it("should validate required fields", () => {
			const formData = { query: "", language: "en" };
			const validationRules = [
				{
					field: "query",
					rule: "required",
					message: "Query is required"
				}
			];

			const result = validateFormData(formData, validationRules);

			expect(result.isValid).toBe(false);
			expect(result.errors.query).toBe("Query is required");
		});

		it("should pass validation when all required fields are present", () => {
			const formData = { query: "123 Main St", language: "en" };
			const validationRules = [
				{
					field: "query",
					rule: "required",
					message: "Query is required"
				}
			];

			const result = validateFormData(formData, validationRules);

			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
		});
	});

	describe("mapFormDataToApiParams", () => {
		it("should map form data to API parameters", () => {
			const formData = {
				query: "123 Main St",
				language: "en",
				maxResults: 10
			};
			const paramMapping = {
				query: "Query",
				language: "Language",
				maxResults: "MaxResults"
			};

			const result = mapFormDataToApiParams(formData, paramMapping);

			expect(result).toEqual({
				Query: "123 Main St",
				Language: "en",
				MaxResults: 10
			});
		});

		it("should handle nested parameters", () => {
			const formData = {
				includePlaceTypes: ["PointAddress", "Street"]
			};
			const paramMapping = {
				includePlaceTypes: "Filter.IncludePlaceTypes"
			};

			const result = mapFormDataToApiParams(formData, paramMapping);

			expect(result).toEqual({
				Filter: {
					IncludePlaceTypes: ["PointAddress", "Street"]
				}
			});
		});

		it("should skip empty values", () => {
			const formData = {
				query: "123 Main St",
				language: "",
				maxResults: undefined
			};
			const paramMapping = {
				query: "Query",
				language: "Language",
				maxResults: "MaxResults"
			};

			const result = mapFormDataToApiParams(formData, paramMapping);

			expect(result).toEqual({
				Query: "123 Main St"
			});
		});
	});
}); 