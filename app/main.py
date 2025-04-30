from fastapi import FastAPI
from .routes_usuario import router

app = FastAPI(
    title="Know Your Fan API",
    description="API para cadastro completo de fãs de e-sports",
    version="1.0.0"
)

app.include_router(router)