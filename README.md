# CientSurvey

Um sistema de formulário de cadastro de usuário e análise de perfil para mapeamento de consumo/consumidor

## 🚀 Como rodar localmente

Essas instruções permitirão que você obtenha uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

### 📋 Pré-requisitos

1. Python 3.10+
2. Node.js (versão 18+)
3. npm (geralmente já incluso no Node.js)
4. (Opcional) Poetry ou pipenv para gerenciamento de dependências Python

🗄️ Banco de Dados (PostgreSQL)

1. Instale o PostgreSQL
Download para Windows, Mac e Linux:

https://www.postgresql.org/download/

2. Crie um banco de dados para o projeto (nome fan_db)
Após instalar, acesse o terminal do PostgreSQL (psql) e execute:

CREATE DATABASE fan_db;
CREATE USER chatsurvey_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE fan_db TO chatsurvey_user;

3. Crie a tabela admin
No terminal do PostgreSQL, conecte-se ao banco e execute:

CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

4. Crie o admin padrão:

INSERT INTO admin (username, password) VALUES ('teste', '1234');

### 🔧 Instalação

1. Clone o repositório:

git clone https://github.com/seu-usuario/chatSurvey.git
cd chatSurvey

2. Back-End (FastAPI)

No terminal, navegue até a pasta do back-end:

cd backend
python -m venv venv
source venv/bin/activate  # ou .\venv\Scripts\activate no Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

http://localhost:8000/docs

3. Front-end (Next.js)

Abra outro terminal, navegue até a pasta do front-end:

cd frontend
npm install
npm run dev

## 🖥️ Como usar

1. Inicie o back-end conforme acima.
2. Inicie o front-end conforme acima.
3. Acesse http://localhost:3000 no navegador.
4. O front-end irá se comunicar com a API do back-end automaticamente.

### ⚠️ Observações

Sistema simples, moderno e construído com tecnologias atuais e relevantes no mercado de tecnologia. A arquitetura desacoplada permite que ele possa ser desenvolvido e melhorado continuamente, conforme a necessidade do negócio.

*Esse objeto cont~em erros, e esté sendo entregue mediante o prazo previsto no processo de seleção, porém poderá ser melhor otimizado após a entrega.

*A validação ocorre somente por meio de uma identidade valida.

*O login padrão para o admin é: user: teste pw: 1234

🎁 Expressões de gratidão
Agradeço muito pela participação nesse processo seletivo, e tenho grande interesse em ingressar no time FURIA!


