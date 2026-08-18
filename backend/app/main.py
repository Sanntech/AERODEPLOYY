from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api import auth_routes


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Airport GroundStaff Task Management API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


app.include_router(
    auth_routes.router,
    prefix="/api/auth",
    tags=["auth"],
)