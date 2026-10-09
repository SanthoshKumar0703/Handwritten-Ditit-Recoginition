-- DigiSense database schema
-- Run: mysql -u root -p < schema.sql
-- More tables (predictions, reports, admins) are added in later phases.

CREATE DATABASE IF NOT EXISTS digit_recognition
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE digit_recognition;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_tokens_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS predictions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  predicted_digit TINYINT NOT NULL,
  confidence FLOAT NOT NULL,
  top_predictions JSON NOT NULL,
  processing_time_ms FLOAT NOT NULL,
  source VARCHAR(10) NOT NULL,
  image_data LONGTEXT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_predictions_user (user_id),
  INDEX idx_predictions_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_logs (
  id CHAR(36) PRIMARY KEY,
  level VARCHAR(10) NOT NULL DEFAULT 'info',
  event VARCHAR(60) NOT NULL,
  message VARCHAR(500) NOT NULL,
  user_id CHAR(36) NULL,
  ip_address VARCHAR(64) NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_logs_created (created_at),
  INDEX idx_logs_level (level)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  category VARCHAR(20) NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(300) NOT NULL,
  link VARCHAR(200) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB;
