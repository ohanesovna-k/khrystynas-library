CREATE TABLE `libraries` (
	`user_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`blob_key` text NOT NULL,
	`updated_at` text NOT NULL
);
