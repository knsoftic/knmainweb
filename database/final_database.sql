-- phpMyAdmin SQL Dump
-- Final Database Structure for KN Softic (Complete Fresh Installation)
-- Engine: InnoDB
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `kn_softic_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kn_softic_db`;

-- --------------------------------------------------------
-- Table structure for table `settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`id`, `site_name`, `website_tagline`, `company_name`, `company_description`, `about_subtitle`, `about_title`, `about_description`, `copyright_text`, `footer_text`, `company_address`, `working_hours`, `primary_email`, `secondary_email`, `support_email`, `sales_email`, `phone_number`, `whatsapp_number`, `office_address`, `google_maps_embed_url`, `business_name`, `customer_care_number`, `social_links`, `contact_email`, `contact_phone`, `contact_address`) VALUES
(1, 'KN Softic', 'Software House & IT Institute', 'KN Softic', 'We build high-performance digital products, websites, mobile apps, and modern learning experiences.', 'About Us', 'What make us the best?', 'We bring your digital visions to life through a seamless blend of cutting-edge development and striking visual identity.', 'Copyright © 2026 KN Softic. All rights reserved.', 'Software House & IT Institute', 'KN Softic, Faisalabad, Pakistan', 'Mon – Sat: 9:00 AM – 7:00 PM', 'info@knsoftic.com', 'hello@knsoftic.com', 'support@knsoftic.com', 'sales@knsoftic.com', '+92 345 2470250', '+92 345 2470250', 'KN Softic, Faisalabad, Pakistan', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.119794358897!2d72.92739457632612!3d31.367049554605915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39225b00438c21f1%3A0x9ae7c88be0aa71d9!2sKn%20Softic!5e0!3m2!1sen!2pk', 'KN Softic', '+92 345 2470250', '[]', 'info@knsoftic.com', '+92 345 2470250', 'KN Softic, Faisalabad, Pakistan');

-- --------------------------------------------------------
-- Table structure for table `hero_slides`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `hero_slides`;
CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hero_slides` (`id`, `badge_text`, `title`, `description`, `image_url`, `btn_primary_text`, `btn_primary_url`, `btn_secondary_text`, `btn_secondary_url`, `display_order`) VALUES
(1, 'SOFTWARE HOUSE & IT INSTITUTE', 'Build Your Future With Technology', 'At KN Softic, we turn ideas into powerful digital products. From websites and mobile apps to enterprise software, we build solutions that drive business success.', '/assets/images/cover-object.png', 'Explore Services', '/services', 'View Courses', '/courses', 1),
(2, 'SOFTWARE HOUSE & IT INSTITUTE', 'Turning Ideas Into Digital Reality', 'KN Softic delivers modern technology solutions designed to help businesses innovate, automate, and scale. Our focus is on quality, performance, and customer satisfaction.', '/assets/images/cover-object.png', 'Explore Services', '/services', 'View Courses', '/courses', 2);

-- --------------------------------------------------------
-- Table structure for table `service_categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `service_categories`;
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
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
DROP TABLE IF EXISTS `services`;
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`id`, `category_id`, `icon`, `image_url`, `title`, `page_title`, `description`, `home_description`, `display_order`) VALUES
('custom-digital-solutions', 1, 'fa-desktop', '/assets/images/service-01.png', 'Custom Digital Solutions', 'UI/UX Design', 'User-centered design that converts visitors into customers.', 'Whenever you need high-performance web development and striking brand design, we are here to bring your vision to life.', 1),
('expert-craftsmanship', 2, 'fa-shopping-cart', '/assets/images/service-02.png', 'Expert Craftsmanship', 'E-commerce Solutions', 'Complete online stores with payments and inventory management.', 'From seamless e-commerce platforms to intuitive mobile apps, we build scalable digital experiences customized for your business.', 2);

-- --------------------------------------------------------
-- Table structure for table `service_features`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `service_features`;
CREATE TABLE `service_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` varchar(100) NOT NULL,
  `feature` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_features_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
DROP TABLE IF EXISTS `courses`;
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `filter_slug` (`filter_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `filter_slug`, `category`, `image_url`, `title`, `duration`, `enroll_url`, `display_order`) VALUES
('web-development', 'web_development', 'Web Development', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1172&auto=format&fit=crop', 'Web Development', '3 Months', 'https://wa.me/923452470250?text=Hi,%20I%20want%20to%20enroll%20in%20the%20Web%20Development%20course', 1),
('wordpress', 'wordpress', 'WordPress', 'https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?q=80&w=1170&auto=format&fit=crop', 'WordPress', '3 Months', 'https://wa.me/923452470250?text=Hi,%20I%20want%20to%20enroll%20in%20the%20WordPress%20course', 2);

-- --------------------------------------------------------
-- Table structure for table `course_bullets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_bullets`;
CREATE TABLE `course_bullets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` varchar(100) NOT NULL,
  `bullet_text` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_bullets_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
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
DROP TABLE IF EXISTS `projects`;
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `filter_slug` (`filter_slug`),
  KEY `category` (`category`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `projects` (`id`, `filter_slug`, `icon`, `image_url`, `title`, `description`, `category`, `badge`, `label`, `client_name`) VALUES
('techmart', 'websites', 'fa-shopping-cart', NULL, 'TechMart E-Commerce', 'Full-featured e-commerce platform with product catalog, cart, checkout, and admin panel.', 'Portfolio', 'Websites', 'Websites', 'Client: TechMart PK'),
('fittrack', 'mobile', 'fa-heartbeat', NULL, 'FitTrack Mobile App', 'Fitness tracking Android app with workout plans, calorie counter, and progress tracking.', 'Portfolio', 'Mobile', 'Mobile', 'Client: FitTrack Inc'),
('school', 'software', 'fa-university', NULL, 'School Management System', 'A complete school management solution covering student registration, fee management, attendance, results, and parent portal.', 'Software', 'Ready to Deploy', NULL, NULL),
('restaurant', 'software', 'fa-cutlery', NULL, 'Restaurant POS System', 'Full-featured Point of Sale system for restaurants with table management, order tracking, kitchen display, and billing.', 'Software', 'Live Demo', NULL, NULL);

-- --------------------------------------------------------
-- Table structure for table `team_members`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `category` varchar(150) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `team_members` (`id`, `name`, `category`, `image_url`) VALUES
(1, 'Sophia Rose', 'UX Teacher', 'https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&auto=format&fit=crop'),
(2, 'Cindy Walker', 'Graphic Teacher', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop');

-- --------------------------------------------------------
-- Table structure for table `testimonials`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `category` varchar(150) NOT NULL,
  `quote` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `testimonials` (`id`, `name`, `category`, `quote`, `image_url`) VALUES
(1, 'Sara Khan', 'Freelance Designer', 'The graphic design course completely changed my career. I am now earning great income as a freelancer!', '/assets/images/testimonial-author.jpg'),
(2, 'Ahmad Raza', 'CEO, TECHMART PK', 'KN Softic delivered our e-commerce website beyond expectations. Highly professional and results were outstanding.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop');

-- --------------------------------------------------------
-- Table structure for table `fun_facts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `fun_facts`;
CREATE TABLE `fun_facts` (
  `id` varchar(100) NOT NULL,
  `label` varchar(150) NOT NULL,
  `target` int(11) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fun_facts` (`id`, `label`, `target`, `display_order`) VALUES
('students', 'Happy Students', 150, 1),
('hours', 'Course Hours', 804, 2),
('employed', 'Employed Students', 50, 3),
('experience', 'Years Experience', 15, 4);

-- --------------------------------------------------------
-- Table structure for table `contact_messages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `blog_categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `blog_categories`;
CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `blog_tags`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `blog_tags`;
CREATE TABLE `blog_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `blog_posts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `gallery_images` longtext DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `tags_json` text DEFAULT NULL,
  `status` enum('draft', 'published', 'scheduled') NOT NULL DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `reading_time` int(11) DEFAULT NULL,
  `is_featured` boolean NOT NULL DEFAULT false,
  `allow_comments` boolean NOT NULL DEFAULT true,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `canonical_url` varchar(500) DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `twitter_card` varchar(100) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `blog_comments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `blog_comments`;
CREATE TABLE `blog_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `seo_metadata`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `seo_metadata`;
CREATE TABLE `seo_metadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_path` varchar(255) NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_path` (`page_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `media_files`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `media_files`;
CREATE TABLE `media_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `size_bytes` bigint(20) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `admin_roles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_roles`;
CREATE TABLE `admin_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_roles` (`id`, `role_name`, `permissions`) VALUES
(1, 'Super Admin', '["all"]'),
(2, 'Editor', '["manage_content", "manage_media"]');

-- --------------------------------------------------------
-- Table structure for table `admin_users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No admin account is seeded here (a password hash doesn't belong in the repository).
-- After importing, create one with:
--   cd backend && ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run create-admin

-- --------------------------------------------------------
-- Table structure for table `homepage_featured_services`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `homepage_featured_services`;
CREATE TABLE `homepage_featured_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` varchar(100) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `homepage_featured_courses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `homepage_featured_courses`;
CREATE TABLE `homepage_featured_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` varchar(100) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- Table structure for table `homepage_cards`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `homepage_cards`;
CREATE TABLE `homepage_cards` (
  `id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) NOT NULL DEFAULT '',
  `read_more_url` varchar(255) DEFAULT '#',
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `portfolio_projects`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `portfolio_projects`;
CREATE TABLE `portfolio_projects` (
  `id` varchar(100) NOT NULL,
  `filter_slug` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `label` varchar(100) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `filter_slug` (`filter_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(100) NOT NULL,
  `filter_slug` varchar(100) NOT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `icon` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `filter_slug` (`filter_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
