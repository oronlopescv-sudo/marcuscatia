# 🔐 Guia Completo: Adicionar SSH Key no Hostinger

## 📍 Passo 1: Acessar Hostinger Dashboard

1. Entre em https://www.hostinger.com/
2. Faça login com sua conta
3. Clique em **"Hosting"** no menu superior
4. Selecione seu domínio/plano

---

## 📍 Passo 2: Ir para SSH Keys

Na página de gerenciamento do hosting:

```
Menu Lateral (esquerda):
├── Account
├── Hosting
├── Domains
├── Email
└── Advanced
    └── SSH Keys ← CLIQUE AQUI
```

Ou:
1. Clique em **"Advanced"** no menu lateral
2. Selecione **"SSH Keys"**

---

## 📍 Passo 3: Adicionar Nova SSH Key

Na página de SSH Keys:

1. Clique no botão **"Add SSH Key"** (verde, no canto superior direito)

---

## 📍 Passo 4: Preencher os Dados

Uma janela/formulário aparecerá com os campos:

### **Key Name** (Nome da chave)
```
marcuscatia-deployment
```

### **Public Key** (Chave Pública - IMPORTANTE!)
Cole **APENAS** a chave pública (não a privada!):

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCaToo95y8weUWfTbqKKmtBrJpT52txRwybcGQzWC16Vg9bRVkE1Y8sb6A/6+yM5tViz/MpZ7vw0daQoKf3BafWs5Vcthr5AItuqjqXlnO4MNb87jYMlBE2wrwJoOpmjRC5slK9tYQGoVEnTnJZ6HwOnk4rLew2S3CQyuMOTSM4YW9PXQX7WONWtFx+PJw+7IB3H04BQguIzYBCuLo5Va4UKzHAvprN5Q7/avwkS4NOil0DACYC0zJntmZpbkht+M/Q5/zfEEf7cM+STlSkqJm30ht1sIKIHGjzzINe6dYuTlP8YHsasDYFk0WmAzL3hZ46GuJHprOr5wreg2j8dLEk0S9LHwU6y/M3a53QLojbxVzogPws88MkaDxpi4Z69JgnVN2XRr1ukzTX68Zv7xvBMeywAGx7EG01+QuOUUZGFikhAxiCytMxIXOAKcNdGqfXLYTcRaIzVnr5k/+vngSI5St8xb2yWP9Fr0OFyRq/SE5XKPEoIaSvWzymj1y2Eb9WH4ydNXIg/Km0P17uWO7+yzYO1C/ADwRygFAWuIiAVKX7dJx/8gxj1yC9AgpNi3z4WSWRLE0yEN2sPx+zFyAcWn6wy4rAwc8bFOYQmoSUFUk3vo2H2wWP9/OCKeGX4c5/QKUaiGBIHcUVjYRlXr+Q1lslWc0GQozs2gRZpZmRFQ== orson1985@Host-001.lan
```

---

## 📍 Passo 5: Salvar

1. Clique no botão **"Save"** ou **"Add"** (verde)
2. Aguarde a mensagem de sucesso ✅

---

## ✅ Verificar se foi adicionada

Após salvar, você verá a chave listada:

```
SSH Keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:              marcuscatia-deployment
Fingerprint:       7ysT7mwGb7SBE7llu3LMQ7DN5aK6rZcl4vuIVErHEoY
Added:             2026-09-20
Status:            ✅ Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔑 Diferença Entre as Chaves

### ❌ **NÃO USE** (Chave Privada):
```
-----BEGIN OPENSSH PRIVATE KEY-----
MIIJKAIBAAKCAgQCaToo95y8weUWfTbqKKmtBrJpT52txRwybcGQzWC16Vg9bRVk
...
-----END OPENSSH PRIVATE KEY-----
```

### ✅ **USE ESTA** (Chave Pública):
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCaToo95y8weUWfTbqKKmtBrJpT52txRwybcGQzWC16Vg9bRVkE1Y8sb6A/6+yM5tViz/MpZ7vw0daQoKf3BafWs5Vcthr5AItuqjqXlnO4MNb87jYMlBE2wrwJoOpmjRC5slK9tYQGoVEnTnJZ6HwOnk4rLew2S3CQyuMOTSM4YW9PXQX7WONWtFx+PJw+7IB3H04BQguIzYBCuLo5Va4UKzHAvprN5Q7/avwkS4NOil0DACYC0zJntmZpbkht+M/Q5/zfEEf7cM+STlSkqJm30ht1sIKIHGjzzINe6dYuTlP8YHsasDYFk0WmAzL3hZ46GuJHprOr5wreg2j8dLEk0S9LHwU6y/M3a53QLojbxVzogPws88MkaDxpi4Z69JgnVN2XRr1ukzTX68Zv7xvBMeywAGx7EG01+QuOUUZGFikhAxiCytMxIXOAKcNdGqfXLYTcRaIzVnr5k/+vngSI5St8xb2yWP9Fr0OFyRq/SE5XKPEoIaSvWzymj1y2Eb9WH4ydNXIg/Km0P17uWO7+yzYO1C/ADwRygFAWuIiAVKX7dJx/8gxj1yC9AgpNi3z4WSWRLE0yEN2sPx+zFyAcWn6wy4rAwc8bFOYQmoSUFUk3vo2H2wWP9/OCKeGX4c5/QKUaiGBIHcUVjYRlXr+Q1lslWc0GQozs2gRZpZmRFQ== orson1985@Host-001.lan
```

---

## 🚀 Agora Conectar via SSH

Após adicionar a chave pública no Hostinger, você pode conectar:

```bash
ssh -i ~/.ssh/marcuscatia_hostinger seu-usuario@seu-dominio.com
```

Exemplo:
```bash
ssh -i ~/.ssh/marcuscatia_hostinger orson1985@catiacooking.com
```

---

## 🔧 Troubleshooting

### ❌ "Permission denied (publickey)"
- Verifique se a chave pública foi adicionada corretamente no Hostinger
- Confirme o nome de usuário correto
- Verifique se o arquivo de chave privada tem permissão 600:
```bash
chmod 600 ~/.ssh/marcuscatia_hostinger
```

### ❌ "Could not resolve hostname"
- Verifique o domínio está correto
- Verifique se tem internet

### ❌ "Connection refused"
- SSH pode estar desabilitado no Hostinger
- Contate o suporte Hostinger

---

## ✅ Checklist Final

- [ ] Chave pública adicionada no Hostinger SSH Keys
- [ ] Nome: `marcuscatia-deployment`
- [ ] Status: ✅ Active
- [ ] Arquivo privado em `~/.ssh/marcuscatia_hostinger`
- [ ] Permissão: `600`
- [ ] SSH conecta com sucesso

**Pronto! Agora você pode fazer deploy! 🚀**
