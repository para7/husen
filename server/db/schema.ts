import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
	uuid: text("uuid")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text("email").notNull().unique(),
	user_name: text("user_name").notNull(),
	user_id: text("user_id").notNull(),
	created_at: text("created_at").notNull().default(sql`(current_timestamp)`),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(current_timestamp)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
