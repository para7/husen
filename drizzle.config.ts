import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/** @type/node は使えないので無理やりエラー解消 */
declare const process: {
	env: {
		[key: string]: string | undefined;
	};
};

export default defineConfig({
	out: "./server/drizzle",
	schema: "./server/db/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
		databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
		token: process.env.CLOUDFLARE_D1_TOKEN ?? "",
	},
});
