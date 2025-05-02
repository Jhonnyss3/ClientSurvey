from fastapi import FastAPI
from app.routes_usuario import router as usuario_router
from app.routes_admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Know Your Fan API",
    description="API para cadastro completo de fãs de e-sports",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ou ["*"] para liberar geral (não recomendado em produção)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router)
app.include_router(admin_router)