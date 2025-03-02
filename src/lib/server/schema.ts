import * as p from 'drizzle-orm/pg-core';

export const users = p.pgTable('users', {
	uuid: p.uuid().primaryKey(),
	user_id: p.text().unique(),
	username: p.text().notNull().unique()
});

export const credentials = p.pgTable('credentials', {
	uuid: p
		.uuid()
		.primaryKey()
		.references(() => users.uuid),
	password_hash: p.text().notNull()
});
