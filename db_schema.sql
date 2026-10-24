-- db_schema.sql
-- Run this script to generate the database schema for the StayNest Application

CREATE DATABASE IF NOT EXISTS pg_management;
USE pg_management;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Nullable for OAuth login
    phone VARCHAR(20),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    provider ENUM('local', 'google') DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PG Table
CREATE TABLE IF NOT EXISTS PG (
    pg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pg_name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Floors Table
CREATE TABLE IF NOT EXISTS Floors (
    floor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pg_id BIGINT NOT NULL,
    floor_number INT NOT NULL,
    FOREIGN KEY (pg_id) REFERENCES PG(pg_id) ON DELETE CASCADE
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS Rooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pg_id BIGINT NOT NULL,
    floor_id BIGINT NOT NULL,
    room_type VARCHAR(100) NOT NULL, -- e.g., 'AC', 'Non-AC'
    sharing_type INT NOT NULL, -- e.g., 1 (Single), 2 (Double), 3 (Triple)
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (pg_id) REFERENCES PG(pg_id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES Floors(floor_id) ON DELETE CASCADE
);

-- Bookings Table (Updated for Meal-Only support)
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pg_id BIGINT NOT NULL,
    room_id BIGINT NULL, -- Nullable for meal-only bookings
    meal_plan VARCHAR(100),
    room_type VARCHAR(100),
    checkin_date DATE NOT NULL,
    duration INT NOT NULL, 
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pg_id) REFERENCES PG(pg_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE SET NULL
);
