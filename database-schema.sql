-- Catia Cooking Mindelo - Database Schema
-- MySQL 5.7+

-- Create Database
CREATE DATABASE IF NOT EXISTS catia_cooking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE catia_cooking_db;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  level VARCHAR(50),
  price VARCHAR(50),
  priceNumber DECIMAL(10, 2),
  maxCapacity INT DEFAULT 8,
  duration VARCHAR(100),
  image VARCHAR(500),
  timeSlot VARCHAR(100),
  includes JSON,
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (active),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(255) PRIMARY KEY,
  studentName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  courseId VARCHAR(255),
  courseTitle VARCHAR(255),
  date DATE NOT NULL,
  time VARCHAR(100),
  guests INT DEFAULT 1,
  totalPrice DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) DEFAULT 'pending',
  paymentStatus VARCHAR(50) DEFAULT 'pending',
  notes LONGTEXT,
  dietaryRestrictions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_email (email),
  INDEX idx_courseId (courseId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message LONGTEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_read (read),
  INDEX idx_createdAt (createdAt),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocked Dates Table
CREATE TABLE IF NOT EXISTS blockedDates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Users Table (Optional - for future authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log Table (Optional - for auditing)
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(50),
  entityId VARCHAR(255),
  userId INT,
  details JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action (action),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Courses
INSERT INTO courses (id, title, description, level, price, priceNumber, maxCapacity, duration, active) VALUES
('cooking-course', 'Traditional Cooking Class & Mindelo Markets Tour', 'A guided visit to the Municipal Market and Fish Market of Mindelo, traditional local transport to our family home in Fonte Francês, and a hands-on Cape Verdean cooking class in a warm, welcoming environment.', 'Beginner', '€45', 45, 8, '2h 30min', 1),
('cachupa-rica', 'The Art of Cachupa Rica from São Vicente', 'Learn how to cook Cape Verde\'s national dish from scratch. From preparing hominy corn and savory meats to the secret sauté that imparts its signature rich golden flavor.', 'Beginner', '€45', 45, 6, '3h 30min', 1),
('vegetarian-creole', 'Vegetarian & Vegan Cape Verdean Creole Masterclass', 'As featured on German television cooking shows! A comprehensive plant-based masterclass celebrating São Vicente vegetables.', 'Beginner', '€40', 40, 8, '2h 30min', 1),
('caldo-de-peixe', 'Mindelo Fresh Catch & Island Caldo de Peixe', 'Experience Mindelo\'s rich seafaring heritage. Visit the bustling fish market to pick the day\'s fresh Atlantic catch.', 'Intermediate', '€45', 45, 6, '3h 00min', 1),
('pastel-tuna', 'Cape Verdean Tuna Pastels & Street Savories', 'Master the flaky, golden crust and spicy, succulent filling of São Vicente\'s famous tuna pastéis.', 'Intermediate', '€35', 35, 8, '2h 30min', 1),
('arroz-atum', 'Mindelo Traditional Tuna Rice (Arroz de Atum)', 'Cape Verde\'s ultimate comfort dish. A masterclass focused on Creole herbs, aromatic broth reduction.', 'Beginner', '€40', 40, 8, '2h 30min', 1),
('doces-tradicionais', 'Island Desserts: Goat Cheese Pudding & Sweet Papaya', 'Round off your meals in true island style. Learn to make creamy baked goat cheese flan.', 'Beginner', '€30', 30, 8, '2h 30min', 1);

-- Create user for application (if needed)
-- GRANT ALL PRIVILEGES ON catia_cooking_db.* TO 'catia_admin'@'localhost' IDENTIFIED BY 'your_secure_password';
-- FLUSH PRIVILEGES;

-- Verify tables created
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'catia_cooking_db';
