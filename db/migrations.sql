-- ============================================================================
-- Migrações MySQL para Catia Cooking Mindelo
-- Execute estes comandos no Hostinger MySQL Editor
-- Database: u128759105_Catia
-- User: u128759105_Marcuscatia
-- ============================================================================

-- ============================================================================
-- TABELA: RESERVATIONS (Reservas de aulas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  courseId VARCHAR(100) NOT NULL,
  courseTitle VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20),
  guests INT NOT NULL DEFAULT 1,
  totalPrice DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('unpaid', 'on_arrival', 'paid') DEFAULT 'on_arrival',
  notes LONGTEXT,
  dietaryRestrictions VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_date (date),
  KEY idx_courseId (courseId),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: COURSES (Cursos disponíveis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  price VARCHAR(50),
  priceNumber DECIMAL(10, 2),
  duration VARCHAR(100),
  level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  maxCapacity INT DEFAULT 8,
  image VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  timeSlot VARCHAR(50),
  includes LONGTEXT, -- JSON array
  highlights LONGTEXT, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: MESSAGES (Mensagens de contacto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message LONGTEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_isRead (isRead),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: GALLERY_ITEMS (Itens da galeria - fotos e vídeos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  type ENUM('photo', 'video') DEFAULT 'photo',
  youtubeId VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_type (type),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: BLOCKED_DATES (Datas bloqueadas para novas reservas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Inserir cursos iniciais
-- ============================================================================
INSERT IGNORE INTO courses (id, title, description, price, priceNumber, duration, level, maxCapacity, timeSlot) VALUES
('cooking-course', 'Traditional Cooking Class & Markets Tour', 'Learn traditional Cape Verdean cooking', '€45', 45, '4 hours', 'Beginner', 8, '09:30 - 13:30'),
('cachupa-rica', 'The Art of Cachupa Rica', 'Master the traditional cachupa rica', '€45', 45, '4 hours', 'Intermediate', 6, '09:30 - 13:30'),
('vegetarian-creole', 'Vegetarian & Vegan Masterclass', 'Island vegetables and plant-based cooking', '€40', 40, '3.5 hours', 'Beginner', 8, '10:00 - 13:30'),
('caldo-de-peixe', 'Fresh Catch & Island Caldo de Peixe', 'Seafood and traditional fish soup', '€45', 45, '4 hours', 'Intermediate', 6, '09:30 - 13:30'),
('pastel-tuna', 'Tuna Pastels & Street Savories', 'Learn pastry and street food techniques', '€35', 35, '3 hours', 'Beginner', 8, '11:00 - 14:00'),
('arroz-atum', 'Traditional Tuna Rice', 'Rice dishes and fish preparation', '€40', 40, '3.5 hours', 'Beginner', 8, '10:00 - 13:30'),
('doces-tradicionais', 'Island Desserts (Goat Cheese Pudding)', 'Traditional Cape Verdean sweets', '€30', 30, '3 hours', 'Beginner', 8, '14:00 - 17:00');

-- ============================================================================
-- Indexes para performance
-- ============================================================================
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_courseId ON reservations(courseId);
CREATE INDEX idx_messages_email ON messages(email);
CREATE INDEX idx_gallery_type ON gallery_items(type);

-- ============================================================================
-- Fim das migrações
-- ============================================================================
-- Execute todos os comandos acima no Hostinger MySQL Editor
-- Depois atualize o .env.production com as credenciais
