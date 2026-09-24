-- Migration: Add site_content and notifications tables
-- Date: 2026-09-20

-- Table: site_content (Conteúdo editável do site, colunas alinhadas com
-- /api/content e ContentEditor: section, key_name, content, type)
CREATE TABLE IF NOT EXISTS site_content (
  id VARCHAR(255) PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  content LONGTEXT,
  type VARCHAR(50) DEFAULT 'text',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_section (section),
  INDEX idx_key_name (key_name)
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
  INDEX idx_read (`read`),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample FAQ content (section='faq', conforme o ContentEditor e /api/content)
INSERT IGNORE INTO site_content (id, section, key_name, content, type) VALUES
('faq-booking', 'faq', 'faq-booking', 'Visit our Courses page, select your preferred class and date, and fill in the reservation form. You''ll receive a confirmation via email and WhatsApp.', 'rich_text'),
('faq-cancellation', 'faq', 'faq-cancellation', 'We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided.', 'rich_text'),
('faq-group', 'faq', 'faq-group', 'Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings.', 'rich_text');

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
