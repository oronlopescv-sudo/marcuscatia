# Catia Cooking Mindelo 👨‍🍳

Website para aulas de culinária cabo-verdiana e jantares no restaurante, em Mindelo, São Vicente.

**🌐 Site:** https://catiacookingmindelo.cv
**📍 Local:** Fonte Francês, Mindelo, Cabo Verde

Contactos e restantes dados públicos são geridos em Admin → Settings, não ficam fixos no código.

---

## 🛠️ Setup Local

**Pré-requisitos:** Node.js 20+

1. **Clonar repositório:**
   ```bash
   git clone https://github.com/oronlopescv-sudo/marcuscatia.git
   cd marcuscatia
   npm install
   ```

2. **Configurar variáveis de ambiente:** copiar `.env.example` para `.env.local` e preencher com as tuas próprias credenciais (nunca commitar `.env.local`).

3. **Correr localmente:**
   ```bash
   npm run dev
   ```
   Abrir: http://localhost:3000

---

## 📦 Deploy

O deploy é automático: um `git push` para `main` é suficiente — a Hostinger deteta o push e faz o build/deploy sozinha (uns 2 minutos). Não é preciso SSH nem `npm run build` manual para publicar.

Alterações ao esquema da base de dados aplicam-se sozinhas na próxima reserva/mensagem processada pelo servidor (ver `ensureMediaTable`/`ensureMusicTable` em `lib/media.ts` e o padrão equivalente em `app/api/reservations/route.ts`), ou manualmente por um admin autenticado em `POST /api/admin/migrate`.

---

## 📋 Tech Stack

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MySQL/MariaDB
- **Media:** fotos, logo e músicas carregadas no admin ficam em MySQL (`media_files`, servidas por `/api/media/<id>`) — não no disco, que é substituído a cada deploy
- **UI Components:** Lucide React, React Hook Form, Zod

---

## 🗂️ Estrutura do Projeto

```
app/
├── page.tsx              ← Homepage
├── admin/page.tsx        ← Painel de Admin
├── courses/              ← Página de cursos e do jantar do restaurante
├── gallery/               ← Galeria de fotos e vídeos
├── about/                 ← Sobre nós
├── contact/               ← Contacto
└── api/                   ← API Routes
    ├── content/           ← CMS (editar textos, testemunhos, menu)
    ├── gallery/           ← Fotos e vídeos
    ├── media/[id]/        ← Serve ficheiros guardados em MySQL
    ├── reservations/      ← Reservas (aulas + restaurante)
    ├── comments/          ← Avaliações de clientes
    └── weather/           ← Tempo em Mindelo (Open-Meteo)

components/                ← React Components
lib/                        ← Utilitários (db, auth, email, whatsapp, ...)
db/                          ← SQL de referência (schema canónico)
```

---

## ✨ Features

- ✅ **CMS Dinâmico:** Admin pode editar textos do site sem código
- ✅ **Reservas:** Aulas de culinária e jantar no restaurante, com aprovação no admin
- ✅ **Galeria e Vídeos:** Upload de fotos e vídeos do YouTube
- ✅ **Avaliações de clientes:** moderadas no admin antes de publicar
- ✅ **Responsive:** Mobile-first design
- ✅ **MySQL Integrado:** Persistência de dados e de media

---

*Catia Cooking Mindelo © 2026*
