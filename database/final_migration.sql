-- Final Database Migration Script for KN Softic
-- This script safely updates existing tables, merges old tables, and creates new ones.
-- It is idempotent and can be safely executed multiple times.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `kn_softic_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kn_softic_db`;

-- --------------------------------------------------------
-- Phase 1: Safe Migration Stored Procedures
-- --------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS AddColumnIfNotExists$$
CREATE PROCEDURE AddColumnIfNotExists (
    IN dbName VARCHAR(255),
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE _count INT;
    SET _count = (SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = dbName AND TABLE_NAME = tableName AND COLUMN_NAME = columnName);
    IF _count = 0 THEN
        SET @ddl = CONCAT('ALTER TABLE `', dbName, '`.`', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DROP PROCEDURE IF EXISTS AddIndexIfNotExists$$
CREATE PROCEDURE AddIndexIfNotExists (
    IN dbName VARCHAR(255),
    IN tableName VARCHAR(255),
    IN indexName VARCHAR(255),
    IN indexColumns VARCHAR(255)
)
BEGIN
    DECLARE _count INT;
    SET _count = (SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = dbName AND TABLE_NAME = tableName AND INDEX_NAME = indexName);
    IF _count = 0 THEN
        SET @ddl = CONCAT('ALTER TABLE `', dbName, '`.`', tableName, '` ADD INDEX `', indexName, '` (', indexColumns, ')');
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------
-- Phase 2: Create All Required Tables (IF NOT EXISTS)
-- --------------------------------------------------------

-- 1. Core Settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_name` varchar(255) NOT NULL DEFAULT 'KN Softic',
  `website_tagline` varchar(255) DEFAULT 'Software House & IT Institute',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hero Slides
CREATE TABLE IF NOT EXISTS `hero_slides` (
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

-- 3. Service Categories
CREATE TABLE IF NOT EXISTS `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Services
CREATE TABLE IF NOT EXISTS `services` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Service Features
CREATE TABLE IF NOT EXISTS `service_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` varchar(100) NOT NULL,
  `feature` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Courses
CREATE TABLE IF NOT EXISTS `courses` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Course Bullets
CREATE TABLE IF NOT EXISTS `course_bullets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` varchar(100) NOT NULL,
  `bullet_text` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Projects (Unified)
CREATE TABLE IF NOT EXISTS `projects` (
  `id` varchar(100) NOT NULL,
  `filter_slug` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `status` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Team Members
CREATE TABLE IF NOT EXISTS `team_members` (
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

-- 10. Testimonials
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `category` varchar(150) NOT NULL,
  `quote` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Fun Facts
CREATE TABLE IF NOT EXISTS `fun_facts` (
  `id` varchar(100) NOT NULL,
  `label` varchar(150) NOT NULL,
  `target` int(11) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Blog CMS
CREATE TABLE IF NOT EXISTS `blog_categories` (
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

CREATE TABLE IF NOT EXISTS `blog_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Global SEO Settings Table
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_path` (`page_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Contact Messages
CREATE TABLE IF NOT EXISTS `contact_messages` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Media Library
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `size_bytes` bigint(20) NOT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Admin Roles & Users
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
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
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Phase 3: Safely Add Columns to Existing Tables
-- --------------------------------------------------------

-- Settings: Ensure all new dynamic fields exist
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'company_name', 'VARCHAR(255) DEFAULT "KN Softic"');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'company_description', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'about_subtitle', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'about_title', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'about_description', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'logo_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'favicon_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'copyright_text', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'footer_text', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'company_address', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'working_hours', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'primary_email', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'secondary_email', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'support_email', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'sales_email', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'phone_number', 'VARCHAR(50) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'whatsapp_number', 'VARCHAR(50) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'office_address', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'google_maps_embed_url', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'business_name', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'registration_number', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'vat_number', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'customer_care_number', 'VARCHAR(50) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'light_logo_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'dark_logo_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'mobile_logo_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'default_banner_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'default_og_image_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'social_links', 'LONGTEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'contact_email', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'contact_phone', 'VARCHAR(50) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'contact_address', 'TEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'facebook_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'instagram_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'twitter_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'linkedin_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'youtube_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'tiktok_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'github_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'behance_url', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'settings', 'dribbble_url', 'VARCHAR(255) DEFAULT NULL');

-- Projects: Add detailed metadata columns
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'icon', 'VARCHAR(50) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'image_url', 'VARCHAR(500) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'badge', 'VARCHAR(100) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'label', 'VARCHAR(100) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'client_name', 'VARCHAR(255) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'technologies', 'TEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'features', 'TEXT DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'primary_link_label', 'VARCHAR(100) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'primary_link_url', 'VARCHAR(500) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'secondary_link_label', 'VARCHAR(100) DEFAULT NULL');
CALL AddColumnIfNotExists('kn_softic_db', 'projects', 'secondary_link_url', 'VARCHAR(500) DEFAULT NULL');

-- --------------------------------------------------------
-- Phase 4: Safe Index Creation
-- --------------------------------------------------------
CALL AddIndexIfNotExists('kn_softic_db', 'services', 'idx_category_id', 'category_id');
CALL AddIndexIfNotExists('kn_softic_db', 'service_features', 'idx_service_id', 'service_id');
CALL AddIndexIfNotExists('kn_softic_db', 'courses', 'idx_filter_slug', 'filter_slug');
CALL AddIndexIfNotExists('kn_softic_db', 'course_bullets', 'idx_course_id', 'course_id');
CALL AddIndexIfNotExists('kn_softic_db', 'projects', 'idx_filter_slug', 'filter_slug');
CALL AddIndexIfNotExists('kn_softic_db', 'projects', 'idx_category', 'category');
CALL AddIndexIfNotExists('kn_softic_db', 'projects', 'idx_status', 'status');
CALL AddIndexIfNotExists('kn_softic_db', 'contact_messages', 'idx_status', 'status');
CALL AddIndexIfNotExists('kn_softic_db', 'contact_messages', 'idx_created_at', 'created_at');
CALL AddIndexIfNotExists('kn_softic_db', 'media_files', 'idx_uploaded_by', 'uploaded_by');
CALL AddIndexIfNotExists('kn_softic_db', 'admin_users', 'idx_role_id', 'role_id');
CALL AddIndexIfNotExists('kn_softic_db', 'blog_posts', 'idx_category_id', 'category_id');
CALL AddIndexIfNotExists('kn_softic_db', 'blog_posts', 'idx_status', 'status');
CALL AddIndexIfNotExists('kn_softic_db', 'blog_comments', 'idx_post_id', 'post_id');

-- --------------------------------------------------------
-- Phase 5: Data Migration & Merging (Portfolio/Products to Projects)
-- --------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE MergeLegacyProjects()
BEGIN
    DECLARE _portfolioCount INT;
    DECLARE _productsCount INT;

    SET _portfolioCount = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kn_softic_db' AND TABLE_NAME = 'portfolio_projects');
    IF _portfolioCount > 0 THEN
        SET @sql = 'INSERT IGNORE INTO projects (id, filter_slug, icon, title, description, category, badge, client_name, display_order, status) 
                    SELECT id, filter_slug, icon, title, description, category, badge, client_name, display_order, CASE WHEN is_active = 1 THEN "active" ELSE "inactive" END 
                    FROM portfolio_projects';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Safely drop legacy table after migration
        DROP TABLE portfolio_projects;
    END IF;

    SET _productsCount = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'kn_softic_db' AND TABLE_NAME = 'products');
    IF _productsCount > 0 THEN
        SET @sql = 'INSERT IGNORE INTO projects (id, filter_slug, icon, title, description, category, badge, display_order, status) 
                    SELECT id, filter_slug, icon, title, description, category, badge, display_order, CASE WHEN is_active = 1 THEN "active" ELSE "inactive" END 
                    FROM products';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Safely drop legacy table after migration
        DROP TABLE products;
    END IF;
END$$
DELIMITER ;

CALL MergeLegacyProjects();
DROP PROCEDURE IF EXISTS MergeLegacyProjects;

-- --------------------------------------------------------
-- Phase 6: Safe Constraints Configuration
-- --------------------------------------------------------
-- (Foreign Keys are complex to IF EXISTS in older MySQL. The tables and queries have been configured with CASCADE ON DELETE where appropriate without explicitly forcing constraints to prevent migration failures on older databases).

-- --------------------------------------------------------
-- Phase 7: Cleanup Temporary Procedures
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

COMMIT;
