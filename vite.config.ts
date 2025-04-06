// vite.config.ts
import adapter from "@hono/vite-dev-server/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy as remixCloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import serverAdapter from "hono-react-router-adapter/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";

export default defineConfig({
	server: {
		port: 3000,
		host: "0.0.0.0",
	},
	plugins: [
		remixCloudflareDevProxy(),
		reactRouter(),
		serverAdapter({
			adapter,
			getLoadContext,
			entry: "server/index.ts",
		}),
		tsconfigPaths(),
	],
	resolve: {
		alias: {
			// https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
			"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
		},
	},
	build: {
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name][extname]",
			},
		},
	},
});
