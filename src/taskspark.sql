-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2025 at 12:19 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskspark`
--

-- --------------------------------------------------------

--
-- Table structure for table `assigned_tasks`
--

CREATE TABLE `assigned_tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `assigned_to` varchar(100) NOT NULL,
  `due_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assigned_tasks`
--

INSERT INTO `assigned_tasks` (`id`, `title`, `assigned_to`, `due_date`, `status`) VALUES
(1, 'Design homepage', '1', '2025-05-30', 'Pending'),
(3, 'Create course outline', '3', '2025-06-01', 'Pending'),
(4, 'Write unit tests', '4', '2025-06-03', 'Pending'),
(5, 'Prepare presentation slides', '6', '2025-05-28', 'Completed'),
(6, 'Update user dashboard', '1', '2025-06-02', 'In Progress'),
(7, 'Optimize DB queries', '4', '2025-06-05', 'Pending'),
(9, 'oo', 'Alice Johnson', '2026-12-31', 'Pending'),
(10, 'ff', 'zanita', '2025-12-29', 'Pending'),
(11, 'DO', 'zanita', '2025-01-01', 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_date` date NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('In Progress','Completed') DEFAULT 'In Progress',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`id`, `user_id`, `title`, `description`, `target_date`, `priority`, `status`, `created_at`, `updated_at`) VALUES
(1, 16, 'idk', 'idk', '2023-01-01', 'high', 'Completed', '2025-05-23 22:09:44', '2025-05-23 22:09:49');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(4, 16, 'Welcome to TaskSpark!', 'Thank you for joining. Start by creating your first task or goal.', 'info', 1, '2025-05-24 08:34:57'),
(5, 16, 'Welcome to TaskSpark!', 'Thank you for joining. Start by creating your first task or goal.', 'info', 1, '2025-05-24 08:35:03');

-- --------------------------------------------------------

--
-- Table structure for table `portfolios`
--

CREATE TABLE `portfolios` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('web','mobile','desktop','other') NOT NULL DEFAULT 'web',
  `status` enum('active','completed') NOT NULL DEFAULT 'active',
  `link` varchar(255) DEFAULT NULL,
  `technologies` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `done` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reminders`
--

INSERT INTO `reminders` (`id`, `user_id`, `text`, `done`) VALUES
(15, 3, 'kk', 1),
(16, 16, 'kk', 0),
(17, 18, 'kk', 0),
(18, 3, 'Call project manager', 0),
(19, 3, 'Submit assignment', 1),
(20, 3, 'Buy groceries', 0),
(21, 3, 'Send invoice to client', 1),
(22, 3, 'Book doctor appointment', 0),
(23, 3, 'Water the plants', 0),
(24, 3, 'Reply to mentor email', 1),
(25, 18, 'Add images to portfolio', 0),
(26, 18, 'Follow up with HR', 1),
(27, 18, 'Read new book chapter', 0),
(28, 18, 'Push updates to repo', 1),
(29, 18, 'Clean workspace', 0),
(30, 18, 'Write meeting summary', 1),
(31, 18, 'Upload course slides', 0),
(32, 16, 'Daily team check-in', 0),
(33, 16, 'Update LinkedIn profile', 1),
(34, 16, 'Renew software license', 0),
(35, 16, 'Test mobile app', 1),
(36, 16, 'Plan workshop agenda', 0),
(37, 16, 'Check analytics dashboard', 1),
(38, 16, 'Review feedback', 0),
(39, 16, 'k', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `text`, `done`, `user_id`, `created_at`, `updated_at`) VALUES
(25, 'kk', 1, 16, '2025-05-23 12:13:50', '2025-05-23 12:14:11'),
(26, 'Finish project report', 0, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(27, 'Review marketing strategy', 1, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(28, 'Prepare presentation slides', 0, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(29, 'Email the design team', 1, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(30, 'Schedule weekly sync', 0, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(31, 'Update website content', 1, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(32, 'Organize team feedback', 0, 2, '2025-05-23 12:16:26', '2025-05-23 12:16:26'),
(33, 'Create user survey', 0, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(34, 'Analyze traffic stats', 0, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(35, 'Respond to client emails', 1, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(36, 'Document API changes', 0, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(37, 'Attend product meeting', 1, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(38, 'Clean up code warnings', 1, 16, '2025-05-23 12:16:47', '2025-05-23 12:19:12'),
(39, 'Generate monthly report', 1, 16, '2025-05-23 12:16:47', '2025-05-23 12:16:47'),
(40, 'Write blog article', 0, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(41, 'Test login functionality', 1, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(42, 'Refactor codebase', 0, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(43, 'Backup database', 1, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(44, 'Fix broken links', 0, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(45, 'Design new logo', 0, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(46, 'Draft new user onboarding flow', 1, 3, '2025-05-23 12:17:10', '2025-05-23 12:17:10'),
(47, 'Record tutorial video', 0, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(48, 'Update course materials', 1, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(49, 'Run usability test', 0, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(50, 'Write product documentation', 0, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(51, 'Fix dashboard bug', 1, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(52, 'Prepare lesson slides', 0, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(53, 'Check feedback form responses', 1, 17, '2025-05-23 12:17:24', '2025-05-23 12:17:24'),
(54, 'Check server logs', 1, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(55, 'Fix responsive issues', 0, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(56, 'Optimize images', 0, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(57, 'Create error pages', 1, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(58, 'Build footer component', 0, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(59, 'Write test cases', 1, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(60, 'Set up CI/CD pipeline', 0, 19, '2025-05-23 12:17:35', '2025-05-23 12:17:35'),
(61, 'Design mobile app layout', 0, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(62, 'Meet with development team', 1, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(63, 'Update user roles', 0, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(64, 'Research competitors', 0, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(65, 'Organize media assets', 1, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(66, 'Deploy staging build', 1, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(67, 'Improve SEO ranking', 0, 18, '2025-05-23 12:17:41', '2025-05-23 12:17:41'),
(68, 'L', 1, 16, '2025-05-23 12:22:07', '2025-05-23 12:22:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `bio` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `bio`, `password`, `created_at`, `avatar`) VALUES
(2, 'elsa', 'elsa@gmail.com', NULL, '$2y$10$jk337piHtuJoCLKFxj8Zf.dMqVbPcKUpHbsPj7dft/SKasOlrZaOu', '2025-05-21 09:21:35', NULL),
(3, 'ritaa', 'rita@gmail.com', NULL, '$2y$10$Akt8lf5sjIX84hjpjLeoVeWBkaaM6G8vtC2G.4/kZjhR.47eThED2', '2025-05-21 09:23:07', NULL),
(16, 'zanita', 'z@gmail.com', NULL, '$2y$10$WesQL/xMmkoUEz9a9G0iFuApEuRQI.YXG9dJkDmXe9s3ODv3eyuYe', '2025-05-22 13:57:09', '16_1748080285.png'),
(17, 'sara', 'sara@gmail.com', NULL, '$2y$10$GBKDyRqIs3fhVOL84JD.y.XJIcQsGT/wAtQJULTphIZNI6WkkfIOC', '2025-05-23 09:55:27', NULL),
(18, 'vesa', 'vesa@gmail.com', NULL, '$2y$10$SdMo9TC3yyzyJ.STPMQn.OLxChLflcMphcLDiIkBMaGEJJWOERk0K', '2025-05-23 09:55:45', NULL),
(19, 'art', 'art@gmail.com', NULL, '$2y$10$cqRSJwfyMpSDwMIpBmPypulDnliz0d2y1dJu3A6PRxpjgTDxgwAmG', '2025-05-23 09:55:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `push_notifications` tinyint(1) DEFAULT 1,
  `task_reminders` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `email_notifications`, `push_notifications`, `task_reminders`, `created_at`, `updated_at`) VALUES
(1, 16, 1, 1, 1, '2025-05-24 07:57:49', '2025-05-24 08:00:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assigned_tasks`
--
ALTER TABLE `assigned_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_settings` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assigned_tasks`
--
ALTER TABLE `assigned_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `portfolios`
--
ALTER TABLE `portfolios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD CONSTRAINT `portfolios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
