ALTER TABLE `analysis_runs` ADD `alertStatus` enum('not_run','skipped','sent','failed') DEFAULT 'not_run' NOT NULL;--> statement-breakpoint
ALTER TABLE `analysis_runs` ADD `alertCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `analysis_runs` ADD `alertError` text;--> statement-breakpoint
ALTER TABLE `analysis_runs` ADD `alertSentAt` timestamp;