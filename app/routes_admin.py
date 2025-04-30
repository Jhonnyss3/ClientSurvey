from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.models import Admin, User  # Ajuste conforme seu projeto
from app.database import get_db     # Ajuste conforme seu projeto

router = APIRouter()

# JWT settings
SECRET_KEY = "your_secret_key_here"  # Troque por uma chave forte!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

# Utils
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_admin_by_login(db: Session, login: str):
    return db.query(Admin).filter(Admin.login == login).first()

# Dependency to get current admin
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login: str = payload.get("sub")
        if login is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    admin = get_admin_by_login(db, login)
    if admin is None:
        raise credentials_exception
    return admin

# Route to register a new admin (for initial setup/testing)
@router.post("/admin/register")
def register_admin(login: str, password: str, db: Session = Depends(get_db)):
    if get_admin_by_login(db, login):
        raise HTTPException(status_code=400, detail="Login already registered")
    hashed_pw = get_password_hash(password)
    admin = Admin(login=login, pw_hash=hashed_pw)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"msg": "Admin registered", "id": admin.id}

# Route for admin login
@router.post("/admin/login")
def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = get_admin_by_login(db, form_data.username)
    if not admin or not verify_password(form_data.password, admin.pw_hash):
        raise HTTPException(status_code=400, detail="Incorrect login or password")
    access_token = create_access_token(
        data={"sub": admin.login},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected route: list all users
@router.get("/admin/users")
def list_users(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    users = db.query(User).all()
    return users