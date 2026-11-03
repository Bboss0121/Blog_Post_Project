from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def home():
  return{"message":"hello Blog APP"}


@app.get("/about")
def about():
  return{"about":"about page"}