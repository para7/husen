import { relations } from "drizzle-orm/relations";
import { users, credentials } from "./schema";

export const credentialsRelations = relations(credentials, ({one}) => ({
	user: one(users, {
		fields: [credentials.uuid],
		references: [users.uuid]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	credentials: many(credentials),
}));