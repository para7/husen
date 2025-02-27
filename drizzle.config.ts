import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/schema.ts',
	out: './src/lib/server/drizzle',
	dbCredentials: {
		url: 'postgresql://postgres:password@postgres:5432/husendb'
	}
});
