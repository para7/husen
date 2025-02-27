import * as p from 'drizzle-orm/pg-core';

export const users = p.pgTable('users', {
	id: p.uuid().primaryKey()
});

export const credentials = p.pgTable('credentials', {
	id: p
		.uuid()
		.primaryKey()
		.references(() => users.id),
	password: p.text()
});
