# SSH Keys & Database Setup Guide

## 🔐 SSH Public Key

Adicione esta chave pública no Hostinger Dashboard:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCaToo95y8weUWfTbqKKmtBrJpT52txRwybcGQzWC16Vg9bRVkE1Y8sb6A/6+yM5tViz/MpZ7vw0daQoKf3BafWs5Vcthr5AItuqjqXlnO4MNb87jYMlBE2wrwJoOpmjRC5slK9tYQGoVEnTnJZ6HwOnk4rLew2S3CQyuMOTSM4YW9PXQX7WONWtFx+PJw+7IB3H04BQguIzYBCuLo5Va4UKzHAvprN5Q7/avwkS4NOil0DACYC0zJntmZpbkht+M/Q5/zfEEf7cM+STlSkqJm30ht1sIKIHGjzzINe6dYuTlP8YHsasDYFk0WmAzL3hZ46GuJHprOr5wreg2j8dLEk0S9LHwU6y/M3a53QLojbxVzogPws88MkaDxpi4Z69JgnVN2XRr1ukzTX68Zv7xvBMeywAGx7EG01+QuOUUZGFikhAxiCytMxIXOAKcNdGqfXLYTcRaIzVnr5k/+vngSI5St8xb2yWP9Fr0OFyRq/SE5XKPEoIaSvWzymj1y2Eb9WH4ydNXIg/Km0P17uWO7+yzYO1C/ADwRygFAWuIiAVKX7dJx/8gxj1yC9AgpNi3z4WSWRLE0yEN2sPx+zFyAcWn6wy4rAwc8bFOYQmoSUFUk3vo2H2wWP9/OCKeGX4c5/QKUaiGBIHcUVjYRlXr+Q1lslWc0GQozs2gRZpZmRFQ== orson1985@Host-001.lan
```

### Passos para adicionar SSH Key no Hostinger:

1. **Acesse o Hostinger Dashboard**
   - Hosting → Manage → SSH Keys

2. **Clique em "Add SSH Key"**

3. **Cole a chave pública acima**

4. **Dê um nome descritivo**
   - Nome: `marcuscatia-deployment`

5. **Salve e confirme**

---

## 🗄️ Database Configuration

### MySQL Database Details:

```
Database Name: catia_cooking_db
Username: catia_admin
Host: localhost
Port: 3306
```

### Environment Variables para .env.production.local:

```env
# Database
DATABASE_URL="mysql://catia_admin:YOUR_PASSWORD@localhost:3306/catia_cooking_db"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="catia_cooking_db"
DB_USER="catia_admin"
DB_PASSWORD="YOUR_PASSWORD"

# App
APP_URL="https://seu-dominio.com"
NODE_ENV="production"
GEMINI_API_KEY=""
```

---

## 📝 Database Schema

### Tabelas necesárias:

#### 1. `courses`
```sql
CREATE TABLE courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  price DECIMAL(10, 2),
  maxCapacity INT,
  duration VARCHAR(100),
  image VARCHAR(500),
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `reservations`
```sql
CREATE TABLE reservations (
  id VARCHAR(255) PRIMARY KEY,
  studentName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  courseId VARCHAR(255),
  courseTitle VARCHAR(255),
  date DATE,
  time VARCHAR(100),
  guests INT,
  totalPrice DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(50),
  paymentStatus VARCHAR(50),
  notes TEXT,
  dietaryRestrictions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

#### 3. `messages`
```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `blockedDates`
```sql
CREATE TABLE blockedDates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE UNIQUE,
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Deployment Steps

### 1. SSH Connection
```bash
ssh -i ~/.ssh/marcuscatia_hostinger seu-usuario@seu-dominio.com
```

### 2. Clone Repository
```bash
git clone https://github.com/oronlopescv-sudo/marcuscatia.git
cd marcuscatia
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create Database
```bash
# No Hostinger, use phpMyAdmin ou linha de comando:
mysql -u root -p -e "CREATE DATABASE catia_cooking_db;"
mysql -u root -p catia_cooking_db < database-schema.sql
```

### 5. Configure Environment
```bash
# Create .env.production.local
echo 'DATABASE_URL="mysql://catia_admin:password@localhost:3306/catia_cooking_db"' > .env.production.local
echo 'APP_URL="https://seu-dominio.com"' >> .env.production.local
```

### 6. Build and Start
```bash
npm run build
npm start
```

---

## 📚 Resources

- [Hostinger SSH Documentation](https://support.hostinger.com/en/articles/4960286)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## ✅ Checklist

- [ ] SSH Key adicionada no Hostinger
- [ ] Database criada e configurada
- [ ] .env.production.local com credenciais corretas
- [ ] npm install concluído
- [ ] npm run build sem erros
- [ ] npm start funcionando
- [ ] Website acessível via domínio
- [ ] Admin dashboard funcionando
- [ ] Reservas sendo salvas no banco de dados
