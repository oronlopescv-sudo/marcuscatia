# Catia Cooking Mindelo 👨‍🍳

Website para aulas de culinária cabo-verdiana em Mindelo, São Vicente.

**🌐 Site:** https://lightskyblue-bat-697565.hostingersite.com  
**📍 Local:** Fonte Francês, Mindelo, Cabo Verde  
**📞 Contacto:** +238 5953973  
**✉️ Email:** deandradeleukelcatiasofia@gmail.com

---

## 🛠️ Setup Local

**Pré-requisitos:** Node.js 18+

1. **Clonar repositório:**
   ```bash
   git clone https://github.com/oronlopescv-sudo/marcuscatia.git
   cd marcuscatia
   npm install
   ```

2. **Configurar variáveis de ambiente** (`.env.local`):
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   MYSQL_HOST=auth-db2121.hstgr.io
   MYSQL_USER=u128759105_Marcuscatia
   MYSQL_PASSWORD=SEU_DB_PASSWORD
   MYSQL_DATABASE=u128759105_Catia
   GEMINI_API_KEY=seu_api_key_aqui
   ```

3. **Correr localmente:**
   ```bash
   npm run dev
   ```
   Abrir: http://localhost:3000

---

## 📦 Deploy no Hostinger

```bash
cd /home/u128759105/public_html
git pull origin main
npm run build
npm start
```

---

## 📋 Tech Stack

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MySQL (Hostinger)
- **Storage:** Public gallery para fotos
- **UI Components:** Lucide React, React Hook Form, Zod

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx           ← Homepage
│   ├── admin/page.tsx     ← Painel de Admin
│   ├── cursos/            ← Página de cursos
│   ├── galeria/           ← Galeria de fotos
│   ├── sobre/             ← Sobre nós
│   ├── api/               ← API Routes
│   │   ├── content/       ← CMS (editar textos)
│   │   ├── gallery/       ← Upload de fotos
│   │   ├── reservations/  ← Reservas
│   │   ├── notifications/ ← Notificações
│   │   └── weather/       ← Dados de clima
├── components/            ← React Components
├── hooks/                 ← Custom Hooks
├── lib/                   ← Utilitários
└── db/                    ← SQL Migrations

public/
└── gallery/               ← Fotos carregadas (não versionadas)
```

---

## ✨ Features

- ✅ **CMS Dinâmico:** Admin pode editar textos do site sem código
- ✅ **Upload de Fotos:** Galeria com fotos do dispositivo
- ✅ **Sistema de Reservas:** Formulário com notificações
- ✅ **Responsive:** Mobile-first design
- ✅ **MySQL Integrado:** Persistência de dados
- ✅ **Admin Dashboard:** Gerir conteúdo, fotos, reservas

---

## 📝 Notas

- Fotos da galeria são guardadas em `public/gallery/` (não versionadas no git)
- MySQL Hostinger: `auth-db2121.hstgr.io`
- Todas as cores seguem tema Mindelo (azul, vermelho, ouro, creme)

---

*Catia Cooking Mindelo © 2026*
