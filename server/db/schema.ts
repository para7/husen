import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const TableUsers = sqliteTable("users", {
	uuid: text("uuid")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	email: text("email").notNull().unique(),

	user_name: text("user_name").notNull(),

	user_id: text("user_id").notNull(),

	profile: text("profile").notNull().default(""),

	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),

	updated_at: text("updated_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export const TablePosts = sqliteTable(
	"posts",
	{
		uuid: text("uuid")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		user_id: text("user_id")
			.notNull()
			.references(() => TableUsers.uuid),

		content: text("content").notNull(),

		created_at: text("created_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),

		updated_at: text("updated_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString())
			.$onUpdate(() => new Date().toISOString()),

		/**
		 * 表示順制御用
		 */
		order_date: text("order_date").notNull(),
	},
	(table) => [
		// index("posts_user_id_idx").on(table.user_id),
		// index("posts_order_date_idx").on(table.order_date),
	],
);

export const TableTags = sqliteTable(
	"tags",
	{
		post_id: text("post_id")
			.notNull()
			.references(() => TablePosts.uuid),

		/**
		 * 絞り込みのため、postと同じユーザーIDを格納しておく
		 */
		user_id: text("user_id")
			.notNull()
			.references(() => TableUsers.uuid),

		tag_text: text("tag_text").notNull(),

		created_at: text("created_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),

		updated_at: text("updated_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString())
			.$onUpdate(() => new Date().toISOString()),

		/**
		 * 表示順制御用
		 */
		order_date: text("order_date").notNull(),
	},
	(table) => [
		// // index("tags_post_id_idx").on(table.post_id),
		// index("tags_tag_text_idx").on(table.tag_text),
		// // ユーザーとtag_text の複合
		// uniqueIndex("tags_user_id_tag_text_idx").on(table.user_id, table.tag_text),
	],
);
