-- phpMyAdmin SQL Dump
-- Database: `kn_softic_db`
-- Engine: InnoDB
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database Creation
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `kn_softic_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kn_softic_db`;

-- --------------------------------------------------------
-- Table structure for table `settings`
-- --------------------------------------------------------
CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `site_name` varchar(255) NOT NULL DEFAULT 'KN Softic',
  `website_tagline` varchar(255) DEFAULT 'Software House & IT Institute',
  `company_name` varchar(255) DEFAULT 'KN Softic',
  `company_description` longtext DEFAULT NULL,
  `about_subtitle` varchar(255) DEFAULT 'About Us',
  `about_title` varchar(255) DEFAULT 'What make us the best?',
  `about_description` longtext DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `favicon_url` varchar(255) DEFAULT NULL,
  `copyright_text` varchar(255) DEFAULT NULL,
  `footer_text` varchar(255) DEFAULT NULL,
  `company_address` longtext DEFAULT NULL,
  `working_hours` varchar(255) DEFAULT NULL,
  `primary_email` varchar(255) DEFAULT NULL,
  `secondary_email` varchar(255) DEFAULT NULL,
  `support_email` varchar(255) DEFAULT NULL,
  `sales_email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `office_address` longtext DEFAULT NULL,
  `google_maps_embed_url` longtext DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `vat_number` varchar(255) DEFAULT NULL,
  `customer_care_number` varchar(50) DEFAULT NULL,
  `light_logo_url` varchar(255) DEFAULT NULL,
  `dark_logo_url` varchar(255) DEFAULT NULL,
  `mobile_logo_url` varchar(255) DEFAULT NULL,
  `default_banner_url` varchar(255) DEFAULT NULL,
  `default_og_image_url` varchar(255) DEFAULT NULL,
  `social_links` longtext DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_address` text DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `youtube_url` varchar(255) DEFAULT NULL,
  `tiktok_url` varchar(255) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `behance_url` varchar(255) DEFAULT NULL,
  `dribbble_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`id`, `site_name`, `website_tagline`, `company_name`, `company_description`, `about_subtitle`, `about_title`, `about_description`, `logo_url`, `favicon_url`, `copyright_text`, `footer_text`, `company_address`, `working_hours`, `primary_email`, `secondary_email`, `support_email`, `sales_email`, `phone_number`, `whatsapp_number`, `office_address`, `google_maps_embed_url`, `business_name`, `registration_number`, `vat_number`, `customer_care_number`, `light_logo_url`, `dark_logo_url`, `mobile_logo_url`, `default_banner_url`, `default_og_image_url`, `social_links`, `contact_email`, `contact_phone`, `contact_address`, `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `youtube_url`, `tiktok_url`, `github_url`, `behance_url`, `dribbble_url`) VALUES
(1, 'KN Softic', 'Software House & IT Institute', 'KN Softic', 'We build high-performance digital products, websites, mobile apps, and modern learning experiences.', 'About Us', 'What make us the best?', 'We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity.', NULL, NULL, 'Copyright © 2026 KN Softic. All rights reserved.', 'Software House & IT Institute', 'KN Softic, Main Boulevard, Gulberg III, Lahore, Pakistan', 'Mon – Sat: 9:00 AM – 7:00 PM', 'info@knsoftic.com', 'hello@knsoftic.com', 'support@knsoftic.com', 'sales@knsoftic.com', '+92 345 2470250', '+92 345 2470250', 'KN Softic, Main Boulevard, Gulberg III, Lahore, Pakistan', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.119794358897!2d72.92739457632612!3d31.367049554605915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39225b00438c21f1%3A0x9ae7c88be0aa71d9!2sKn%20Softic!5e0!3m2!1sen!2pk', 'KN Softic', '', '', '+92 345 2470250', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 'info@knsoftic.com', '+92 345 2470250', 'KN Softic, Main Boulevard, Gulberg III, Lahore, Pakistan', '', '', '', '', '', '', '', '', '');

-- --------------------------------------------------------
-- Table structure for table `seo_pages`
-- --------------------------------------------------------
CREATE TABLE `seo_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_slug` varchar(255) NOT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `h1_heading` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `btn_primary_text` varchar(100) DEFAULT NULL,
  `btn_primary_url` varchar(255) DEFAULT NULL,
  `btn_secondary_text` varchar(100) DEFAULT NULL,
  `btn_secondary_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `hero_slides`
-- --------------------------------------------------------
CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL,
  `badge_text` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `btn_primary_text` varchar(100) DEFAULT NULL,
  `btn_primary_url` varchar(255) DEFAULT NULL,
  `btn_secondary_text` varchar(100) DEFAULT NULL,
  `btn_secondary_url` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hero_slides` (`id`, `badge_text`, `title`, `description`, `image_url`, `btn_primary_text`, `btn_primary_url`, `btn_secondary_text`, `btn_secondary_url`, `display_order`) VALUES
(1, 'SOFTWARE HOUSE & IT INSTITUTE', 'Build Your Future With Technology', 'At KN Softic, we turn ideas into powerful digital products. From websites and mobile apps to enterprise software, we build solutions that drive business success.', '/assets/images/cover-object.png', 'Explore Services', '/services', 'View Courses', '/courses', 1),
(2, 'SOFTWARE HOUSE & IT INSTITUTE', 'Turning Ideas Into Digital Reality', 'KN Softic delivers modern technology solutions designed to help businesses innovate, automate, and scale. Our focus is on quality, performance, and customer satisfaction.', '/assets/images/cover-object.png', 'Explore Services', '/services', 'View Courses', '/courses', 2);

-- --------------------------------------------------------
-- Table structure for table `service_categories`
-- --------------------------------------------------------
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `service_categories` (`id`, `name`, `slug`) VALUES
(1, 'UI/UX', 'ui_ux'),
(2, 'E-Commerce', 'e_commerce'),
(3, 'Custom Software', 'custom_software'),
(4, 'Video Editing', 'video_editing'),
(5, 'SEO Mastery', 'seo_mastery'),
(6, 'Digital Marketing', 'digital_marketing');

-- --------------------------------------------------------
-- Table structure for table `services`
-- --------------------------------------------------------
CREATE TABLE `services` (
  `id` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `page_title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `home_description` text NOT NULL,
  `button_label` varchar(100) DEFAULT 'Get a Quote →',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`id`, `category_id`, `icon`, `image_url`, `title`, `page_title`, `description`, `home_description`, `display_order`) VALUES
('custom-digital-solutions', 1, 'fa-desktop', '/assets/images/service-01.png', 'Custom Digital Solutions', 'UI/UX Design', 'User-centered design that converts visitors into customers.', 'Whenever you need high-performance web development and striking brand design, we are here to bring your vision to life.', 1),
('expert-craftsmanship', 2, 'fa-shopping-cart', '/assets/images/service-02.png', 'Expert Craftsmanship', 'E-commerce Solutions', 'Complete online stores with payments and inventory management.', 'From seamless e-commerce platforms to intuitive mobile apps, we build scalable digital experiences customized for your business.', 2);

-- --------------------------------------------------------
-- Table structure for table `service_features`
-- --------------------------------------------------------
CREATE TABLE `service_features` (
  `id` int(11) NOT NULL,
  `service_id` varchar(100) NOT NULL,
  `feature` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `service_features` (`id`, `service_id`, `feature`, `display_order`) VALUES
(1, 'custom-digital-solutions', 'User Research', 1),
(2, 'custom-digital-solutions', 'Figma Prototypes', 2),
(3, 'custom-digital-solutions', 'Usability Testing', 3),
(4, 'custom-digital-solutions', 'Design Systems', 4),
(5, 'custom-digital-solutions', 'Responsive UI', 5);

-- --------------------------------------------------------
-- Table structure for table `courses`
-- --------------------------------------------------------
CREATE TABLE `courses` (
  `id` varchar(100) NOT NULL,
  `filter_slug` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `enroll_url` varchar(500) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `filter_slug`, `category`, `image_url`, `title`, `duration`, `enroll_url`, `display_order`) VALUES
('web-development', 'web_development', 'Web Development', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1172&auto=format&fit=crop', 'Web Development', '3 Months', 'https://wa.me/923452470250?text=Hi,%20I%20want%20to%20enroll%20in%20the%20Web%20Development%20course', 1),
('wordpress', 'wordpress', 'WordPress', 'https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?q=80&w=1170&auto=format&fit=crop', 'WordPress', '3 Months', 'https://wa.me/923452470250?text=Hi,%20I%20want%20to%20enroll%20in%20the%20WordPress%20course', 2);

-- --------------------------------------------------------
-- Table structure for table `course_bullets`
-- --------------------------------------------------------
CREATE TABLE `course_bullets` (
  `id` int(11) NOT NULL,
  `course_id` varchar(100) NOT NULL,
  `bullet_text` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_bullets` (`id`, `course_id`, `bullet_text`, `display_order`) VALUES
(1, 'web-development', 'HTML5 & Semantic Markup', 1),
(2, 'web-development', 'CSS3, Flexbox & Grid', 2),
(3, 'web-development', 'JavaScript & ES6+', 3),
(4, 'web-development', 'PHP & MySQL Backend', 4),
(5, 'web-development', 'Final Project', 5);

-- --------------------------------------------------------
-- Table structure for table `projects`
-- --------------------------------------------------------
CREATE TABLE `projects` (
  `id` varchar(100) NOT NULL,
  `filter_slug` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `label` varchar(100) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `technologies` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `primary_link_label` varchar(100) DEFAULT NULL,
  `primary_link_url` varchar(500) DEFAULT NULL,
  `secondary_link_label` varchar(100) DEFAULT NULL,
  `secondary_link_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `projects` (`id`, `filter_slug`, `icon`, `image_url`, `title`, `description`, `category`, `badge`, `label`, `client_name`, `technologies`, `features`, `primary_link_label`, `primary_link_url`, `secondary_link_label`, `secondary_link_url`) VALUES
('techmart', 'websites', 'fa-shopping-cart', NULL, 'TechMart E-Commerce', 'Full-featured e-commerce platform with product catalog, cart, checkout, and admin panel....', 'Portfolio', 'Websites', 'Websites', 'Client: TechMart PK', NULL, NULL, NULL, NULL, NULL, NULL),
('fittrack', 'mobile', 'fa-heartbeat', NULL, 'FitTrack Mobile App', 'Fitness tracking Android app with workout plans, calorie counter, and progress tracking....', 'Portfolio', 'Mobile', 'Mobile', 'Client: FitTrack Inc', NULL, NULL, NULL, NULL, NULL, NULL),
('school', 'software', 'fa-university', NULL, 'School Management System', 'A complete school management solution covering student registration, fee management, attendance, results, and parent portal.', 'Software', 'Ready to Deploy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('restaurant', 'software', 'fa-cutlery', NULL, 'Restaurant POS System', 'Full-featured Point of Sale system for restaurants with table management, order tracking, kitchen display, and billing.', 'Software', 'Live Demo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
-- Table structure for table `team_members`
-- --------------------------------------------------------
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(150) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `team_members` (`id`, `name`, `category`, `image_url`) VALUES
(1, 'Sophia Rose', 'UX Teacher', 'https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop'),
(2, 'Cindy Walker', 'Graphic Teacher', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop');

-- --------------------------------------------------------
-- Table structure for table `testimonials`
-- --------------------------------------------------------
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(150) NOT NULL,
  `quote` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `testimonials` (`id`, `name`, `category`, `quote`, `image_url`) VALUES
(1, 'Sara Khan', 'Freelance Designer', 'The graphic design course completely changed my career. I am now earning great income as a freelancer!', '/assets/images/testimonial-author.jpg'),
(2, 'Ahmad Raza', 'CEO, TECHMART PK', 'KN Softic delivered our e-commerce website beyond expectations. Highly professional and results were outstanding.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop');

-- --------------------------------------------------------
-- Table structure for table `fun_facts`
-- --------------------------------------------------------
CREATE TABLE `fun_facts` (
  `id` varchar(100) NOT NULL,
  `label` varchar(150) NOT NULL,
  `target` int(11) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fun_facts` (`id`, `label`, `target`, `display_order`) VALUES
('students', 'Happy Students', 150, 1),
('hours', 'Course Hours', 804, 2),
('employed', 'Employed Students', 50, 3),
('experience', 'Years Experience', 15, 4);

-- --------------------------------------------------------
-- Table structure for table `contact_messages`
-- --------------------------------------------------------
CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied','closed') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `media_files`
-- --------------------------------------------------------
CREATE TABLE `media_files` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `size_bytes` bigint(20) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `admin_roles`
-- --------------------------------------------------------
CREATE TABLE `admin_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_roles` (`id`, `role_name`, `permissions`) VALUES
(1, 'Super Admin', '["all"]'),
(2, 'Editor', '["manage_content", "manage_media"]');

-- --------------------------------------------------------
-- Table structure for table `admin_users`
-- --------------------------------------------------------
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No admin account is seeded here (a password hash doesn't belong in the repository).
-- After importing, create one with:
--   cd backend && ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run create-admin

-- --------------------------------------------------------
-- Primary Keys & Indexes
-- --------------------------------------------------------
ALTER TABLE `settings` ADD PRIMARY KEY (`id`);
ALTER TABLE `hero_slides` ADD PRIMARY KEY (`id`);
ALTER TABLE `service_categories` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `slug` (`slug`);
ALTER TABLE `services` ADD PRIMARY KEY (`id`), ADD KEY `category_id` (`category_id`);
ALTER TABLE `service_features` ADD PRIMARY KEY (`id`), ADD KEY `service_id` (`service_id`);
ALTER TABLE `courses` ADD PRIMARY KEY (`id`), ADD KEY `filter_slug` (`filter_slug`);
ALTER TABLE `course_bullets` ADD PRIMARY KEY (`id`), ADD KEY `course_id` (`course_id`);
ALTER TABLE `projects` ADD PRIMARY KEY (`id`), ADD KEY `filter_slug` (`filter_slug`), ADD KEY `category` (`category`), ADD KEY `status` (`status`);
ALTER TABLE `team_members` ADD PRIMARY KEY (`id`);
ALTER TABLE `testimonials` ADD PRIMARY KEY (`id`);
ALTER TABLE `fun_facts` ADD PRIMARY KEY (`id`);
ALTER TABLE `contact_messages` ADD PRIMARY KEY (`id`), ADD KEY `status` (`status`), ADD KEY `created_at` (`created_at`), ADD KEY `email` (`email`);
ALTER TABLE `media_files` ADD PRIMARY KEY (`id`), ADD KEY `uploaded_by` (`uploaded_by`);
ALTER TABLE `admin_roles` ADD PRIMARY KEY (`id`);
ALTER TABLE `admin_users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`), ADD KEY `role_id` (`role_id`);

-- --------------------------------------------------------
-- AUTO_INCREMENT settings
-- --------------------------------------------------------
ALTER TABLE `settings` AUTO_INCREMENT = 2;
ALTER TABLE `hero_slides` AUTO_INCREMENT = 3;
ALTER TABLE `service_categories` AUTO_INCREMENT = 7;
ALTER TABLE `service_features` AUTO_INCREMENT = 6;
ALTER TABLE `course_bullets` AUTO_INCREMENT = 6;
ALTER TABLE `team_members` AUTO_INCREMENT = 3;
ALTER TABLE `testimonials` AUTO_INCREMENT = 3;
ALTER TABLE `contact_messages` AUTO_INCREMENT = 1;
ALTER TABLE `media_files` AUTO_INCREMENT = 1;
ALTER TABLE `admin_roles` AUTO_INCREMENT = 3;
ALTER TABLE `admin_users` AUTO_INCREMENT = 2;

-- --------------------------------------------------------
-- Foreign Key Constraints
-- --------------------------------------------------------
ALTER TABLE `services` ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_features` ADD CONSTRAINT `service_features_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `course_bullets` ADD CONSTRAINT `course_bullets_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `admin_users` ADD CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `media_files` ADD CONSTRAINT `media_files_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
