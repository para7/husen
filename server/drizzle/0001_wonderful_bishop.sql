CREATE TABLE `posts` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`order_date` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tag_text` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`order_date` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`uuid`) ON UPDATE no action ON DELETE no action
);
