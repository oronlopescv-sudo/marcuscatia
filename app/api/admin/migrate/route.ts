import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function runMigration() {
  const migrations = [
    // Migration 1: Create site_content table
    // Columns must match what app/api/content/route.ts and
    // app/api/content/[id]/route.ts actually query: section, key_name,
    // content, type, updated_at (NOT title/description/category/updatedAt).
    `CREATE TABLE IF NOT EXISTS site_content (
      id VARCHAR(255) PRIMARY KEY,
      section VARCHAR(100) NOT NULL,
      key_name VARCHAR(255) NOT NULL,
      content LONGTEXT,
      type VARCHAR(50) DEFAULT 'text',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_section (section),
      INDEX idx_key_name (key_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 2: Create notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      type ENUM('reservation', 'message', 'comment', 'system') NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      data JSON,
      \`read\` BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_type (type),
      INDEX idx_read (\`read\`),
      INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 3: Create gallery_items table
    // Matches app/api/gallery/route.ts: src, title, category, type,
    // youtubeId, created_at. id is auto-increment (frontend GalleryItem.id
    // is a number, and DELETE filters by numeric id).
    `CREATE TABLE IF NOT EXISTS gallery_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      src VARCHAR(500) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      type ENUM('photo', 'video') DEFAULT 'photo',
      youtubeId VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 4: Create blockedDates table
    // Matches app/api/blocked-dates/route.ts: id, date, reason.
    `CREATE TABLE IF NOT EXISTS blockedDates (
      id VARCHAR(255) PRIMARY KEY,
      date DATE NOT NULL,
      reason VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 5: Create comments table
    // Matches app/api/comments/route.ts: id, name, email, rating, comment,
    // courseId, approved, createdAt.
    `CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      rating TINYINT NOT NULL,
      comment TEXT NOT NULL,
      courseId VARCHAR(255),
      approved BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_courseId (courseId),
      INDEX idx_approved (approved),
      INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 6: Create messages table
    // Matches app/api/messages/route.ts and lib/store.ts addMessage: id,
    // name, email, phone, subject, message, read, createdAt.
    `CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      \`read\` BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_read (\`read\`),
      INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 7: Create reservations table
    // Matches app/api/reservations/route.ts and lib/store.ts
    // addReservation: id, studentName, email, phone, courseId, courseTitle,
    // date, time, guests, totalPrice, currency, notes,
    // dietaryRestrictions, status, paymentStatus, createdAt.
    `CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(255) PRIMARY KEY,
      studentName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      courseId VARCHAR(255) NOT NULL,
      courseTitle VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(100),
      guests INT DEFAULT 1,
      totalPrice DECIMAL(10,2) DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'EUR',
      notes TEXT,
      dietaryRestrictions TEXT,
      status VARCHAR(50) DEFAULT 'confirmed',
      paymentStatus VARCHAR(50) DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_status (status),
      INDEX idx_courseId (courseId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 8: Create courses table
    // Matches app/api/courses/route.ts: id, title, description, price,
    // priceNumber, maxCapacity, level, duration, image, timeSlot,
    // includes, active. Note: lib/store.ts INITIAL_COURSES is the
    // client-side source of truth today, so this table is populated only
    // if/when courses start being managed through the database.
    `CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price VARCHAR(50),
      priceNumber DECIMAL(10,2) DEFAULT 0,
      maxCapacity INT DEFAULT 8,
      level VARCHAR(50) DEFAULT 'Beginner',
      duration VARCHAR(100),
      image VARCHAR(500),
      timeSlot VARCHAR(100),
      includes JSON,
      active BOOLEAN DEFAULT TRUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Migration 9: Insert sample FAQs.
    // ContentEditor stores {title, description, body} as a JSON string in
    // the `content` column (see components/ContentEditor.tsx parseFields),
    // so the seed rows must follow that same shape, not plain text.
    `INSERT IGNORE INTO site_content (id, section, key_name, content, type) VALUES
    ('faq_booking', 'faq', 'faq_booking', '{"title":"How do I book a class?","description":"Information about booking classes","body":"Visit our Courses page, select your preferred class and date, and fill in the reservation form. You will receive a confirmation via email and WhatsApp."}', 'rich_text'),
    ('faq_cancellation', 'faq', 'faq_cancellation', '{"title":"What is your cancellation policy?","description":"Information about cancellations","body":"We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided."}', 'rich_text'),
    ('faq_group', 'faq', 'faq_group', '{"title":"Can I book for a group?","description":"Information about group bookings","body":"Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings."}', 'rich_text')`,
  ];

  const results = [];

  for (const migration of migrations) {
    try {
      await query(migration);
      results.push({ success: true, migration: migration.substring(0, 50) + '...' });
    } catch (error) {
      results.push({
        success: false,
        migration: migration.substring(0, 50) + '...',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Simple protection
    if (secret !== process.env.ADMIN_SECRET && secret !== 'mindelo-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await runMigration();

    // Check if migrations succeeded
    const allSuccess = results.every((r) => r.success);

    return NextResponse.json(
      {
        success: allSuccess,
        message: allSuccess ? '✅ All migrations executed successfully!' : '⚠️ Some migrations failed',
        results,
      },
      { status: allSuccess ? 200 : 500 }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'POST to this endpoint with { secret: "mindelo-2026" } to run migrations',
      example: {
        method: 'POST',
        url: '/api/admin/migrate',
        body: { secret: 'mindelo-2026' },
      },
    },
    { status: 200 }
  );
}
