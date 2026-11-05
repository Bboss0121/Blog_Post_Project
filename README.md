# Blog Web App

A simple blog application built with FastAPI, SQLAlchemy, and SQLite.

## Features
- User Registration and Login (JWT Auth)
- Post Creation, Retrieval, Updating, and Deletion
- User-specific content control

## Configuration
The app reads two environment variables:

- `SECRET_KEY` — **required.** JWT signing secret. Generate one with:
  `python -c "import secrets; print(secrets.token_hex(32))"`
- `DATABASE_URL` — optional. Defaults to a local SQLite file (`sqlite:///./blog.db`).
  For production, point this at Postgres, e.g. `postgresql://user:password@host:5432/blogdb`.

See `.env.example` for the full template.

## How to Run (Local)
1. Install dependencies: `pip install -r requirements.txt`
2. Set `SECRET_KEY` (e.g. `export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")`)
3. Run the application: `uvicorn main:app --reload`
4. Open `http://localhost:8000` in your browser.

## How to Deploy (Render)
The repo includes a `render.yaml` and a `Dockerfile` for one-click deploys.

1. Sign in with GitHub at [render.com](https://render.com).
2. **Blueprints → New → Web Service**, select `Bboss0121/Blog_Post_Project`.
3. It will pick up `render.yaml`, which provisions a free Postgres database and wires `DATABASE_URL` automatically.
4. **Set `SECRET_KEY`** in the Render dashboard (Environment tab) to a long random value.
5. Deploy. Your public URL is shown on the service page.

### Alternative: Docker
```
docker build -t blog-app .
docker run -e SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))") -p 8000:8000 blog-app
```
