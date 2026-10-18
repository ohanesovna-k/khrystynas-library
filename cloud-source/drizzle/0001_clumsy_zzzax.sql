CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`nickname_key` text NOT NULL,
	`password_hash` text NOT NULL,
	`recovery_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_nickname_key_unique` ON `accounts` (`nickname_key`);--> statement-breakpoint
CREATE TABLE `auth_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`attempts` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
