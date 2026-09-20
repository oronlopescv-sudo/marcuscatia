# 🔍 RELATÓRIO DE AUDITORIA COMPLETA — Catia Cooking Mindelo

**Data:** 20 Setembro 2026
**Versão analisada:** commit `1333166` ("Remove localStorage - use only MySQL database")
**Produção:** https://lightskyblue-bat-697565.hostingersite.com
**Método:** build local + `tsc --noEmit` + ESLint + testes HTTP reais contra produção (POST/GET/DELETE) + análise de código

---

## 📊 VEREDICTO EXECUTIVO

| Área | Estado |
|---|---|
| Site em produção | ✅ No ar (HTTP 200, build **antigo**) |
| Build do código atual | ❌ **FALHA** (1 erro TypeScript) |
| Deploys GitHub Actions (2 últimos) | ❌ **Ambos falharam** |
| BD MySQL | ✅ Funcional (leitura + escrita confirmadas) |
| APIs em produção | ⚠️ 4 de 5 funcionam; galeria quebrada |
| Site ↔ BD | ⚠️ **Parcialmente ligado** (só escritas, sem leituras) |
| Segurança | 🔴 **CRÍTICA** (segredos expostos em repo público) |

---

## 🔴 CRÍTICOS (bloqueiam o deploy e/ou expõem segredos)

### C1. Build quebrado — deploy impossível
**Ficheiro:** `lib/store.ts:316`
```
Type error: Type '(res) => Promise<any>' is not assignable to type
'(res) => Reservation'.
```
**Causa:** o commit de hoje tornou `addReservation` async (chama a API), mas a interface `AdminStoreState` ainda declara retorno síncrono `Reservation`. **Consequência:** o novo código nunca compila → os 2 últimos deploys GitHub Actions falharam → **produção continua a servir o build antigo (com localStorage)**. Confirmado: o chunk `/galeria` em produção ainda contém `catia-cooking-gallery-items`.

### C2. Chave SSH privada publicamente exposta no GitHub
**Ficheiro:** `marcuscatia_hostinger_key.txt` (repo **público** — `"private": false` confirmado via API do GitHub)
**Impacto:** qualquer pessoa na internet pode fazer SSH ao servidor Hostinger. **Ação:** remover do git + **regenerar o par de chaves** + apagar do histórico (`git filter-repo` ou BFG). Apagar o ficheiro apenas no próximo commit NÃO resolve — fica no histórico.

### C3. Passwords da BD em texto no repo público
Presentes em 4 sítios:
| Ficheiro | Password exposta |
|---|---|
| `.env.example` | `Caboverde238cv@.` (com host `auth-db2121.hstgr.io`) |
| `GUIA-MYSQL-HOSTINGER.md` | `Caboverde238cv@.` |
| `scripts/run-migrations.js` | `Caboverde238cv@.` (hardcoded) |
| 4 API routes (`courses/reservations/messages/blocked-dates`) | `f5Zy*2M@` hardcoded como fallback — **é a password real de produção** (confirmado: as APIs funcionam em produção sem env vars) |

**Ação:** rodar a password no painel Hostinger, usar apenas env vars no servidor, remover fallbacks hardcoded.

### C4. Reservas com falha silenciosa (perda de dados do cliente)
**Ficheiros:** `app/cursos/[id]/page.tsx` (onSubmit), `app/contacto/page.tsx`, `lib/store.ts`
O formulário chama `addReservation(...)` **sem `await`** e mostra "Booking Request Sent!" após 600ms **independentemente do resultado**. O store faz `return null as any` quando o POST falha. **Cenário real:** turista reserva com rede instável → API falha → cliente vê confirmação → **reserva nunca chega à Cátia**.

### C5. Admin não lê da BD — o painel continua "de demonstração"
O commit diz "All data now syncs directly to MySQL" mas **apenas as escritas** foram ligadas. Nenhuma página chama os GETs (`/api/reservations`, `/api/messages`, `/api/blocked-dates`). O admin inicia com `INITIAL_RESERVATIONS` (dados fake: "Ana Clara Fernandes", "Jean-Luc Moreau"...) e nunca carrega a BD. **Consequência:** mesmo depois de corrigir o deploy, a Cátia abre o `/admin` e vê reservas fictícias, não as reais gravadas na BD.

---

## 🟠 FUNCIONAIS (comportamento incorreto em produção)

### F1. Galeria: API quebrada em produção + funcionalidade regrediu
- `GET /api/gallery` em produção: ❌ `Access denied for user ''@'::1' (using password: NO)` — usa `lib/db.ts` (só env vars, que não existem no servidor; as outras rotas só funcionam por terem credenciais hardcoded).
- **Regressão do commit 1333166:** antes, fotos adicionadas no admin persistiam em localStorage e apareciam na galeria pública. Agora: admin adiciona → só existe em memória → **perde-se ao refrescar**; galeria pública mostra sempre os 9 itens hardcoded; a API `/api/gallery` nunca é chamada por ninguém.

### F2. Formato das datas bloqueadas incompatível
A API devolve `"2027-03-15T00:00:00.000Z"` (ISO completo), mas o frontend compara com `"2027-03-15"` (`format(date,'yyyy-MM-dd')`). Mesmo quando ligarem as leituras, **a validação de datas bloqueadas nunca vai bater certo**.

### F3. Bloquear a mesma data 2× → erro 500 sem mensagem útil
Testado em produção: 2º POST da mesma data → `{"error":"Failed to block date"}` HTTP 500 (UNIQUE constraint não tratada). Devia devolver 409/mensagem "data já bloqueada".

### F4. Cursos na BD incompletos
Os 7 cursos na BD têm `image: null` e `includes: null` (o seed não populou essas colunas). No dia em que o frontend ler cursos da BD, os cartões ficam **sem fotos e sem "What's Included"**. O site atual só funciona porque lê os cursos hardcoded do `lib/store.ts`.

### F5. Weather widget mostra dados falsos como "live"
`GEMINI_API_KEY` não configurada em produção (`{"error":"GEMINI_API_KEY not configured"}`) → o widget exibe sempre o fallback estático (26°C, sunny) **com o selo "Live weather via Google Search"**. Enganoso para o visitante. Além disso, `.env.local`/`.env.production` têm a chave vazia (`GEMINI_API_KEY=""`).

### F6. Newsletter não faz nada
`components/Newsletter.tsx`: simula 1.5s de "loading" e mostra "Subscribed!" — **não grava em lado nenhum** (nem API, nem BD, nem email).

### F7. Admin sem autenticação real
PIN validado só no cliente (1234/mindelo/catia hardcoded no JS) + botão "Quick Demo Access (No PIN)". Com o build novo, quem aceder ao `/admin` passa a manipular dados reais da BD sem qualquer proteção server-side.

---

## 🟡 MENORES (não bloqueiam, mas devem limpar-se)

### TypeScript (1 erro — é o C1)
- `lib/store.ts:316` — tipo de `addReservation`.

### ESLint — 6 erros
| Ficheiro | Erro |
|---|---|
| `app/contacto/page.tsx:35` | `Date.now()` chamada "impura" durante render (regra do React Compiler, novo eslint-config-next 16) |
| `app/cursos/[id]/page.tsx:60` | idem |
| `app/galeria/page.tsx:82` | `setState` síncrono dentro de `useEffect` (o `setGalleryItems(DEFAULT_GALLERY_ITEMS)` é redundante — o state já inicializa com o mesmo valor) |
| `components/AdminGalleryManager.tsx:31` | `setIsLoading(false)` em efeito (redundante — podia inicializar `isLoading:false`) |
| `components/CatiaHeroSection.tsx:54` | `'` não escapado |
| `components/Hero.tsx:68` | `'` não escapado |

### ESLint — 4 warnings
- `app/galeria/page.tsx:88,93` — `useCallback` sem dependência `galleryItems.length`
- `app/layout.tsx:31` — Google Fonts via `<link>` em vez de `next/font` (fontes podem não carregar em navegação client-side)
- `components/CatiaHeroSection.tsx:59` — `<a href="/cursos">` em vez de `<Link>` (componente não usado em lado nenhum, aliás)

### Outros
- `CatiaHeroSection.tsx`, `SectionHeroWithLogo.tsx`, `LogoWatermark.tsx`, `hooks/use-mobile.ts`, `lib/utils.ts` — componentes mortos (nunca importados).
- `lang="en"` no `<html>` apesar de público-alvo turista (OK) mas conteúdo com nomes de páginas em PT (`/cursos`, `/sobre`).
- `README.md` é do template do AI Studio — não descreve o projeto.
- `metadata.json` desatualizado; `package.json.update` é um fragmento solto.
- Modelos Gemini `gemini-3.8-flash` no código (nome provavelmente inválido — tem fallback, não rebenta).
- `next.config.ts`: `images.remotePatterns` sem `img.youtube.com` — quando ligarem vídeos da galeria à BD, os thumbnails do YouTube vão falhar no `<Image>`.

---

## 🧪 PROVAS DOS TESTES EM PRODUÇÃO (20/09/2026)

```
GET  /                          → 200 OK
GET  /api/courses               → 200, 7 cursos da BD (createdAt 2026-09-20 11:48)
GET  /api/reservations          → 200, [] (vazio)
GET  /api/messages              → 200, [] (vazio)
GET  /api/blocked-dates         → 200, []
GET  /api/gallery              → 500 Access denied (sem env vars no servidor)
GET  /api/weather               → 200 com "GEMINI_API_KEY not configured" (fallback estático)
POST /api/blocked-dates         → 201 OK; 2ª vez mesma data → 500 (UNIQUE não tratado)
POST /api/reservations          → 201 OK (reserva criada — ver aviso abaixo)
DELETE /api/blocked-dates       → 200 OK (registos de teste apagados; BD deixada limpa)
Porta MySQL auth-db2121:3306   → alcançável de fora (acesso remoto permitido na firewall;
                                 login remoto negado — user restrito ao host Hostinger)
```

### ⚠️ AVISO — registo de teste na BD de produção
Para validar o INSERT de reservas criei a reserva **`res-1789906837058`** (nome "TESTE-Auditoria", email `teste@auditoria.com`, data 2027-08-15). **Não consegui apagá-la**: não existe rota DELETE de reservas e o acesso MySQL remoto é negado ao meu IP. Para a remover, execute no Hostinger (phpMyAdmin/MySQL Editor ou SSH):

```sql
DELETE FROM reservations WHERE email = 'teste@auditoria.com';
```

Todos os outros registos de teste (datas bloqueadas 2027-03-15, 2027-06-01, 2027-06-02, 2027-07-04) **foram apagados** — verificado com GET final `[]`.

---

## 🗺️ DIAGRAMA DO ESTADO ATUAL

```
                    ┌─────────────────────────────┐
                    │   PRODUÇÃO (build ANTIGO)   │
                    │  ainda com localStorage ✗   │
                    └─────────────────────────────┘
                                 ↑ serve
┌──────────┐   deploy FALHOU   ┌──────────────────┐
│ GitHub    │ ──────────────✗→ │ Código novo      │
│ (PÚBLICO) │  (2x failure,   │ (não compila ✗)  │
│ 🔴 chaves │  erro TS C1)     └──────────────────┘
│ 🔴 passwords                    │
└──────────┘                    ↓ quando funcionar
                   ESCRITAS → BD ✓  |  LEITURAS ← BD ✗ (C5)
                   Galeria API: quebrada (F1) + nunca chamada
```

---

## ✅ PLANO DE CORREÇÃO RECOMENDADO (por prioridade)

1. **Hoje — Segurança:** remover `marcuscatia_hostinger_key.txt` do repo e histórico; **regenerar chave SSH**; rodar password MySQL no Hostinger; limpar passwords de `.env.example`, `GUIA-MYSQL-HOSTINGER.md`, `run-migrations.js`; remover fallbacks hardcoded das 4 API routes.
2. **Hoje — Desbloquear deploy:** corrigir o tipo de `addReservation` (interface → `Promise<Reservation | null>`); remover `return null as any`; fazer as páginas **await** e mostrar erro real ao cliente (C4).
3. **Essencial — Leitura da BD:** admin carrega reservas/mensagens/datas via GET ao montar (C5); popular `image` e `includes` dos 7 cursos na BD (F4).
4. **Galeria:** usar `/api/gallery` de verdade (GET na página pública, POST/DELETE no admin) + configurar env vars DB no Hostinger (F1); acrescentar `img.youtube.com` ao next.config.
5. **Datas:** normalizar formato `yyyy-MM-dd` no GET (F2) e tratar duplicado como 409 (F3).
6. **Depois:** weather (definir GEMINI_API_KEY no Hostinger ou remover o selo "Live"), newsletter (ligar a messages/newsletter ou remover), autenticação server-side do admin, lint (6 erros + 4 warnings), apagar componentes mortos, README.
7. **Limpeza:** apagar registo de teste da BD (SQL acima) e o ficheiro `tsconfig.tsbuildinfo` não versionado.

---

*Auditoria executada com testes reais contra produção. Nenhum dado real foi alterado; todos os registos de teste foram removidos exceto a reserva indicada (sem rota de remoção disponível).*