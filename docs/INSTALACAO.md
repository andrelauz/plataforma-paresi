# 🌿 PARESI PLATFORM - Guia de Instalação Completo

## 📋 Pré-requisitos

- **Servidor**: Linux (Ubuntu 20.04+ ou similar)
- **Node.js**: v18+ (LTS recomendado)
- **MariaDB**: 11.7.2+ ou MySQL 8+
- **npm**: v9+
- **Domínio**: http://plataforma.paresi.social/

---

## 📦 Estrutura de Arquivos do Projeto

```
paresi-platform/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── actionController.js
│   │   │   ├── formController.js
│   │   │   └── dataController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── actions.js
│   │   │   ├── forms.js
│   │   │   └── data.js
│   │   ├── models/
│   │   │   └── queries.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── ecosystem.config.js     # PM2 config
├── frontend/                   # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── database/
│   └── database.sql
├── uploads/                    # Diretório de uploads
└── README.md
```

---

## 🚀 PASSO 1: Configurar Banco de Dados

### 1.1. Conectar ao MariaDB

```bash
mysql -u root -p
```

### 1.2. Criar Banco e Usuário

```sql
-- Criar banco de dados
CREATE DATABASE paresi_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário para aplicação
CREATE USER 'paresi_app'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';

-- Conceder permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON paresi_platform.* TO 'paresi_app'@'localhost';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

### 1.3. Importar Schema

```bash
cd /caminho/para/projeto
mysql -u paresi_app -p paresi_platform < database/database.sql
```

### 1.4. Verificar Instalação

```bash
mysql -u paresi_app -p paresi_platform
```

```sql
SHOW TABLES;
SELECT * FROM companies;
EXIT;
```

---

## 🔧 PASSO 2: Configurar Backend

### 2.1. Instalar Node.js (se necessário)

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2.2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo de configuração
cp .env.example .env

# Editar configurações
nano .env
```

### 2.3. Configurar .env do Backend

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=paresi_app
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=paresi_platform

# JWT
JWT_SECRET=GERAR_STRING_ALEATORIA_SEGURA_AQUI_64_CHARS
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://plataforma.paresi.social
BACKEND_URL=http://plataforma.paresi.social/api

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (opcional - para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

### 2.4. Gerar JWT Secret

```bash
# Gerar string aleatória segura
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.5. Testar Backend

```bash
# Modo desenvolvimento
npm run dev

# Ou modo produção
npm start
```

Acesse: `http://localhost:5000/api/health`

---

## 🎨 PASSO 3: Configurar Frontend

### 3.1. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo de configuração
cp .env.example .env

# Editar configurações
nano .env
```

### 3.2. Configurar .env do Frontend

```env
VITE_API_URL=http://plataforma.paresi.social/api
VITE_APP_NAME=Paresi Platform
```

### 3.3. Build de Produção

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos estáticos.

---

## 🌐 PASSO 4: Configurar Nginx

### 4.1. Instalar Nginx (se necessário)

```bash
sudo apt update
sudo apt install nginx
```

### 4.2. Criar Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/paresi
```

### 4.3. Configuração Nginx

```nginx
server {
    listen 80;
    server_name plataforma.paresi.social;

    # Frontend
    root /caminho/para/paresi-platform/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Uploads
    location /uploads {
        alias /caminho/para/paresi-platform/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/paresi_access.log;
    error_log /var/log/nginx/paresi_error.log;
}
```

### 4.4. Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/paresi /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔄 PASSO 5: Configurar PM2 (Process Manager)

### 5.1. Instalar PM2

```bash
sudo npm install -g pm2
```

### 5.2. Configurar Ecosystem

```bash
cd /caminho/para/paresi-platform/backend
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'paresi-api',
    script: './src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 5.3. Iniciar Aplicação

```bash
# Iniciar
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs

# Configurar auto-start
pm2 startup
pm2 save
```

---

## 🔒 PASSO 6: Configurar SSL (HTTPS)

### 6.1. Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 6.2. Obter Certificado

```bash
sudo certbot --nginx -d plataforma.paresi.social
```

### 6.3. Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Cron já está configurado automaticamente
```

---

## 📁 PASSO 7: Permissões e Diretórios

### 7.1. Criar Diretórios Necessários

```bash
cd /caminho/para/paresi-platform

# Criar diretório de uploads
mkdir -p uploads/evidences
mkdir -p backend/logs

# Configurar permissões
chmod 755 uploads
chmod 755 uploads/evidences
chmod 755 backend/logs
```

### 7.2. Configurar Propriedade

```bash
# Ajustar proprietário (substitua 'www-data' se necessário)
sudo chown -R www-data:www-data uploads
sudo chown -R www-data:www-data backend/logs
```

---

## ✅ PASSO 8: Verificação Final

### 8.1. Checklist

- [ ] Banco de dados criado e tabelas importadas
- [ ] Backend rodando (PM2)
- [ ] Frontend buildado
- [ ] Nginx configurado e rodando
- [ ] SSL configurado (HTTPS)
- [ ] Diretórios de upload criados
- [ ] Permissões configuradas

### 8.2. Testar Funcionalidades

1. **Acesse**: `https://plataforma.paresi.social`
2. **Login**: 
   - Email: `admin@empresademo.com.br`
   - Senha: `admin123`
3. **Teste**:
   - Criar nova ação
   - Configurar módulos
   - Gerar link de formulário
   - Testar preview
   - Upload de evidência

---

## 🔧 Manutenção

### Logs

```bash
# Backend
pm2 logs paresi-api

# Nginx
sudo tail -f /var/log/nginx/paresi_error.log
sudo tail -f /var/log/nginx/paresi_access.log

# MariaDB
sudo tail -f /var/log/mysql/error.log
```

### Backup do Banco

```bash
# Backup
mysqldump -u paresi_app -p paresi_platform > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u paresi_app -p paresi_platform < backup_20250101.sql
```

### Atualizar Aplicação

```bash
# Pull novo código
git pull origin main

# Backend
cd backend
npm install
pm2 restart paresi-api

# Frontend
cd ../frontend
npm install
npm run build
```

---

## 🆘 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
pm2 logs paresi-api

# Verificar portas
sudo netstat -tulpn | grep :5000

# Reiniciar
pm2 restart paresi-api
```

### Erro de conexão com banco

```bash
# Testar conexão
mysql -u paresi_app -p -h localhost paresi_platform

# Verificar permissões
SHOW GRANTS FOR 'paresi_app'@'localhost';
```

### Nginx erro 502

```bash
# Verificar se backend está rodando
pm2 status

# Verificar configuração Nginx
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### Upload não funciona

```bash
# Verificar permissões
ls -la /caminho/para/paresi-platform/uploads

# Corrigir permissões
sudo chown -R www-data:www-data uploads
chmod 755 uploads
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs
2. Consulte este guia
3. Entre em contato com o suporte técnico

---

## 🎉 Conclusão

Seu sistema Paresi Platform está instalado e funcionando!

Acesse: **https://plataforma.paresi.social**

Login padrão:
- **Email**: admin@empresademo.com.br
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha padrão imediatamente após o primeiro login!
