# 🚀 Executar Migrações SQL no Hostinger

## ⚡ Quick Guide (5 minutos)

### Passo 1: Acessar phpMyAdmin
```
1. Vá para: https://hostinger.com (seu painel)
2. Clique em "MySQL Databases"
3. Encontre "u128759105_Catia"
4. Clique em "Manage"
5. Clique em "phpMyAdmin"
```

### Passo 2: Selecionar Database
```
1. No menu esquerdo, clique em "u128759105_Catia"
2. Você está na database correta quando vê as tabelas (courses, reservations, etc)
```

### Passo 3: Executar SQL
```
1. Clique na aba "SQL"
2. Cole o SQL abaixo (veja seção SQL Scripts)
3. Clique "Go" ou "Execute"
4. ✅ Aguarde a mensagem de sucesso
```

---

## 📝 SQL Scripts

### Script 1: Criar tabela `site_content`

```sql
-- Tabela para conteúdo editável do site (FAQs, testimonials, etc)
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

-- Inserir FAQs de exemplo
INSERT IGNORE INTO site_content (id, title, description, content, category) VALUES
('faq-booking', 'How do I book a class?', 'Information about booking classes', 'Visit our Courses page, select your preferred class and date, and fill in the reservation form. You will receive a confirmation via email and WhatsApp.', 'faq'),
('faq-cancellation', 'What is your cancellation policy?', 'Information about cancellations', 'We offer full refunds for cancellations made 48 hours in advance. For cancellations within 48 hours, a 50% refund is provided.', 'faq'),
('faq-group', 'Can I book for a group?', 'Information about group bookings', 'Yes! We offer group discounts. Classes are limited to 8 people maximum. Contact us directly for group bookings.', 'faq');
```

### Script 2: Criar tabela `notifications`

```sql
-- Tabela para notificações do admin
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
```

---

## ✅ Verificar se Funcionou

Após executar os scripts, rode estes comandos para verificar:

```sql
-- Verificar site_content
SELECT COUNT(*) as total_items FROM site_content;

-- Verificar notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- Listar FAQs
SELECT title, description FROM site_content WHERE category = 'faq';
```

Se retornar dados, tudo funcionou! ✅

---

## 🆘 Troubleshooting

### Erro: "Table already exists"
✅ Isso é normal! Significa que a tabela já foi criada
✅ Pode ignorar e continuar

### Erro: "Syntax error"
❌ Verifique se copiou o SQL completo
❌ Não deve ter partes faltando

### Erro: "Access Denied"
❌ Verifique credenciais:
  - User: u128759105_Marcuscatia
  - Password: f5Zy*2M@
  - Database: u128759105_Catia

---

## 📊 O Que Cada Tabela Faz

| Tabela | Descrição |
|--------|-----------|
| `site_content` | Armazena FAQs, testimonials, hero text que você edita no admin |
| `notifications` | Notificações de reservas, mensagens, comentários |

---

## 🎯 Após Executar

1. ✅ Tabelas criadas no MySQL
2. ✅ Admin Panel → Content tab funciona
3. ✅ Admin Panel → Settings tab funciona
4. ✅ Notificações automáticas funcionam
5. ✅ WhatsApp notificações funcionam

---

## ⏱️ Tempo Necessário

- Executar SQL: **1 minuto**
- Verificar: **1 minuto**
- **Total: 2 minutos!**

---

Se tiver dúvidas, avise!
