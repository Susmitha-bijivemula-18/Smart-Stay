-- Sample Data for StayNest - Smart PG Management System
-- Run this script in your MySQL Workbench against the 'pg_management' database
-- NOTE: Make sure the Spring Boot backend has run at least once so the tables exist!

USE pg_management;

-- 1. Insert Mock Users
INSERT INTO users (email, name, password, phone, provider, role, created_at) VALUES 
('admin@staynest.com', 'System Admin', '$2a$10$xyz...', '9999999999', 'LOCAL', 'ADMIN', NOW()),
('john@example.com', 'John Doe', '$2a$10$xyz...', '9876543210', 'LOCAL', 'USER', NOW());

-- 2. Insert Mock PGs (Matching the premium UI cards)
INSERT INTO pg (pg_name, address, area, city, state, description, latitude, longitude, price, created_at) VALUES 
('Premium StayNest Coliving', 'Plot 123, Hitech City Main Rd', 'Madhapur', 'Hyderabad', 'Telangana', 'Experience luxury living in our fully furnished coliving space designed for modern professionals. Enjoy high-speed internet, regular housekeeping, and a vibrant community atmosphere in the heart of the tech hub. Your security and comfort are our top priorities.', 17.4485, 78.3908, 12000.00, NOW()),
('Urban Nest Coliving', 'KPHB Phase 3', 'Kukatpally', 'Hyderabad', 'Telangana', 'Vibrant community, home-cooked meals, and gym access. Perfect for students and entry-level IT professionals.', 17.4948, 78.3996, 6500.00, NOW()),
('The Skyline Residences', '1st Main Road', 'Koramangala', 'Bengaluru', 'Karnataka', 'Executive suites with housekeeping and premium amenities. Live the high life in Bangalore.', 12.9352, 77.6245, 12000.00, NOW()),
('Cozy Corner PG', 'Sector 44', 'Gurugram', 'Delhi NCR', 'Haryana', 'Peaceful environment near cyber park. Great connectivity to metro stations.', 28.4595, 77.0266, 9000.00, NOW());

-- 3. Insert Floors for PG 1 (Premium StayNest Coliving)
INSERT INTO floors (floor_number, pg_id) VALUES 
(1, 1),
(2, 1),
(3, 1);

-- Insert Floors for PG 2 (Urban Nest)
INSERT INTO floors (floor_number, pg_id) VALUES 
(1, 2),
(2, 2);

-- 4. Insert Rooms for PG 1 (Premium StayNest Coliving)
-- Columns: availability (bit), price, room_type, sharing_type (int), floor_id, pg_id
-- Note: sharing_type is stored as an integer (e.g., 1 for Single, 2 for 2 Sharing)
INSERT INTO rooms (availability, price, room_type, sharing_type, floor_id, pg_id) VALUES 
(1, 15000.00, 'Premium AC', 1, 1, 1),
(1, 10000.00, 'Standard AC', 2, 1, 1),
(0, 6500.00, 'Non-AC', 3, 2, 1),
(1, 9500.00, 'AC Box', 2, 2, 1),
(1, 14000.00, 'Premium AC Balcony', 1, 3, 1),
(1, 9000.00, 'Standard AC', 2, 3, 1);

-- Insert Rooms for PG 2 (Urban Nest)
INSERT INTO rooms (availability, price, room_type, sharing_type, floor_id, pg_id) VALUES 
(1, 8000.00, 'Non-AC Single', 1, 4, 2),
(1, 6500.00, 'Non-AC Standard', 2, 4, 2),
(1, 5000.00, 'Non-AC Budget', 3, 5, 2);

-- 5. Insert Mock Booking (John booked a room in Urban Nest)
INSERT INTO bookings (checkin_date, created_at, duration, status, room_id, user_id) VALUES 
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), NOW(), 6, 'CONFIRMED', 8, 2);
