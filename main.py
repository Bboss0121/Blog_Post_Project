from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import models
from database import engine

models.Base.metadata.create_all(bind=engine)

from routes.auth import router as auth_router
from routes.posts import router as posts_router

app = FastAPI(title="Blog API")

app.include_router(auth_router, prefix="/api/v1")
app.include_router(posts_router, prefix="/api/v1")

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def home():
    return FileResponse("static/index.html")