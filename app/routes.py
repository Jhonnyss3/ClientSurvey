from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from .models import UsuarioBase

router = APIRouter()

# Função para tratar e validar a data de nascimento
def parse_date(data_str):
    from datetime import datetime
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(data_str, fmt).date()
        except ValueError:
            continue
    raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD ou DD/MM/YYYY.")

# Função para validar CPF (simples, apenas formato)
def validar_cpf(cpf: str):
    cpf = cpf.replace(".", "").replace("-", "")
    if not cpf.isdigit() or len(cpf) != 11:
        raise HTTPException(status_code=400, detail="CPF inválido. Deve conter 11 dígitos numéricos.")
    return cpf

# Função para validar telefone (aceita 10 ou 11 dígitos)
def validar_telefone(telefone: str):
    telefone_limpo = ''.join(filter(str.isdigit, telefone))
    if len(telefone_limpo) not in [10, 11]:
        raise HTTPException(status_code=400, detail="Telefone inválido. Deve conter 10 ou 11 dígitos numéricos.")
    return telefone_limpo

# Função para tratar listas separadas por vírgula
def parse_lista(campo: str):
    return [item.strip() for item in campo.split(",") if item.strip()]

# Função para validar o upload do documento
def validar_documento(documento: UploadFile):
    if not documento:
        raise HTTPException(status_code=400, detail="Documento não enviado.")
    # Exemplo: aceitar apenas PDF ou JPG/JPEG/PNG
    if not (documento.filename.lower().endswith('.pdf') or
            documento.filename.lower().endswith('.jpg') or
            documento.filename.lower().endswith('.jpeg') or
            documento.filename.lower().endswith('.png')):
        raise HTTPException(status_code=400, detail="Documento deve ser PDF, JPG, JPEG ou PNG.")
    return documento

@router.post("/usuario")
async def criar_usuario(
    nome: str = Form(...),
    cpf: str = Form(...),
    nascimento: str = Form(...),  # Recebe como string, converte depois
    nacionalidade: str = Form(...),
    estado_civil: str = Form(...),
    nome_pai: str = Form(...),
    nome_mae: str = Form(...),
    endereco: str = Form(...),
    telefone: str = Form(...),  # <-- Novo campo telefone
    documento: UploadFile = File(...),
    interesses: str = Form(...),  # Recebe como string separada por vírgula
    compras_eventos: str = Form(...),
    redes_sociais: Optional[List[str]] = Form(None),
    perfis_esports: Optional[List[str]] = Form(None)
):
    # Valida e trata os campos
    nascimento_date = parse_date(nascimento)
    cpf_validado = validar_cpf(cpf)
    telefone_validado = validar_telefone(telefone)
    interesses_list = parse_lista(interesses)
    documento = validar_documento(documento)

    # Garante listas vazias se não vierem
    redes_sociais = redes_sociais or []
    perfis_esports = perfis_esports or []

    usuario = UsuarioBase(
        nome=nome,
        cpf=cpf_validado,
        nascimento=nascimento_date,
        nacionalidade=nacionalidade,
        estado_civil=estado_civil,
        nome_pai=nome_pai,
        nome_mae=nome_mae,
        endereco=endereco,
        telefone=telefone_validado,  # <-- Novo campo telefone
        interesses=interesses_list,
        compras_eventos=compras_eventos,
        redes_sociais=redes_sociais,
        perfis_esports=perfis_esports
    )

    # Aqui você pode salvar o arquivo documento.file.read() se quiser

    return {
        "mensagem": "Usuário recebido!",
        "usuario": usuario,
        "documento_nome": documento.filename
    }