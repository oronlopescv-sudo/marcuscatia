# Deploy no Hostinger — Catia Cooking Mindelo

## Status Atual
- ✅ Código corrigido localmente
- ✅ Build: 20 routes, 175 kB First Load JS
- ✅ Commit: `8fcfca4` — "fix: correct site codebase"
- ✅ Push: main branch atualizado

## Passos de Deploy

### 1. SSH para o Hostinger
```bash
ssh -p 65002 u128759105@72.60.93.207
# Password: Caboverde238cv@.
cd ~/public_html
```

### 2. Pull do código
```bash
git pull origin main
# Deve mostrar: "8fcfca4 fix: correct site codebase..."
```

### 3. Instalar dependências + build
```bash
npm install
npm run build
```

Se der erro sobre mysql2:
- É normal — mysql2 só existe no Hostinger
- O build vai falhar localmente, mas funcionará no servidor

### 4. Restart do Node.js
```bash
pm2 restart all
# ou via hPanel: Website → Node.js → Restart
```

### 5. Verificar status
```bash
pm2 status
pm2 logs --lines 50  # Ver erros recentes
```

### 6. Testar no navegador
```
https://lightskyblue-bat-697565.hostingersite.com
```

Se a página aparecer preta:
```bash
# No Hostinger:
cd ~/public_html
git log -1 --oneline  # Deve ser 8fcfca4
npm run build 2>&1 | tail -20  # Ver se há erros
pm2 logs
```

## Correções Principais Neste Deploy

| Problema | Solução |
|----------|---------|
| **CMS quebrado** | ContentEditor enviava campos errados (title/description/category) para BD que tem (section/key_name/content/type). Agora usa schema correto. |
| **Galeria pública vazia** | Página /gallery tinha 9 fotos hardcoded, nunca chamava /api/gallery. Agora busca fotos reais carregadas pelo admin. |
| **Logo upload não funcionava** | LogoUploadManager salvava para arquivo aleatório. Agora sobrescreve /logo.png (usado por todo o site). |
| **URL errada em .env** | .env.production tinha mistyrose-hummingbird-... (antiga). Corrigido para lightskyblue-bat-... (atual). |
| **Código morto** | 7 componentes órfãos removidos, 3 ficheiros AI Studio deletados. |
| **Texto em português** | Todas as mensagens de erro traduzidas para inglês. |

## MySQL — Pronto?

Se ainda não correu SQL, executar no Hostinger hPanel:
1. **Databases → MySQL Editor**
2. Copiar + Colar conteúdo de `/tmp/marcuscatia/db/migrations.sql`
3. Execute
4. Criar 5 tabelas + inserir 7 cursos padrão

Sem SQL → o site anda mas APIs de galeria/reservas/comentários devolvem erro.

## Próximos Passos (após deploy bem-sucedido)

- [ ] Adicionar fotos reais da Cátia (via admin `/admin` → Photo Gallery)
- [ ] Configurar Google Analytics (NEXT_PUBLIC_GA_ID em .env.production)
- [ ] Testar submissão de reservas + contato (vai enviar para WhatsApp da Cátia)
- [ ] Preparar FAQ/Testimonials (via admin → Content Editor)
- [ ] PWA (já baseado em service workers, apenas precisa de polimento)

## Contato
- GitHub: oronlopescv-sudo/marcuscatia
- Cátia: deandradeleukelcatiasofia@gmail.com (+238 5953973)
