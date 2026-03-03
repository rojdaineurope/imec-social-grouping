from sqlalchemy import Column, String
from db import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    attributes = Column(String)
    group_id = Column(String)