import { query } from '@/lib/db';

// Pequena camada de configuração persistida no banco (chave/valor).
// Cria a tabela sob demanda se ainda não existir, para funcionar sem
// precisar rodar uma migração manual extra.
async function ensureTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS app_settings (
      id VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureTable();
  const rows: any = await query('SELECT value FROM app_settings WHERE id = ?', [key]);
  return rows && rows[0] ? String(rows[0].value) : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureTable();
  const rows: any = await query('SELECT id FROM app_settings WHERE id = ?', [key]);
  if (rows && rows[0]) {
    await query('UPDATE app_settings SET value = ? WHERE id = ?', [value, key]);
  } else {
    await query('INSERT INTO app_settings (id, value) VALUES (?, ?)', [key, value]);
  }
}
