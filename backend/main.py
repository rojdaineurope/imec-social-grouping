from db import engine, SessionLocal
from models import Base, UserDB
Base.metadata.create_all(bind=engine)

from fastapi import FastAPI,HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uuid
from fastapi import BackgroundTasks

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MIN_MATCH = 3

class User(BaseModel):
    id: Optional[str] = None
    name: str
    attributes: List[str]
    group_id: Optional[str] = None

class Group:
    def __init__(self, attributes):
        self.id = str(uuid.uuid4())
        self.matched_attributes = attributes

#users_db = []
from sqlalchemy.orm import Session
from fastapi import Depends
from db import SessionLocal

# DB session generator
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# POST /users
@app.post("/users")
def create_user(user: User, db: Session = Depends(get_db)):
    # 🚨 SABİT BOYUT KONTROLÜ: Tam olarak 5 özellik isteniyor
    if len(user.attributes) != 5:
        raise HTTPException(status_code=400, detail="Tam olarak 5 özellik girilmelidir.")
    # 1️⃣ ID ekle
    user.id = str(uuid.uuid4())

    # 2️⃣ Grup atama
    assigned_group = None
    users_in_db = db.query(UserDB).all()
    # Kullanıcının gönderdiği özellikleri küçük harfe çevirelim
    cleaned_attrs = [a.lower().strip() for a in user.attributes]
    # 🚨 BENZERSİZLİK KONTROLÜ
    if len(set(cleaned_attrs)) != 5:
        raise HTTPException(
            status_code=400, 
            detail="Özellikler benzersiz olmalıdır. Tekrar eden özellik giremezsiniz!"
        )
    for u in users_in_db:
        # DB'deki stringi listeye çevirip karşılaştır
        db_user_attrs = set([a.lower().strip() for a in u.attributes.split(",")])
        common_attrs = set(u.attributes.split(",")) & set([a.lower() for a in user.attributes])
        if len(common_attrs) >= MIN_MATCH:
            assigned_group = u.group_id
            break

    if not assigned_group:
        assigned_group = str(uuid.uuid4())
    user.group_id = assigned_group
    
     # 3️⃣ DB'ye kaydet
    db_user = UserDB(
        id=user.id,
        name=user.name,
        attributes=",".join(user.attributes),
        group_id=user.group_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "id": user.id,
        "user_id": user.id, # Frontend'in tanıması için bunu ekledik
        "name": user.name,
        "group_id": user.group_id
    }

#grup bilgilerini görme
# grup bilgilerini görme
@app.get("/groups/{group_id}")
def get_group(group_id: str, db: Session = Depends(get_db)):
    members = db.query(UserDB).filter(UserDB.group_id == group_id).all()
    result = [
        {"id": u.id, "name": u.name, "attributes": u.attributes.split(","), "group_id": u.group_id}
        for u in members
    ]
    return {"group_id": group_id, "members": result}

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(UserDB).all()
    # Tüm kullanıcıları bir liste olarak dönüyoruz
    return [
        {
            "id": u.id, 
            "name": u.name, 
            "attributes": u.attributes.split(","), 
            "group_id": u.group_id
        } 
        for u in users
    ]
@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user:
        return {
            "id": user.id,
            "name": user.name,
            "attributes": user.attributes.split(","),
            "group_id": user.group_id
        }
    return {"error": "User not found"}
# Tüm kullanıcıları listeleyen yeni GET endpoint'i
