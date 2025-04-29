from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class UsuarioBase(BaseModel):
    nome: str
    cpf: str
    nascimento: date
    nacionalidade: str
    estado_civil: str
    nome_pai: str
    nome_mae: str
    endereco: str
    interesses: List[str] = Field(..., example=["futebol", "jogos", "música"])
    compras_eventos: str
    redes_sociais: List[str] = []
    perfis_esports: List[str] = []