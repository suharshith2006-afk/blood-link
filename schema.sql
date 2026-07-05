CREATE DATABASE IF NOT EXISTS kakinada_blood_link;
USE kakinada_blood_link;

-- 1. LOCALITIES MASTER DATA SET (Used for normalized mapping loops)
CREATE TABLE IF NOT EXISTS localities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS MASTER TABLE (Handles centralized authentication and role separation)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'recipient') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. DONORS PROFILE LEDGER (Linked directly to users table via foreign key)
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    locality_name VARCHAR(100) NOT NULL,
    residential_address TEXT NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    donation_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (locality_name) REFERENCES localities(name) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. RECIPIENTS PROFILE LEDGER (Linked directly to users table via foreign key)
CREATE TABLE IF NOT EXISTS recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    required_blood_group VARCHAR(5) NOT NULL,
    locality_name VARCHAR(100) NOT NULL,
    preferred_hospital VARCHAR(150) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (locality_name) REFERENCES localities(name) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Kakinada localized master regions dataset
INSERT INTO localities (name) VALUES 
('Jagannaickpur'), ('Sarpavaram'), ('Ramanayyapeta'), ('Ashok Nagar'),
('Bhanugudi Junction'), ('Gandhi Nagar'), ('Indrapalem'), ('Vakalapudi'),
('Sambamurthy Nagar'), ('Turangi'), ('Suryaraopeta'), ('Rama Rao Peta')
ON DUPLICATE KEY UPDATE name=name;