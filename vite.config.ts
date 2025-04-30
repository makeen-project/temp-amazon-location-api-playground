import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import Inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false
			}),
			Inspect({
				build: false,
				outputDir: ".vite-inspect"
			})
		],
		resolve: {
			alias: {
				"@api-playground/assets": resolve(__dirname, "./src/assets"),
				"@api-playground/core": resolve(__dirname, "./src/core"),
				"@api-playground/atomicui": resolve(__dirname, "./src/atomicui"),
				"@api-playground/hooks": resolve(__dirname, "./src/hooks"),
				"@api-playground/services": resolve(__dirname, "./src/services"),
				"@api-playground/stores": resolve(__dirname, "./src/stores"),
				"@api-playground/types": resolve(__dirname, "./src/types"),
				"@api-playground/theme": resolve(__dirname, "./src/theme"),
				"@api-playground/utils": resolve(__dirname, "./src/utils"),
				"@api-playground/locales": resolve(__dirname, "./src/locales"),
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		build: {
			outDir: "./build",
			sourcemap: false,
			minify: true
		},
		server: {
			port: 3000
		}
	};
});
