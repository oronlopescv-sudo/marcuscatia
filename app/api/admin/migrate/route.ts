import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function runMigration() {
  const migrations = [
    // Migration 1: Create site_content table
    `CREATE TABLE IF NOT EXISTS site_content (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content LONGTEXT,
      category ENUM('hero', 'features', 'faq', 'testimonial', 'social') NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_createdAt (createdAt)
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

    // Migration 3: Insert sample FAQs
    `INSERT IGNORE INTO site_content (id, title, description, content, category) VALUES
    ('faq-booking', 'How do I book a class?', 'Information about booking classes', 'Visit our Courses page, select your preferred class and date, and fill in the reservation form. You will receive a confirmation via email and WhatsApp.', 'faq'),
    ('faq-cancellation', 'What is your cancellation policy?', 'Information about cancellations', 'We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided.', 'faq'),
    ('faq-group', 'Can I book for a group?', 'Information about group bookings', 'Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings.', 'faq')`,
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
