-- ====================================================================
-- SecondServe – Surplus Food Rescue Coordination System
-- Database Schema DDL for MySQL
-- Tables: Users, Donors, NGOs, Volunteers, Food Donations,
--         Food Requests, Volunteer Assignments, Donation Tracking,
--         Notifications, Feedback.
-- ====================================================================

CREATE DATABASE IF NOT EXISTS secondserve_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE secondserve_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('DONOR', 'NGO', 'VOLUNTEER', 'ADMIN') NOT NULL,
    organization VARCHAR(150),
    phone VARCHAR(30),
    address VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donors Table (Specific Restaurant/Hotel details)
CREATE TABLE IF NOT EXISTS donors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    donor_type ENUM('HOTEL', 'RESTAURANT', 'BAKERY', 'CATERER', 'CONVENTION_CENTER'),
    license_number VARCHAR(100),
    kitchen_address VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. NGOs Table (Charity details)
CREATE TABLE IF NOT EXISTS ngos (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    reg_number VARCHAR(100),
    certificate_80g VARCHAR(100),
    beneficiaries_served INT DEFAULT 0,
    service_areas VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 5.00,
    deliveries_count INT DEFAULT 0,
    active_status BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Food Donations Table
CREATE TABLE IF NOT EXISTS food_donations (
    id VARCHAR(50) PRIMARY KEY,
    donor_id VARCHAR(50) NOT NULL,
    donor_name VARCHAR(150) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(50),
    food_name VARCHAR(200) NOT NULL,
    category ENUM('COOKED_MEALS', 'BAKERY', 'FRESH_PRODUCE', 'DAIRY_PACKAGED', 'BEVERAGES') NOT NULL,
    dietary ENUM('VEG', 'NON_VEG', 'VEGAN') NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    servings INT NOT NULL,
    prep_time VARCHAR(100),
    available_until DATETIME NOT NULL,
    storage_condition VARCHAR(255) NOT NULL,
    food_safety_info TEXT,
    allergens VARCHAR(255),
    image_url VARCHAR(255),
    status ENUM('LISTED', 'REQUESTED', 'APPROVED', 'VOLUNTEER_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'DISTRIBUTION_COMPLETED') DEFAULT 'LISTED',
    current_request_id VARCHAR(50),
    assigned_volunteer_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id)
);

-- 6. Food Requests Table
CREATE TABLE IF NOT EXISTS food_requests (
    id VARCHAR(50) PRIMARY KEY,
    donation_id VARCHAR(50) NOT NULL,
    ngo_id VARCHAR(50) NOT NULL,
    ngo_name VARCHAR(150) NOT NULL,
    beneficiary_count INT NOT NULL,
    target_community VARCHAR(255) NOT NULL,
    delivery_eta VARCHAR(100),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id),
    FOREIGN KEY (ngo_id) REFERENCES users(id)
);

-- 7. Volunteer Assignments Table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id VARCHAR(50) PRIMARY KEY,
    donation_id VARCHAR(50) NOT NULL,
    volunteer_id VARCHAR(50) NOT NULL,
    pickup_time DATETIME,
    delivery_time DATETIME,
    status ENUM('ASSIGNED', 'EN_ROUTE', 'PICKED_UP', 'DELIVERED') DEFAULT 'ASSIGNED',
    notes TEXT,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id),
    FOREIGN KEY (volunteer_id) REFERENCES users(id)
);

-- 8. Donation Tracking Audit Logs Table
CREATE TABLE IF NOT EXISTS donation_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50),
    actor_name VARCHAR(120),
    actor_role VARCHAR(50),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    target_role VARCHAR(50),
    target_user_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    donation_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Feedback & Quality Review Table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(50) PRIMARY KEY,
    donation_id VARCHAR(50) NOT NULL,
    ngo_name VARCHAR(150),
    donor_name VARCHAR(150),
    meals_served INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id)
);
