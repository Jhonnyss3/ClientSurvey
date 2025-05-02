from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .models import UsuarioOut, User
from .database import get_db
from pdf2image import convert_from_path

import pytesseract
from PIL import Image
import os
from rapidfuzz import fuzz
from unidecode import unidecode
import re
from datetime import datetime

router = APIRouter()

def parse_date(data_str):
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(data_str, fmt).date()
        except ValueError:
            continue
    raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD ou DD/MM/YYYY.")

def validar_cpf(cpf: str):
    cpf = cpf.replace(".", "").replace("-", "")
    if not cpf.isdigit() or len(cpf) != 11:
        raise HTTPException(status_code=400, detail="CPF inválido. Deve conter 11 dígitos numéricos.")
    return cpf

def validar_telefone(telefone: str):
    telefone_limpo = ''.join(filter(str.isdigit, telefone))
    if len(telefone_limpo) not in [10, 11]:
        raise HTTPException(status_code=400, detail="Telefone inválido. Deve conter 10 ou 11 dígitos numéricos.")
    return telefone_limpo

def parse_lista(campo: str):
    return [item.strip() for item in campo.split(",") if item.strip()]

def validar_documento(documento: UploadFile):
    if not documento:
        raise HTTPException(status_code=400, detail="Documento não enviado.")
    if not (documento.filename.lower().endswith('.pdf') or
            documento.filename.lower().endswith('.jpg') or
            documento.filename.lower().endswith('.jpeg') or
            documento.filename.lower().endswith('.png')):
        raise HTTPException(status_code=400, detail="Documento deve ser PDF, JPG, JPEG ou PNG.")
    return documento

def normalizar(texto):
    return unidecode(texto).lower().strip()

def campo_esta_presente(valor, texto, limiar=85):
    valor_norm = normalizar(valor)
    texto_norm = normalizar(texto)
    return fuzz.partial_ratio(valor_norm, texto_norm) >= limiar

def buscar_regex(padrao, texto):
    texto_norm = normalizar(texto)
    return re.search(padrao, texto_norm) is not None

def validar_documento_ia(documento, dados_usuario):
    import tempfile

    suffix = os.path.splitext(documento.filename)[-1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(documento.file.read())
        temp_path = tmp.name

    texto = ""
    try:
        if suffix == ".pdf":
            poppler_path = r"C:\poppler-24.08.0\Library\bin"  # Ajuste para o seu PC!
            images = convert_from_path(temp_path, poppler_path=poppler_path)
            for img in images:
                texto += pytesseract.image_to_string(img, lang="por") + "\n"
        else:
            img = Image.open(temp_path)
            texto = pytesseract.image_to_string(img, lang="por")
    except Exception as e:
        os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"O arquivo enviado não pôde ser processado como imagem ou PDF. Erro: {e}")
    os.remove(temp_path)
    print("\n--- TEXTO EXTRAÍDO DO DOCUMENTO ---\n", texto, "\n-------------------\n")

    erros = []
    for campo in ["nome", "nacionalidade", "estado civil", "nome pai", "nome mae"]:
        valor = dados_usuario.get(campo)
        if valor and not campo_esta_presente(valor, texto):
            erros.append(f"{campo} não confere com o documento.")

    cpf = dados_usuario.get("cpf")
    if cpf:
        cpf_regex = re.sub(r'\D', '', cpf)
        padrao_cpf = r'(\d{3}\.?\d{3}\.?\d{3}-?\d{2})'
        if not buscar_regex(cpf_regex, texto) and not buscar_regex(padrao_cpf, texto):
            erros.append("CPF não confere com o documento.")

    nascimento = dados_usuario.get("nascimento")
    if nascimento:
        datas_possiveis = [
            nascimento,
            nascimento.replace("-", "/"),
            nascimento.replace("/", "-"),
        ]
        data_regexes = [
            r'\d{2}/\d{2}/\d{4}',
            r'\d{2}-\d{2}-\d{4}',
            r'\d{4}-\d{2}-\d{2}',
        ]
        encontrou = False
        for data in datas_possiveis:
            if campo_esta_presente(data, texto, limiar=90):
                encontrou = True
                break
        if not encontrou:
            for regex in data_regexes:
                if buscar_regex(regex, texto):
                    encontrou = True
                    break
        if not encontrou:
            erros.append("Data de nascimento não confere com o documento.")

    if erros:
        raise HTTPException(status_code=400, detail="; ".join(erros))
    return True

@router.post("/usuario", response_model=UsuarioOut)
async def criar_usuario(
    nome: str = Form(...),
    cpf: str = Form(...),
    nascimento: str = Form(...),
    nacionalidade: str = Form(...),
    estado_civil: str = Form(...),
    nome_pai: str = Form(...),
    nome_mae: str = Form(...),
    endereco: str = Form(...),
    telefone: str = Form(...),
    documento: UploadFile = File(...),
    interesses: str = Form(...),
    compras_eventos: str = Form(...),
    redes_sociais: Optional[List[str]] = Form(None),
    perfis_esports: Optional[List[str]] = Form(None),
    db: Session = Depends(get_db)
):
    nascimento_date = parse_date(nascimento)
    cpf_validado = validar_cpf(cpf)
    telefone_validado = validar_telefone(telefone)
    interesses_list = parse_lista(interesses)
    documento = validar_documento(documento)
    redes_sociais = redes_sociais or []
    perfis_esports = perfis_esports or []

    dados_usuario = {
        "nome": nome,
        "cpf": cpf_validado,
        "nascimento": nascimento,
        "nacionalidade": nacionalidade,
        "estado civil": estado_civil,
        "nome pai": nome_pai,
        "nome mae": nome_mae
    }
    validar_documento_ia(documento, dados_usuario)

    user_db = User(
        nome=nome,
        cpf=cpf_validado,
        nascimento=nascimento_date,
        nacionalidade=nacionalidade,
        estado_civil=estado_civil,
        nome_pai=nome_pai,
        nome_mae=nome_mae,
        endereco=endereco,
        telefone=telefone_validado,
        interesses=",".join(interesses_list),
        compras_eventos=compras_eventos,
        redes_sociais=",".join(redes_sociais),
        perfis_esports=",".join(perfis_esports)
    )
    db.add(user_db)
    db.commit()
    db.refresh(user_db)

    usuario = UsuarioOut(
        nome=user_db.nome,
        cpf=user_db.cpf,
        nascimento=user_db.nascimento,
        nacionalidade=user_db.nacionalidade,
        estado_civil=user_db.estado_civil,
        nome_pai=user_db.nome_pai,
        nome_mae=user_db.nome_mae,
        endereco=user_db.endereco,
        telefone=user_db.telefone,
        interesses=interesses_list,
        compras_eventos=user_db.compras_eventos,
        redes_sociais=redes_sociais,
        perfis_esports=perfis_esports,
        created_at=user_db.created_at
    )
    return usuario