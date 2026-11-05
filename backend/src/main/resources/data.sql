-- ====================================================================
-- SecondServe – Sample Seed Data for MySQL
-- ====================================================================

-- Users
INSERT INTO users (id, name, email, password_hash, role, organization, phone, address, verified, avatar_url) VALUES
('usr-admin-1', 'Harish Solaiyappan', 'admin@secondserve.org', 'password123', 'ADMIN', 'SecondServe Central HQ', '+1 (555) 019-2831', 'City Center Suite 400', TRUE, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
('usr-donor-1', 'Chef Marcus Sterling', 'donor@grandhyatt.com', 'password123', 'DONOR', 'The Grand Hyatt Ballroom', '+1 (555) 234-8901', '450 Grand Avenue, Financial Bay', TRUE, 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'),
('usr-donor-2', 'Elena Rostova', 'elena@artisanbakes.com', 'password123', 'DONOR', 'Artisan Heritage Boulangerie', '+1 (555) 345-6789', '128 Baker Street, Old Quarter', TRUE, 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=150&q=80'),
('usr-ngo-1', 'Dr. Sarah Jenkins', 'sarah@hopefeeding.org', 'password123', 'NGO', 'Hope & Nutrition Foundation', '+1 (555) 876-5432', '89 Community Way, Shelter District', TRUE, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'),
('usr-ngo-2', 'Father David Morales', 'david@citymealsrescue.org', 'password123', 'NGO', 'City Meals Relief Society', '+1 (555) 432-1098', '312 Harbor Boulevard, Eastside', TRUE, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
('usr-vol-1', 'Alex Rivera', 'alex.rivera@volunteer.net', 'password123', 'VOLUNTEER', 'Green Wheels Logistics', '+1 (555) 789-0123', '74 University Avenue', TRUE, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80');

-- Donors
INSERT INTO donors (id, user_id, donor_type, license_number, kitchen_address) VALUES
('dnr-1', 'usr-donor-1', 'HOTEL', 'FSSAI-100293847291', '450 Grand Avenue, Loading Dock B'),
('dnr-2', 'usr-donor-2', 'BAKERY', 'FSSAI-100984712093', '128 Baker Street, Old Quarter');

-- NGOs
INSERT INTO ngos (id, user_id, reg_number, certificate_80g, beneficiaries_served, service_areas) VALUES
('ngo-1', 'usr-ngo-1', 'NGO-80G-49204/2021', 'CERT-80G-2021-99', 42000, 'Shelter District, Old Quarter'),
('ngo-2', 'usr-ngo-2', 'NGO-80G-99381/2019', 'CERT-80G-2019-12', 28500, 'Harbor Outreach, Eastside');

-- Volunteers
INSERT INTO volunteers (id, user_id, vehicle_type, rating, deliveries_count, active_status) VALUES
('vol-1', 'usr-vol-1', 'Refrigerated Cargo Van (Clean EV)', 4.95, 142, TRUE);

-- Food Donations
INSERT INTO food_donations (id, donor_id, donor_name, pickup_address, donor_phone, food_name, category, dietary, quantity, servings, prep_time, available_until, storage_condition, food_safety_info, allergens, image_url, status) VALUES
('SEC-1001', 'usr-donor-1', 'The Grand Hyatt Ballroom', '450 Grand Avenue, Loading Dock B', '+1 (555) 234-8901', 'Executive Banquet Basmati Pilaf & Paneer Curry', 'COOKED_MEALS', 'VEG', '65 portions (~28 kg)', 65, 'Today, 2:00 PM', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Hot Insulated Containers (>68°C)', 'Prepared in HACCP & FSSAI certified kitchen.', 'Contains Dairy, Gluten-Free', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 'LISTED'),
('SEC-1002', 'usr-donor-2', 'Artisan Heritage Boulangerie', '128 Baker Street, Old Quarter', '+1 (555) 345-6789', 'Artisan Sourdough Loaves & Croissants Assortment', 'BAKERY', 'VEG', '40 Loaves & 55 Pastries', 95, 'Today, 6:30 AM', DATE_ADD(NOW(), INTERVAL 8 HOUR), 'Dry Ambient Temperature', 'Freshly baked at dawn. Zero preservatives.', 'Contains Gluten, Dairy', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', 'REQUESTED');
