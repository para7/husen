import { pgTable, serial, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().notNull(),
	firstName: text("first-name"),
	lastName: text("LastName"),
	email: text(),
	phoneNumber: text("phone_number"),
});

export const credentials = pgTable("credentials", {
	id: serial().notNull(),
	password: text(),
});
