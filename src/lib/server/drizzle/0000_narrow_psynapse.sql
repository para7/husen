-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"user_id" text,
	"username" text NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_uuid_users_uuid_fk" FOREIGN KEY ("uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;
*/