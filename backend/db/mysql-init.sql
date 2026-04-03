CREATE DATABASE IF NOT EXISTS nearpet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nearpet;

CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_users_username (username)
);

CREATE TABLE IF NOT EXISTS photos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    image_url VARCHAR(1000) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    stored_file_name VARCHAR(255) NULL,
    image_urls TEXT NULL,
    stored_file_names TEXT NULL,
    featured BIT(1) NOT NULL DEFAULT b'0',
    featured_order INT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    owner_user_id BIGINT NULL,
    owner_username VARCHAR(255) NULL,
    customer_name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    pet_name VARCHAR(255) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    notes VARCHAR(1000) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id BIGINT NOT NULL,
    notification_email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
