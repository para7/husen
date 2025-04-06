CREATE TABLE `posts` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`order_date` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tag_text` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`order_date` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`uuid`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_name` text NOT NULL,
	`user_id` text NOT NULL,
	`profile` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("uuid", "email", "user_name", "user_id", "profile", "created_at", "updated_at") SELECT "uuid", "email", "user_name", "user_id", "profile", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);