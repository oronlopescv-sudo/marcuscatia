# 📋 INSTRUÇÕES PARA CONTINUAR O PROJETO

## 🎯 OBJETIVO FINAL
Fazer o site **Next.js** sincronizar **100% dos dados** com o **banco de dados MySQL** no Hostinger.

---

## 📍 ESTADO ATUAL DO PROJETO

### ✅ JÁ FEITO
1. ✅ Banco de dados MySQL criado (`u128759105_Catia`)
2. ✅ 4 tabelas criadas (courses, messages, reservations, blockedDates)
3. ✅ 7 cursos carregados no banco
4. ✅ APIs endpoints criados (/api/courses, /api/messages, etc.)
5. ✅ localStorage REMOVIDO completamente
6. ✅ TypeScript tipos corrigidos (addReservation e addMessage agora async)
7. ✅ Site rodando em Next.js 15.4.9

### 🔄 EM PROGRESSO
1. 🔄 npm install mysql2 (no Hostinger)
2. 🔄 npm run build (no Hostinger)
3. 🔄 Testes de conexão com BD

---

## 🔧 PRÓXIMAS TAREFAS (em ordem)

### TAREFA 1: Verificar e Completar Build no Hostinger
**Arquivo**: `~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/last-source`

```bash
# SSH ao servidor
ssh -p 65002 -i ~/.ssh/marcuscatia_hostinger u128759105@72.60.93.207

# Ir para o diretório
cd ~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/last-source

# Verificar se .next existe
ls -la .next/

# Se não existir, fazer build
/opt/alt/alt-nodejs20/root/usr/bin/npm run build

# Aguardar conclusão (pode levar 5-10 minutos)
```

**Sucesso quando**: Diretório `.next/` existe e contém arquivos

---

### TAREFA 2: Verificar mysql2 Instalado
```bash
# No mesmo diretório
grep "mysql2" package.json

# Se não estiver, instalar
/opt/alt/alt-nodejs20/root/usr/bin/npm install mysql2@latest --save

# Verificar instalação
ls -la node_modules/mysql2/
```

**Sucesso quando**: `node_modules/mysql2/` existe

---

### TAREFA 3: Confirmar .env.production
```bash
# Verificar arquivo
cat ~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/current/.env.production

# Deve ter:
# DB_HOST=localhost
# DB_USER=u128759105_Marcuscatia
# DB_PASSWORD=f5Zy*2M@
# DB_NAME=u128759105_Catia
```

**Sucesso quando**: Arquivo existe com todas variáveis

---

### TAREFA 4: Testar Conexão com MySQL
```bash
# Do servidor Hostinger
mysql -u u128759105_Marcuscatia -p'f5Zy*2M@' u128759105_Catia -e "SELECT COUNT(*) as total_cursos FROM courses;"

# Deve retornar:
# total_cursos
# 7
```

**Sucesso quando**: Retorna `7` (número de cursos)

---

### TAREFA 5: Testar APIs Localmente
```bash
# Testar GET /api/courses
curl http://localhost:3000/api/courses

# Deve retornar JSON com cursos
# {"courses": [...]}

# Testar POST /api/messages
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "subject": "Test",
    "message": "This is a test message"
  }'

# Deve retornar:
# {"success": true, "id": "msg-..."}
```

**Sucesso quando**: APIs retornam JSON válido

---

### TAREFA 6: Testar Sincronização BD
```bash
# 1. Fazer POST em /api/messages com dados de teste
# 2. Verificar no BD se foi salvo:

mysql -u u128759105_Marcuscatia -p'f5Zy*2M@' u128759105_Catia -e "SELECT * FROM messages;"

# Deve mostrar a mensagem que foi enviada
```

**Sucesso quando**: Dados aparecem no banco após POST

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### Erro 1: "mysql2 not found"
```
❌ Solução: Instalar com npm
/opt/alt/alt-nodejs20/root/usr/bin/npm install mysql2@latest --save
```

### Erro 2: "Cannot connect to MySQL"
```
❌ Solução: Verificar credenciais
- Host: localhost (não 72.60.93.207 quando no servidor)
- User: u128759105_Marcuscatia
- Pass: f5Zy*2M@
- DB: u128759105_Catia
```

### Erro 3: "Build fails with TypeScript errors"
```
❌ Solução: Checar tipos em lib/store.ts
- addReservation retorna Promise<Reservation | null>
- addMessage retorna Promise<void>
```

### Erro 4: "API endpoint returns 500"
```
❌ Solução: Verificar logs
npm run build 2>&1 | tail -50
```

---

## 📝 CHECKLIST FINAL

- [ ] Build Next.js completo (.next/ existe)
- [ ] mysql2 instalado (node_modules/mysql2/ existe)
- [ ] .env.production com credenciais corretas
- [ ] MySQL conecta (query retorna 7 cursos)
- [ ] GET /api/courses funciona
- [ ] POST /api/messages funciona
- [ ] Dados salvos no BD após POST
- [ ] Nenhum erro de TypeScript

---

## 🔐 CREDENCIAIS

**BD MySQL:**
```
Host: 72.60.93.207 (ou localhost se no servidor)
Port: 3306
User: u128759105_Marcuscatia
Pass: f5Zy*2M@
DB: u128759105_Catia
```

**Hostinger SSH:**
```
Host: 72.60.93.207
Port: 65002
User: u128759105
Key: ~/.ssh/marcuscatia_hostinger
```

**Site:**
```
URL: https://lightskyblue-bat-697565.hostingersite.com
Local: ~/domains/lightskyblue-bat-697565.hostingersite.com/
```

**Git:**
```
Repo: https://github.com/oronlopescv-sudo/marcuscatia
Branch: main
```

---

## 📞 CONTATO
Se encontrar erro não listado aqui, relatar exatamente:
1. Qual comando executou
2. Qual erro recebeu
3. Qual arquivo afetado
4. Qual linha do código (se aplicável)

---

## ✅ QUANDO TERMINAR TUDO
1. Fazer último commit com sucesso
2. Git push para origin main
3. Avisar que tudo está pronto para teste
4. Ir para FASE DE TESTES

---

**BOA SORTE! 🚀**
