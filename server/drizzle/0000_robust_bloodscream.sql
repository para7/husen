CREATE TABLE `users` (
	`uuid` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_name` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);