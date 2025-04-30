from pydantic import BaseModel, Field
from typing import List
from datetime import date, datetime

from sqlalchemy import Column, Integer, String, Date, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cpf = Column(String, nullable=False, unique=True)
    nascimento = Column(Date, nullable=False)
    nacionalidade = Column(String, nullable=False)
    estado_civil = Column(String, nullable=False)
    nome_pai = Column(String, nullable=False)
    nome_mae = Column(String, nullable=False)
    endereco = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    interesses = Column(Text, nullable=False)
    compras_eventos = Column(String, nullable=False)
    redes_sociais = Column(Text, nullable=True)
    perfis_esports = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True, nullable=False)
    pw_hash = Column(String, nullable=False)

class UsuarioBase(BaseModel):
    nome: str
    cpf: str
    nascimento: date
    nacionalidade: str
    estado_civil: str
    nome_pai: str
    nome_mae: str
    endereco: str
    telefone: str
    interesses: List[str] = Field(..., example=["futebol", "jogos", "música"])
    compras_eventos: str
    redes_sociais: List[str] = []
    perfis_esports: List[str] = []

    class Config:
        orm_mode = True

class UsuarioOut(UsuarioBase):
    created_at: datetime

    class Config:
        orm_mode = True

class AdminBase(BaseModel):
    id: int
    login: str

    class Config:
        orm_mode = True