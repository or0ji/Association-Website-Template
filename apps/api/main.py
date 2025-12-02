from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from database import engine
from models import Base
from routers import public, admin, chat

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="山西省电力工程企业协会 API",
    description="SXPEEA Official Website API",
    version="1.0.0"
)

# CORS configuration - 支持流式响应
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=False,  # 注意：与 allow_origins=["*"] 一起使用时需要为 False
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # 暴露所有头部
)

# Mount static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(public.router)
app.include_router(admin.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "SXPEEA API is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

