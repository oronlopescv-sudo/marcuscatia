# 🧪 Testar Conexão SSH - Hostinger

## ⚠️ ANTES DE TESTAR:

✅ Chave pública adicionada no Hostinger?
✅ Arquivo privado em `~/.ssh/marcuscatia_hostinger`?
✅ Permissões corretas? (`chmod 600`)

---

## 🧪 Teste 1: Verificar se a chave privada existe

### Mac/Linux:
```bash
ls -la ~/.ssh/marcuscatia_hostinger
```

**Resultado esperado:**
```
-rw------- 1 user staff 3456 Sep 20 10:00 /Users/user/.ssh/marcuscatia_hostinger
```

### Windows (PowerShell):
```powershell
ls $env:USERPROFILE\.ssh\marcuscatia_hostinger
```

---

## 🧪 Teste 2: Verificar permissões (apenas Mac/Linux)

```bash
ls -l ~/.ssh/marcuscatia_hostinger
```

**Deve mostrar:** `-rw-------` (ou 600)

Se não tiver permissão correta:
```bash
chmod 600 ~/.ssh/marcuscatia_hostinger
```

---

## 🧪 Teste 3: Testar conexão SSH

### Comando básico:
```bash
ssh -i ~/.ssh/marcuscatia_hostinger seu-usuario@seu-dominio.com
```

**Substitua:**
- `seu-usuario` → seu usuário no Hostinger (ex: `orson1985`)
- `seu-dominio.com` → seu domínio (ex: `catiacooking.com`)

**Exemplo completo:**
```bash
ssh -i ~/.ssh/marcuscatia_hostinger orson1985@catiacooking.com
```

---

## 🔍 Teste 4: Com detalhes (verbose)

Se não funcionar, use `-vvv` para ver detalhes:

```bash
ssh -vvv -i ~/.ssh/marcuscatia_hostinger seu-usuario@seu-dominio.com
```

Isso mostrará:
- Qual arquivo de chave está usando
- Se a chave foi reconhecida
- Todos os detalhes da conexão

---

## ✅ Resultado esperado quando funciona:

### Primeira vez (vai pedir confirmação):
```
The authenticity of host 'seu-dominio.com (IP)' can't be established.
ED25519 key fingerprint is SHA256:xxxxx...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Digite:** `yes` e pressione Enter

### Após conectar:
```
Welcome to Hostinger!

[seu-usuario@seu-dominio ~]$
```

Agora você está **dentro do servidor**! ✅

---

## ❌ Erros Comuns e Soluções:

### 1️⃣ **"Permission denied (publickey)"**
```
permission denied (publickey)
```

**Solução:**
- ✅ Chave pública foi adicionada no Hostinger?
- ✅ Está usando o usuário correto?
- ✅ Arquivo privado tem permissão 600?

```bash
chmod 600 ~/.ssh/marcuscatia_hostinger
```

---

### 2️⃣ **"No such file or directory"**
```
/Users/user/.ssh/marcuscatia_hostinger: No such file or directory
```

**Solução:**
Arquivo não existe. Verifique:
```bash
ls -la ~/.ssh/
```

Se não estiver lá, crie a chave novamente ou copie o arquivo correto.

---

### 3️⃣ **"Could not resolve hostname"**
```
ssh: Could not resolve hostname seu-dominio.com
```

**Solução:**
- ✅ Domínio está correto?
- ✅ Tem internet?
- ✅ Dominios é real?

---

### 4️⃣ **"Connection refused"**
```
Connection refused
```

**Solução:**
- SSH está habilitado no Hostinger?
- Contate suporte Hostinger

---

### 5️⃣ **"Too many authentication failures"**
```
Too many authentication failures
```

**Solução:**
Aguarde alguns minutos e tente novamente. Hostinger bloqueia temporariamente após falhas.

---

## 🎯 Checklist de Conexão:

- [ ] Arquivo `~/.ssh/marcuscatia_hostinger` existe
- [ ] Permissões estão 600 (`-rw-------`)
- [ ] Chave pública adicionada no Hostinger
- [ ] Domínio está correto
- [ ] Usuário está correto
- [ ] Tem internet
- [ ] SSH conecta com sucesso
- [ ] Terminal mostra `[usuario@dominio ~]$`

---

## 🎉 Se tudo funcionar:

Você conseguirá:

```bash
# Ver arquivos do servidor
ls -la

# Criar pasta para o projeto
mkdir marcuscatia

# Entrar na pasta
cd marcuscatia

# Clonar o repositório
git clone https://github.com/oronlopescv-sudo/marcuscatia.git

# Instalar dependências
npm install

# Fazer build
npm run build

# Iniciar servidor
npm start
```

**Pronto! Site rodando no Hostinger! 🚀**
