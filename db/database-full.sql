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

-- ------------------------------------------------------------
-- music_tracks (musica de fundo carregada no admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS music_tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- media_files (fotos, logo e musicas carregadas no admin; ficam na base de
-- dados porque cada deploy da Hostinger apaga os ficheiros do servidor)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_files (
  id VARCHAR(40) PRIMARY KEY,
  mime VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED / DADOS INICIAIS
-- ============================================================

-- Sem cursos de demonstração: os cursos reais são criados no painel admin
-- (tab "Courses & Classes").

-- PIN inicial do painel admin (padrão 1234; trocável em /admin > Settings)
INSERT IGNORE INTO app_settings (id, value) VALUES ('admin_pin', '1234');

-- Sem conteúdo de demonstração: FAQ e depoimentos são geridos no Content Editor.

-- Verificação
SELECT 'Base de dados criada com sucesso!' AS status;
