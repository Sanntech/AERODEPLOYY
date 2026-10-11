from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    priority = Column(
        String(20),
        nullable=False,
        default="medium"
    )

    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    due_date = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )