-- ============================================================
-- CATIA COOKING MINDELO — BASE DE DADOS COMPLETA (schema + seed)
-- MySQL 5.7+ / MariaDB
-- Uso:  mysql -u USUARIO -p < database-full.sql
-- Obs.: criado a partir do schema canônico (db/migrations.sql) e dos
-- dados iniciais do site. Não é um dump do banco em produção (que não
-- está acessível daqui) — é um setup limpo e reproduzível.
-- ============================================================

CREATE DATABASE IF NOT EXISTS catia_cooking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catia_cooking_db;

-- ------------------------------------------------------------
-- courses
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- reservations
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message LONGTEXT NOT NULL,
  `read` BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_read (`read`),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- blockedDates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blockedDates (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  reason VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  courseId VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- site_content (Conteúdo editável; usado por /api/content)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- gallery_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type ENUM('photo', 'video') DEFAULT 'photo',
  youtubeId VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- app_settings (config do site: PIN do admin, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- newsletter_subscribers (assinaturas do Newsletter)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED / DADOS INICIAIS
-- ============================================================

-- Cursos iniciais (conforme lib/store.ts INITIAL_COURSES)
INSERT INTO courses (id, title, description, level, price, priceNumber, maxCapacity, duration, image, timeSlot, includes, active) VALUES
('cooking-course', 'Traditional Cooking Class', 'A guided visit to the Municipal Market and Fish Market of Mindelo, traditional local transport to our family home in Fonte Francês, and a hands-on Cape Verdean cooking class in a warm, welcoming environment.', 'Beginner', '€45', 45, 8, '2h 30min', 'https://static.wixstatic.com/media/f4fd80_4ae355554a644923a2290e145fe89000~mv2.jpg', '10:00 - 12:30', JSON_ARRAY('Tour do Mercado Municipal & Mercado do Peixe', 'Transporte tradicional colectivo até Fonte Francês', 'Aula prática de cozinha cabo-verdiana com a Cátia', 'Almoço caseiro completo e prova em grupo', 'Bebidas de boas-vindas e livro de receitas de recordação'), 1),
('vegetarian-creole', 'Vegetarian / Vegan Cooking Class', 'As featured on German television cooking shows! A comprehensive plant-based masterclass celebrating São Vicente vegetables: slow-simmered bean & squash Cachupa, sweet potato, manioc, and rich aromatic Creole sofrito.', 'Beginner', '€40', 40, 8, '2h 30min', 'https://static.wixstatic.com/media/f4fd80_df372cb7dc234c4b876dbbfda91d0f56~mv2.jpg', '15:00 - 17:30', JSON_ARRAY('Produtos frescos 100% vegetais do mercado', 'Técnicas tradicionais e especiarias crioulas', 'Receitas veganas autênticas', 'Prova completa e sobremesa'), 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PIN inicial do painel admin (padrão 1234; trocável em /admin > Settings)
INSERT INTO app_settings (id, value) VALUES ('admin_pin', '1234')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Conteúdo FAQ inicial (seção 'faq', usada pelo ContentEditor)
INSERT IGNORE INTO site_content (id, section, key_name, content, type) VALUES
('faq-booking', 'faq', 'faq-booking', 'Visit our Courses page, select your preferred class and date, and fill in the reservation form. You''ll receive a confirmation via email and WhatsApp.', 'rich_text'),
('faq-cancellation', 'faq', 'faq-cancellation', 'We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided.', 'rich_text'),
('faq-group', 'faq', 'faq-group', 'Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings.', 'rich_text');

-- Verificação
SELECT 'Base de dados criada com sucesso!' AS status;
