import os
import re
from datetime import datetime, timedelta, timezone
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv

load_dotenv()

# FastAPI app instance
api = FastAPI()
# So we can call this from the "backend" script in package.json
app = api

# The frontend is on localhost, but the backend is on 127.0.0.1 so we need CORS
api.add_middleware(
    CORSMiddleware,
    # This is for running locally when I was developing. If you want to use this on AWS or GCP, change this
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context using passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# SQL table schemas
class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)

class UserNotes(Base):
    __tablename__ = 'user_notes'
    save_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    note_title = Column(String, nullable=False)
    note_body = Column(String, nullable=False)

# Pydantic data schemas. I decided to use this because the alternative is not as clean and readable.
# Schema for user authentication
class UserAuth(BaseModel):
    email: str
    password: str

# Schema for creating a note
class NoteCreate(BaseModel):
    title: str
    body: str

# Schema for editing a note
class NoteEdit(NoteCreate):
    id: int

# Schema for deleting a note
class NoteDelete(BaseModel):
    id: int

# Schema for note data
class NoteResponse(BaseModel):
    saveId: int
    title: str
    body: str

    class Config:
        from_attributes = True

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token cookie")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@api.post('/signup', status_code=status.HTTP_201_CREATED)
def signup(user_data: UserAuth, response: Response, db: Session = Depends(get_db)):

    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.fullmatch(pattern, user_data.email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password needs to be at least 6 characters!")

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email address already in use")

    # Hash the password
    hashed_password = get_password_hash(user_data.password)

    # Create new user
    new_user = User(email=user_data.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT token
    access_token = create_access_token(data={"sub": user_data.email})
    
    # Set the token in an HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite='lax',
        # secure=True,  # IMPORTANT: Uncomment this in production (requires HTTPS)
    )
    
    return {"email": new_user.email, "id": new_user.id}


@api.post('/login')
def login(form_data: UserAuth, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()

    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT token
    access_token = create_access_token(data={"sub": user.email})
    
    # Set the token in an HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite='lax',
        # secure=True,  # IMPORTANT: Uncomment this in production (requires HTTPS)
    )
    
    # Return user data in the body
    return {"email": user.email, "message": "Login successful"}


@api.post('/logout')
def logout():
    return {"message": "Successfully logged out"}


@api.post('/createNewNote')
def create_new_note(note_data: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_note = UserNotes(
        user_id=current_user.id,
        note_title=note_data.title,
        note_body=note_data.body
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return {"id": new_note.save_id}


@api.post('/editNote')
def edit_note(note_data: NoteEdit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(UserNotes).filter(UserNotes.save_id == note_data.id, UserNotes.user_id == current_user.id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.note_title = note_data.title
    note.note_body = note_data.body
    db.commit()
    return {"message": "Note updated successfully"}


@api.post('/deleteNote')
def delete_note(note_data: NoteDelete, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(UserNotes).filter(UserNotes.save_id == note_data.id, UserNotes.user_id == current_user.id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}


@api.get('/api/profile')
def my_profile(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "id": current_user.id}

@api.get('/api/notes')
def get_user_notes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notes = db.query(UserNotes).filter(UserNotes.user_id == current_user.id).all()

    notes_data = [{"saveId": note.save_id, "title": note.note_title, "body": note.note_body} for note in notes]
    return {"notes": notes_data}

if __name__ == '__main__':
    # This creates tables if they weren't created, like in a new SQL databsae
    Base.metadata.create_all(bind=engine)

    uvicorn.run(api, host="127.0.0.1", port=5000)