# Know Your Fan API

API desenvolvida em FastAPI para coletar e gerenciar dados de fãs de e-sports.

## Como rodar o projeto

1. Crie e ative o ambiente virtual:
   - `python -m venv venv`
   - Ative com `.\venv\Scripts\activate` (Windows) ou `source venv/bin/activate` (Linux/Mac)
2. Instale as dependências:
   - `pip install -r requirements.txt`
3. Rode a API:
   - `uvicorn app.main:app --reload`
4. Acesse em [http://localhost:8000](http://localhost:8000)

## Estrutura do projeto

- `app/` - Código fonte da API
- `requirements.txt` - Dependências
- `.gitignore` - Arquivos ignorados pelo Git