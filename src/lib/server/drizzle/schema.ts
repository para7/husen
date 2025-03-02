import { pgTable, unique, uuid, text, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	uuid: uuid().primaryKey().notNull(),
	userId: text("user_id"),
	username: text().notNull(),
}, (table) => [
	unique("users_user_id_unique").on(table.userId),
	unique("users_username_unique").on(table.username),
]);

export const credentials = pgTable("credentials", {
	uuid: uuid().primaryKey().notNull(),
	passwordHash: text("password_hash").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.uuid],
			foreignColumns: [users.uuid],
			name: "credentials_uuid_users_uuid_fk"
		}),
]);
