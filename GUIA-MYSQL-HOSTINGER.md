# 🗄️ Guia: Integração MySQL com Hostinger

**Data:** 19 Setembro 2026  
**Status:** ✅ Pronto para Deploy  
**Database:** u128759105_Catia

---

## 📋 Credenciais do Hostinger

```
Host:     localhost (dentro do Hostinger)
Database: u128759105_Catia
User:     u128759105_Marcuscatia
Password: Caboverde238cv@.
```

---

## 🚀 Passo 1: Executar Migrações SQL

### 1. Aceder ao Hostinger MySQL Editor

1. Login em `hpanel.hostinger.com`
2. Seleccionar Website: `lightskyblue-bat-697565.hostingersite.com`
3. Ir em **Databases** → **MySQL Editor** (ou phpMyAdmin)
4. Seleccionar database `u128759105_Catia`

### 2. Executar SQL Migrations

1. Copiar todo o conteúdo de `db/migrations.sql`
2. Colar no SQL Editor do Hostinger
3. Clicar "Execute" ou "Run"
4. ✅ Aguardar: "Executed successfully"

**Resultado esperado:**
```
✅ Table 'reservations' created
✅ Table 'courses' created
✅ Table 'messages' created
✅ Table 'gallery_items' created
✅ Table 'blocked_dates' created
✅ 7 courses inserted
✅ Indexes created
```

---

## 🔄 Passo 2: Deploy do Código

### 1. Commit e Push para GitHub

```bash
cd /tmp/marcuscatia
npm run build  # Verificar que compila
git add -A
git commit -m "feat: integrar MySQL Hostinger

- Adicionar lib/db.ts com pool de conexões
- Criar API routes para reservas e galeria
- Adicionar SQL migrations
- Atualizar .env.production com credenciais MySQL"
git push origin main
```

### 2. Hostinger faz auto-pull (se configurado)

- Se tiver auto-deploy: aguardar 2-5 minutos
- Se não: fazer git pull manual no Hostinger

### 3. Instalações de Dependências

No Hostinger SSH/Terminal:
```bash
npm install mysql2/promise
npm run build
npm start
```

---

## 🧪 Passo 3: Testar Integração

### Teste 1: Verificar Conexão à Base de Dados

```bash
# No Hostinger SSH
node -e "const db = require('./lib/db'); db.query('SELECT VERSION()').then(r => console.log(r))"
```

**Esperado:** Versão do MySQL

### Teste 2: Testar API de Reservas

```bash
curl -X GET https://lightskyblue-bat-697565.hostingersite.com/api/reservations
```

**Esperado:** JSON array [] (vazio no início)

### Teste 3: Testar API de Galeria

```bash
curl -X GET https://lightskyblue-bat-697565.hostingersite.com/api/gallery
```

**Esperado:** JSON array [] (vazio no início)

### Teste 4: Criar Reserva via Admin

1. Abrir `/admin` no site
2. Ir em "Reservations" → "Add Booking"
3. Preencher dados e submeter
4. ✅ Verificar em `/admin` → dados aparecem
5. ✅ Verificar no MySQL: `SELECT * FROM reservations`

### Teste 5: Adicionar Foto à Galeria

1. Abrir `/admin` → **Gallery** tab
2. "Add Photo/Video" → Photo
3. Preencher URL e dados
4. ✅ Verificar no MySQL: `SELECT * FROM gallery_items`

---

## 🔐 Segurança

### Credenciais Armazenadas

- ✅ `.env.production` no Hostinger (não versionado)
- ✅ Não comitar passwords no GitHub
- ❌ Nunca partilhar .env em público

### Validações

```typescript
// Todo o input é validado:
- Email format (Zod + SQL)
- Phone format (regex)
- YouTube ID (11 chars)
- SQL Prepared Statements (evita injection)
- Rate limiting (30s entre submits)
```

---

## 📊 Database Schema

### Tabela: `reservations`
```
id (PK), studentName, email, phone, courseId, courseTitle,
date, time, guests, totalPrice, currency, status, paymentStatus,
notes, dietaryRestrictions, created_at, updated_at
```

### Tabela: `courses`
```
id (PK), title, description, price, priceNumber, duration,
level, maxCapacity, image, active, timeSlot, includes,
highlights, created_at, updated_at
```

### Tabela: `messages`
```
id (PK), name, email, subject, message, isRead, created_at
```

### Tabela: `gallery_items`
```
id (PK), src, title, category, type (photo|video),
youtubeId, created_at, updated_at
```

### Tabela: `blocked_dates`
```
id (PK), date (UNIQUE), reason, created_at
```

---

## 🛠️ Troubleshooting

### Erro: "Can't connect to MySQL"

**Causa:** Host incorrecto ou credenciais erradas

**Solução:**
1. Verificar .env.production
2. Confirmar credenciais no Hostinger
3. Verificar que tabelas foram criadas (MySQL Editor)

### Erro: "Table doesn't exist"

**Causa:** SQL migrations não foram executadas

**Solução:**
1. Ir em Hostinger MySQL Editor
2. Executar `db/migrations.sql` completo
3. Verificar "Executed successfully"

### Erro: "Connection pool timeout"

**Causa:** Muitas conexões simultâneas

**Solução:**
1. Aumentar `connectionLimit` em `lib/db.ts` (linha 15)
2. Reiniciar Node.js

```typescript
connectionLimit: 20, // aumentar de 10
```

### Dados não aparecem em /admin

**Causa:** Frontend ainda usa localStorage

**Solução:**
1. Limpar localStorage: `localStorage.clear()`
2. Refresh página
3. Dados devem vir da API MySQL agora

---

## 📈 Próximos Passos

### Fase 1: Deploy (HOJE)
- [ ] Executar SQL migrations no Hostinger
- [ ] Push código para GitHub
- [ ] Testar /admin e /galeria
- [ ] Verificar MySQL Editor para dados

### Fase 2: Monitoramento (Esta Semana)
- [ ] Adicionar logging de erros
- [ ] Monitorar performance de queries
- [ ] Backups automáticos

### Fase 3: Otimizações (Próxima Semana)
- [ ] Adicionar caching (Redis)
- [ ] Otimizar queries (indexes)
- [ ] Analytics (views, conversions)

---

## 💾 Backup Automático

No Hostinger: **Backups** → Ativar backups automáticos diários

---

## 📞 Suporte

Se tiver problemas:

1. Verificar logs no Hostinger (SSH ou Logs panel)
2. Testar conexão MySQL direto: `mysql -h localhost -u u128759105_Marcuscatia -p u128759105_Catia`
3. Verificar `.env.production` no Hostinger

---

## 🎯 Checklist Final

- [ ] Credenciais do MySQL corretas
- [ ] SQL migrations executadas
- [ ] `.env.production` atualizado
- [ ] npm install mysql2/promise (Hostinger)
- [ ] npm run build (sem errors)
- [ ] /admin funciona
- [ ] /galeria funciona
- [ ] Dados aparecem no MySQL Editor

---

**Status:** ✅ **Pronto para Deploy em Produção**

Assinado por: Claude (Análise Técnica Automática)  
Data: 19 Setembro 2026
