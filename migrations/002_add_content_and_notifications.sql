-- Migration: Add site_content and notifications tables
-- Date: 2026-09-20

-- Table: site_content (Conteúdo editável do site)
CREATE TABLE IF NOT EXISTS site_content (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content LONGTEXT,
  category ENUM('hero', 'features', 'faq', 'testimonial', 'social') NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications (Notificações do admin)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('reservation', 'message', 'comment', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSON,
  `read` BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_read (read),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample FAQ content
INSERT IGNORE INTO site_content (id, title, description, content, category) VALUES
('faq-booking', 'How do I book a class?', 'Information about booking classes', 'Visit our Courses page, select your preferred class and date, and fill in the reservation form. You\'ll receive a confirmation via email and WhatsApp.', 'faq'),
('faq-cancellation', 'What is your cancellation policy?', 'Information about cancellations', 'We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided.', 'faq'),
('faq-group', 'Can I book for a group?', 'Information about group bookings', 'Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings.', 'faq');

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
