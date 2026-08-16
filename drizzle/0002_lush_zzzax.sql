ALTER TABLE `user_settings` ADD `lastRunStatus` enum('never','success','failed') DEFAULT 'never' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `lastRunError` text;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `lastSuccessfulRunAt` timestamp;