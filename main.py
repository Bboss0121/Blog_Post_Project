from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def home():
  return{"message":"hello Blog APP"}


@app.get("/about")
def about():
  return{"about":"about page"}

@app.get("/post/{post_id}")
def get_post(post_id:int):
  return{"post_id":post_id}

@app.get("/posts")
def lists_post(limit:int =10):
 return{"limit":limit}