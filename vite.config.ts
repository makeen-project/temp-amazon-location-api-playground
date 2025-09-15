import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import eslint from "vite-plugin-eslint";
import Inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: false,
				failOnError: false
			}),
			dts({ insertTypesEntry: true }),
			Inspect({
				build: false,
				outputDir: ".vite-inspect"
			})
		],
		define: {
			global: "window",
			__vite_process_env_NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		},
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
				axios: "axios/dist/axios.js",
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		build: {
			outDir: "./lib",
			sourcemap: false,
			minify: true,
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				formats: ["es"],
				fileName: (format, name) => `${name}.${format}.js`
			},
			rollupOptions: {
				external: [
					"@aws-amplify/ui-react",
					"aws-amplify",
					"i18next",
					"i18next-browser-languagedetector",
					"ramda",
					"react",
					"react-device-detect",
					"react-dom",
					"react-i18next",
					"react-router-dom",
					"react-spring-bottom-sheet",
					"react-toastify",
					"react-tooltip"
				],
				output: {
					assetFileNames: chunkInfo =>
						chunkInfo.names.includes("temp-amazon-location-api-playground.css")
							? "style.css"
							: chunkInfo.names.join("-")
				}
			}
		},
		server: {
			port: 3000
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/setupTests.ts",
			css: true
		}
	};
});
