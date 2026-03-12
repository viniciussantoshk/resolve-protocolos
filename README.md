# Resolve Assist — Central de Protocolos Ezze Seguros

Sistema interno para envio de e-mails de protocolo de atendimento ao cliente, com controle de acesso por perfis, histórico de envios e configuração de SMTP.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Instalação e Teste Local (Windows 11)](#3-instalação-e-teste-local-windows-11)
4. [Configuração de E-mail SMTP](#4-configuração-de-e-mail-smtp)
5. [Perfis de Acesso e Usuários Padrão](#5-perfis-de-acesso-e-usuários-padrão)
6. [Deploy em Produção — Windows Server + IIS](#6-deploy-em-produção--windows-server--iis)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)
8. [Estrutura de Pastas](#8-estrutura-de-pastas)
9. [Comandos Úteis](#9-comandos-úteis)
10. [Segurança e Boas Práticas](#10-segurança-e-boas-práticas)
11. [Solução de Problemas](#11-solução-de-problemas)

---

## 1. Visão Geral

O Resolve Assist é uma aplicação web Node.js/Express que permite à equipe de atendimento da Ezze Seguros enviar e-mails padronizados de protocolo diretamente pelo navegador, sem precisar de cliente de e-mail.

**Funcionalidades:**
- Login com sessão segura (8 horas)
- Envio de e-mails via SMTP configurável (qualquer provedor)
- Templates de e-mail editáveis com variáveis dinâmicas
- Histórico de envios com exportação CSV
- Gerenciamento de usuários com três níveis de acesso
- Painel de configuração SMTP com teste de conexão
- Banco de dados local SQLite (sem dependências externas)

---

## 2. Pré-requisitos

### Para teste local (Windows 11) e produção (Windows Server)

| Software | Versão mínima | Download |
|----------|---------------|----------|
| **Node.js** (LTS) | 18.x ou superior | https://nodejs.org |
| **npm** | Incluído com Node.js | — |

> **Atenção:** Ao instalar o Node.js no Windows, marque a opção **"Add to PATH"** durante a instalação.

Para verificar se está instalado corretamente, abra o **Prompt de Comando** ou **PowerShell** e execute:

```cmd
node --version
npm --version
```

Ambos devem retornar o número de versão sem erros.

---

## 3. Instalação e Teste Local (Windows 11)

### Passo 1 — Extrair o projeto

Extraia o arquivo ZIP em uma pasta de sua escolha. Exemplo:

```
C:\resolve-assist\
```

### Passo 2 — Abrir o terminal na pasta do projeto

No Windows Explorer, navegue até a pasta `resolve-assist-server` dentro do ZIP extraído, clique com o botão direito e escolha **"Abrir no Terminal"** (ou **"Abrir janela do PowerShell aqui"**).

### Passo 3 — Instalar as dependências

```cmd
npm install
```

Aguarde o npm baixar todos os pacotes. Isso criará a pasta `node_modules`.

> Se aparecer um erro sobre `better-sqlite3` ou compilação nativa, instale as ferramentas de build:
> ```cmd
> npm install --global --production windows-build-tools
> ```
> Ou instale o **Visual Studio Build Tools** em https://visualstudio.microsoft.com/downloads/

### Passo 4 — Criar o arquivo de configuração

Copie o arquivo `.env.example` e renomeie para `.env`:

```cmd
copy .env.example .env
```

Edite o `.env` com o Bloco de Notas ou VS Code. Para testes locais, as configurações padrão já funcionam — só troque o `SESSION_SECRET`.

### Passo 5 — Inicializar o banco de dados

```cmd
npm run setup
```

Isso cria o banco de dados SQLite e os três usuários padrão.

### Passo 6 — Iniciar o servidor

```cmd
npm start
```

Você verá a mensagem:
```
✅ Resolve Assist rodando em http://0.0.0.0:3000
   Ambiente: DESENVOLVIMENTO
```

### Passo 7 — Acessar no navegador

Abra o navegador e acesse:

```
http://localhost:3000
```

Faça login com um dos usuários padrão listados na seção 5.

---

## 4. Configuração de E-mail SMTP

Esta é a etapa mais importante para que o envio de e-mails funcione. Após fazer login como **Administrador**, acesse **Configurações → SMTP**.

### Provedores mais comuns

#### Gmail (recomendado para testes)

> **Importante:** O Gmail exige uma **Senha de App** específica, não a sua senha normal.
>
> Para gerar uma Senha de App:
> 1. Acesse https://myaccount.google.com
> 2. Vá em **Segurança → Verificação em duas etapas** (ative se não estiver ativa)
> 3. Em Segurança, procure **"Senhas de app"**
> 4. Crie uma nova senha para o app "E-mail" / "Windows"
> 5. Copie a senha gerada (16 caracteres) — use ela no campo Senha do SMTP

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `smtp.gmail.com` |
| Porta | `587` |
| Segurança | `STARTTLS` |
| Usuário | `seu.email@gmail.com` |
| Senha | Senha de App gerada (não a senha normal) |
| Nome do Remetente | `Ezze Seguros - Atendimento` |

#### Outlook / Microsoft 365

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `smtp.office365.com` |
| Porta | `587` |
| Segurança | `STARTTLS` |
| Usuário | `seu.email@suaempresa.com.br` |
| Senha | Senha da conta (ou Senha de App se MFA ativo) |

#### SendGrid (recomendado para produção)

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `smtp.sendgrid.net` |
| Porta | `587` |
| Segurança | `STARTTLS` |
| Usuário | `apikey` (literal, essa palavra) |
| Senha | Sua API Key do SendGrid |

#### Amazon SES

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `email-smtp.us-east-1.amazonaws.com` (ajuste a região) |
| Porta | `587` |
| Segurança | `STARTTLS` |
| Usuário | Chave de acesso SMTP do SES |
| Senha | Senha SMTP do SES |

### Testando a configuração

Após preencher os dados, clique em **"Testar Conexão"** dentro do painel SMTP. O sistema tentará se conectar ao servidor e exibirá sucesso ou a mensagem de erro detalhada.

---

## 5. Perfis de Acesso e Usuários Padrão

### Usuários criados automaticamente

| Login | Senha padrão | Perfil |
|-------|-------------|--------|
| `admin` | `Admin@2025!` | Administrador |
| `supervisor` | `Super@2025!` | Supervisor |
| `agente` | `Agente@2025!` | Agente |

> ⚠️ **Troque todas as senhas padrão imediatamente após o primeiro acesso!**

### Permissões por perfil

| Módulo | Administrador | Supervisor | Agente |
|--------|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Enviar E-mail | ✅ | ✅ | ✅ |
| Histórico (todos) | ✅ | ✅ | ❌ |
| Histórico (próprio) | ✅ | ✅ | ✅ |
| Exportar CSV | ✅ | ✅ | ❌ |
| Modelos de E-mail | ✅ | ❌ | ❌ |
| Usuários | ✅ | ✅* | ❌ |
| Configurações SMTP | ✅ | ❌ | ❌ |
| Integrações | ✅ | ❌ | ❌ |

*Supervisor pode criar e gerenciar apenas usuários do perfil **Agente**.

---

## 6. Deploy em Produção — Windows Server + IIS

### Visão geral da arquitetura

```
Internet → IIS (porta 80/443) → Proxy Reverso → Node.js (porta 3000)
```

O IIS funciona como proxy reverso: recebe as requisições HTTP/HTTPS e as repassa para o Node.js rodando localmente.

---

### Passo 1 — Instalar Node.js no Windows Server

Baixe o instalador LTS em https://nodejs.org e instale normalmente, marcando **"Add to PATH"**.

---

### Passo 2 — Instalar o IIS com ARR e URL Rewrite

1. Abra o **Server Manager → Manage → Add Roles and Features**
2. Instale o papel **Web Server (IIS)**
3. Baixe e instale os módulos adicionais:
   - **URL Rewrite Module 2.1:** https://www.iis.net/downloads/microsoft/url-rewrite
   - **Application Request Routing (ARR) 3.0:** https://www.iis.net/downloads/microsoft/application-request-routing

4. No IIS Manager, clique no **servidor** (nó raiz) → **Application Request Routing Cache** → **Server Proxy Settings** → habilite **"Enable proxy"** → Apply.

---

### Passo 3 — Copiar o projeto para o servidor

Copie a pasta `resolve-assist-server` para o servidor. Exemplo:

```
C:\inetpub\resolve-assist\
```

No PowerShell dentro dessa pasta, instale as dependências:

```cmd
npm install --production
```

---

### Passo 4 — Configurar o arquivo .env para produção

Crie o arquivo `.env` (copie de `.env.example`) com os seguintes ajustes obrigatórios:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=GERE_UMA_CHAVE_LONGA_ALEATORIA_AQUI
ALLOWED_ORIGINS=https://seudominio.com.br
DB_PATH=C:\inetpub\resolve-assist\data\resolve-assist.db
```

Para gerar um SESSION_SECRET seguro, execute no PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Passo 5 — Instalar o PM2 (gerenciador de processos)

O PM2 mantém o Node.js rodando em segundo plano, reinicia automaticamente em caso de falha e inicia junto com o Windows.

```cmd
npm install -g pm2
npm install -g pm2-windows-startup
```

Inicie a aplicação com PM2:

```cmd
cd C:\inetpub\resolve-assist
pm2 start src/server.js --name resolve-assist
pm2 save
pm2-startup install
```

Para verificar se está rodando:
```cmd
pm2 status
pm2 logs resolve-assist
```

---

### Passo 6 — Configurar o Site no IIS

1. No **IIS Manager**, expanda o servidor → clique em **Sites** → **Add Website**:
   - **Site name:** `resolve-assist`
   - **Physical path:** `C:\inetpub\resolve-assist\public`
   - **Binding:** HTTP, porta 80, hostname: `seudominio.com.br`

2. Dentro do site criado, clique em **URL Rewrite** → **Add Rule(s)** → **Reverse Proxy**:
   - **Inbound rule:** `localhost:3000`
   - Clique em OK

Alternativamente, crie o arquivo `web.config` manualmente na pasta `C:\inetpub\resolve-assist\public\`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ResolveAssist" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

### Passo 7 — Configurar HTTPS (SSL)

**Opção A — Certificado gratuito com Win-ACME (Let's Encrypt):**

```powershell
# Baixe o win-acme em https://www.win-acme.com/
wacs.exe --target iis --siteid <ID_DO_SITE> --installation iis
```

**Opção B — Certificado corporativo:**
1. No IIS Manager, clique no site → **Bindings** → **Add**
2. Tipo: `https`, porta `443`, selecione o certificado instalado

Após configurar HTTPS, atualize o `.env`:
```env
ALLOWED_ORIGINS=https://seudominio.com.br
```

E reinicie o PM2:
```cmd
pm2 restart resolve-assist
```

---

### Passo 8 — Permissões de pasta

Garanta que a conta do IIS (`IIS_IUSRS` ou `IUSR`) e o usuário que roda o Node.js tenham permissão de **escrita** na pasta `data\` e `logs\`:

```powershell
icacls "C:\inetpub\resolve-assist\data" /grant "IIS_IUSRS:(OI)(CI)F"
icacls "C:\inetpub\resolve-assist\logs" /grant "IIS_IUSRS:(OI)(CI)F"
```

---

### Passo 9 — Inicializar o banco de dados

```cmd
cd C:\inetpub\resolve-assist
node scripts/setup-db.js
```

---

### Verificação final

Acesse `https://seudominio.com.br` no navegador. O sistema deve carregar a tela de login.

Para verificar os logs em tempo real:
```cmd
pm2 logs resolve-assist
```

---

## 7. Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme o ambiente:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor Node.js | `3000` |
| `HOST` | IP de escuta | `0.0.0.0` |
| `NODE_ENV` | Ambiente (`development` \| `production`) | `development` |
| `SESSION_SECRET` | Chave secreta para sessões — **troque em produção!** | Gerado aleatório |
| `DB_PATH` | Caminho do arquivo SQLite | `./data/resolve-assist.db` |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Nível de log (`error`, `warn`, `info`, `debug`) | `info` |

---

## 8. Estrutura de Pastas

```
resolve-assist-server/
├── .env.example          # Modelo de configuração — copie para .env
├── package.json
├── README.md
│
├── config/
│   ├── app.js            # Configurações da aplicação (lê .env)
│   └── logger.js         # Configuração do Winston (logs)
│
├── data/                 # Criado automaticamente — banco de dados SQLite
│   └── resolve-assist.db
│
├── logs/                 # Criado automaticamente — arquivos de log
│   ├── app.log
│   └── error.log
│
├── public/               # Frontend estático servido pelo Express
│   ├── index.html        # SPA completa (HTML + CSS + JS em um arquivo)
│   └── assets/
│       ├── logo-ezze.jpeg
│       └── logo-resolve.png
│
├── scripts/
│   ├── setup-db.js       # Inicializa banco e cria usuários padrão
│   └── create-admin.js   # Cria ou reseta um administrador
│
└── src/
    ├── server.js          # Ponto de entrada — Express + middlewares
    ├── middleware/
    │   └── auth.js        # requireAuth, requireRole
    ├── models/
    │   └── database.js    # Schema SQLite + seed inicial
    └── routes/
        ├── auth.js        # Login, logout, sessão atual
        ├── emails.js      # Envio de e-mails via SMTP
        ├── logs.js        # Histórico e exportação CSV
        ├── smtp.js        # Configuração e teste SMTP
        ├── templates.js   # CRUD de modelos de e-mail
        └── users.js       # CRUD de usuários
```

---

## 9. Comandos Úteis

### Desenvolvimento

```cmd
# Instalar dependências
npm install

# Inicializar banco de dados
npm run setup

# Iniciar em modo desenvolvimento (reinicia automaticamente ao salvar)
npm run dev

# Iniciar em modo produção
npm start

# Criar/resetar um administrador via terminal
npm run create-admin
```

### PM2 (produção)

```cmd
# Ver status dos processos
pm2 status

# Ver logs em tempo real
pm2 logs resolve-assist

# Reiniciar aplicação
pm2 restart resolve-assist

# Parar aplicação
pm2 stop resolve-assist

# Iniciar após parar
pm2 start resolve-assist

# Recarregar sem downtime
pm2 reload resolve-assist
```

---

## 10. Segurança e Boas Práticas

- **Troque as senhas padrão** dos três usuários (`admin`, `supervisor`, `agente`) no primeiro acesso
- **Gere um SESSION_SECRET único** para cada instalação (veja o comando na seção 6, Passo 4)
- **Ative HTTPS** antes de disponibilizar para usuários — cookies de sessão são marcados como `secure` em produção
- **Restrinja o acesso de rede** ao Node.js na porta 3000 pelo firewall do Windows — apenas o IIS (localhost) deve conseguir acessá-la
- **Faça backup periódico** do arquivo `data/resolve-assist.db` — ele contém todos os dados do sistema
- **Monitore os logs** em `logs/app.log` e `logs/error.log` regularmente

---

## 11. Solução de Problemas

### Erro: `cannot find module 'better-sqlite3'`

O módulo `better-sqlite3` precisa ser compilado nativamente. Instale as ferramentas de build:

```cmd
npm install --global windows-build-tools
# ou instale o Visual Studio Build Tools
```

Depois reinstale:
```cmd
npm install
```

### Erro ao iniciar: `EADDRINUSE: address already in use :::3000`

Outra aplicação está usando a porta 3000. Troque a porta no `.env`:
```env
PORT=3001
```
E atualize o `web.config` do IIS para apontar para a nova porta.

### E-mail não está sendo enviado

1. Acesse **Configurações → SMTP** e clique em **"Testar Conexão"**
2. Verifique se o servidor SMTP e a porta estão corretos
3. Para Gmail: confirme que está usando uma **Senha de App** (não a senha normal)
4. Verifique se o firewall do servidor bloqueia saída pela porta 587
5. Consulte `logs/error.log` para a mensagem de erro detalhada

### Não consigo acessar pelo IIS (erro 502 Bad Gateway)

1. Confirme que o Node.js está rodando: `pm2 status`
2. Confirme que o ARR está habilitado no IIS (Server Proxy Settings → Enable proxy)
3. Verifique o `web.config` na pasta public
4. Verifique os logs do IIS em `C:\inetpub\logs\`

### Tela de login fica em loop / sessão não persiste

Em produção (`NODE_ENV=production`), os cookies exigem HTTPS. Se estiver testando sem SSL, use `NODE_ENV=development` no `.env`.

### Banco de dados corrompido ou preciso resetar tudo

```cmd
# Pare o servidor
pm2 stop resolve-assist

# Delete o banco
del data\resolve-assist.db
del data\sessions.db

# Recrie
npm run setup

# Inicie novamente
pm2 start resolve-assist
```

---

*Resolve Assist v1.0 — Ezze Seguros © 2025*
