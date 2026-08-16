CREATE TABLE `accumulation_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrumentId` int NOT NULL,
	`tradingDate` timestamp NOT NULL,
	`intervalStart` timestamp NOT NULL,
	`intervalEnd` timestamp NOT NULL,
	`lowerPrice` double NOT NULL,
	`upperPrice` double NOT NULL,
	`volumeRatio` double NOT NULL,
	`acceptanceScore` double NOT NULL,
	`narrowRangeScore` double NOT NULL,
	`totalScore` double NOT NULL,
	`confidence` enum('Low','Medium','High') NOT NULL,
	`explanation` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accumulation_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analysis_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runDate` timestamp NOT NULL,
	`status` enum('running','completed','failed') NOT NULL,
	`instrumentsProcessed` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `analysis_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_bars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrumentId` int NOT NULL,
	`tradingDate` timestamp NOT NULL,
	`open` double NOT NULL,
	`high` double NOT NULL,
	`low` double NOT NULL,
	`close` double NOT NULL,
	`adjustedClose` double,
	`volume` double NOT NULL,
	`turnover` double,
	`provider` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_bars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instruments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`exchange` varchar(16) NOT NULL DEFAULT 'EGX',
	`isTracked` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instruments_id` PRIMARY KEY(`id`),
	CONSTRAINT `instruments_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `interval_bars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyBarId` int NOT NULL,
	`intervalStart` timestamp NOT NULL,
	`intervalEnd` timestamp NOT NULL,
	`open` double NOT NULL,
	`high` double NOT NULL,
	`low` double NOT NULL,
	`close` double NOT NULL,
	`volume` double NOT NULL,
	`volumeRatio` double,
	`priceRangePct` double,
	CONSTRAINT `interval_bars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`encryptedApiKey` text,
	`dataProvider` varchar(64) NOT NULL DEFAULT 'eodhd',
	`watchlist` text NOT NULL,
	`scheduleTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `instrument_date_zone_idx` ON `accumulation_zones` (`instrumentId`,`tradingDate`);--> statement-breakpoint
CREATE INDEX `instrument_date_idx` ON `daily_bars` (`instrumentId`,`tradingDate`);--> statement-breakpoint
CREATE INDEX `daily_interval_idx` ON `interval_bars` (`dailyBarId`,`intervalStart`);--> statement-breakpoint
CREATE INDEX `schedule_task_uid_idx` ON `user_settings` (`scheduleTaskUid`);