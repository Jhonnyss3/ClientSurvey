from fastapi import FastAPI
from app.routes_usuario import router as usuario_router
from app.routes_admin import router as admin_router

app = FastAPI(
    title="Know Your Fan API",
    description="API para cadastro completo de fãs de e-sports",
    version="1.0.0"
)

app.include_router(usuario_router)
app.include_router(admin_router)