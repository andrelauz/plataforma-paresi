# 🌿 Paresi Platform

Plataforma completa de gestão socioambiental com scorecards, formulários de coleta de dados e dashboard analítico.

**Desenvolvido por:** Andre Lauz  
**Email:** talktome@andrelauz.com  
**Versão:** 1.0.0  
**URL:** http://plataforma.paresi.social

---

## 📋 Sobre o Projeto

A Paresi Platform é uma solução completa para gestão de ações socioambientais, permitindo:

- ✅ Criação e gerenciamento de ações ESG
- ✅ Scorecards detalhados por dimensão (Ambiental/Social)
- ✅ Formulários públicos para coleta de dados individuais
- ✅ Coleta interna de dados por gestores
- ✅ Dashboards com indicadores e KPIs
- ✅ Geração de relatórios e gráficos
- ✅ Sistema de evidências (upload de arquivos)
- ✅ Notificações e lembretes

---

## 🏗️ Tecnologias

### Backend
- Node.js 18+
- Express.js
- MySQL/MariaDB 11.7.2+
- JWT Authentication
- Multer (upload de arquivos)

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Recharts (gráficos)

### Infraestrutura
- Nginx
- PM2
- Let's Encrypt (SSL)

---

## 📦 Estrutura do Projeto

```
paresi-platform/
├── backend/              # API Node.js
│   ├── src/
│   │   ├── config/       # Configurações
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── middleware/   # Middlewares
│   │   ├── routes/       # Rotas da API
│   │   ├── models/       # Queries SQL
│   │   └── server.js     # Servidor principal
│   ├── .env.example
│   └── package.json
├── frontend/             # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── services/     # API calls
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── database/
│   └── database.sql      # Schema do banco
├── docs/
│   └── INSTALACAO.md     # Guia completo de instalação
└── README.md
```

---

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+
- MariaDB 11.7.2+ ou MySQL 8+
- Nginx
- Domínio configurado

### 1. Clone o repositório

```bash
git clone https://github.com/andrelauz/paresi-platform.git
cd paresi-platform
```

### 2. Configure o banco de dados

```bash
# Conectar ao MariaDB
mysql -u root -p

# Criar banco e usuário
CREATE DATABASE paresi_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paresi_app'@'localhost' IDENTIFIED BY 'SUA_SENHA_AQUI';
GRANT SELECT, INSERT, UPDATE, DELETE ON paresi_platform.* TO 'paresi_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar schema
mysql -u paresi_app -p paresi_platform < database/database.sql
```

### 3. Configure o Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# Iniciar backend
npm start
```

### 4. Configure o Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# Build de produção
npm run build
```

### 5. Configure o Nginx

Veja instruções completas em `docs/INSTALACAO.md`

---

## 🔑 Credenciais Padrão

**⚠️ ALTERE IMEDIATAMENTE EM PRODUÇÃO**

- **Email:** admin@empresademo.com.br
- **Senha:** admin123

---

## 📚 Documentação

### Guias Completos

- [📖 Guia de Instalação Completo](docs/INSTALACAO.md)
- [🔧 Configuração do Servidor](docs/SERVIDOR.md)
- [📊 API Reference](docs/API.md)
- [🎨 Componentes Frontend](docs/FRONTEND.md)

### Funcionalidades

#### 1. Gestão de Ações
Crie e gerencie ações socioambientais com:
- Dados básicos (nome, objetivo, investimento)
- Seleção de módulos (Água, Energia, Resíduos, Diversidade, etc.)
- Configuração de perguntas personalizadas
- Configuração de coleta de dados (individual ou interna)

#### 2. Scorecards
Visualize performance com:
- Score geral (0-100)
- Breakdown por dimensão (Ambiental, Social, Conformidade)
- Gráfico radial de performance
- KPIs principais por módulo

#### 3. Coleta de Dados
Duas formas de coleta:
- **Formulários Individuais:** Links públicos para beneficiários
- **Coleta Interna:** Preenchimento por gestores

#### 4. Formulários Públicos
- Paginação automática
- Salvamento de rascunhos
- Edição após envio (opcional)
- Respostas anônimas (opcional)
- Progress bar

#### 5. Dashboard
- Visão geral de todas ações
- Métricas consolidadas
- Scores médios
- Investimento total

---

## 🔧 Scripts Disponíveis

### Backend

```bash
npm start       # Iniciar servidor (produção)
npm run dev     # Iniciar com nodemon (desenvolvimento)
npm test        # Executar testes
```

### Frontend

```bash
npm run dev     # Servidor de desenvolvimento
npm run build   # Build de produção
npm run preview # Preview do build
```

---

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuário atual

### Ações
- `GET /api/actions` - Listar ações
- `POST /api/actions` - Criar ação
- `GET /api/actions/:id` - Detalhes da ação
- `PUT /api/actions/:id` - Atualizar ação
- `DELETE /api/actions/:id` - Deletar ação

### Formulários
- `GET /api/forms/:token` - Obter formulário público
- `POST /api/forms/:token/submit` - Enviar resposta
- `PUT /api/forms/:token/draft` - Salvar rascunho

### Dados
- `GET /api/data/:actionId/:moduleId` - Obter dados
- `POST /api/data/:actionId/:moduleId` - Salvar dados
- `GET /api/data/:actionId/responses` - Listar respostas

Documentação completa: [API Reference](docs/API.md)

---

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Bcrypt para senhas
- ✅ Helmet.js (headers de segurança)
- ✅ Rate limiting
- ✅ CORS configurável
- ✅ Validação de inputs
- ✅ SQL injection protection
- ✅ XSS protection

---

## 📊 Módulos Disponíveis

### Ambientais
- 💧 Água (7 perguntas)
- ⚡ Energia e Emissões (19 perguntas)
- ♻️ Resíduos (10 perguntas)
- 🌿 Biodiversidade (4 perguntas)
- 🏭 Poluentes (5 perguntas)
- 📋 Conformidade (11 perguntas)

### Sociais
- 👥 Dados Sociodemográficos (17 perguntas)
- 💰 Salário Digno (9 perguntas)
- 🌈 Diversidade (24 perguntas)
- 🧠 Saúde Mental (18 perguntas)
- 🤝 Envolvimento Comunitário (11 perguntas)

**Total:** 135+ perguntas baseadas em GRI e ODS

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
pm2 logs paresi-api
pm2 restart paresi-api
```

### Erro de conexão com banco
```bash
mysql -u paresi_app -p -h localhost paresi_platform
```

### Nginx erro 502
```bash
sudo nginx -t
sudo systemctl status nginx
pm2 status
```

Mais soluções: [docs/INSTALACAO.md#troubleshooting](docs/INSTALACAO.md)

---

## 📈 Roadmap

- [ ] Dashboard de analytics avançado
- [ ] Exportação de relatórios PDF
- [ ] Integração com APIs externas (GRI, ODS)
- [ ] App mobile (React Native)
- [ ] Modo offline
- [ ] Inteligência artificial para recomendações
- [ ] Marketplace de ações

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

**Andre Lauz**
- 📧 Email: talktome@andrelauz.com
- 🌐 Website: https://andrelauz.com
- 💼 LinkedIn: [/in/andrelauz](https://linkedin.com/in/andrelauz)
- 🐙 GitHub: [@andrelauz](https://github.com/andrelauz)

---

## 🙏 Agradecimentos

- Comunidade Open Source
- GRI (Global Reporting Initiative)
- ONU (Objetivos de Desenvolvimento Sustentável)

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**

---

Made with ❤️ by Andre Lauz
