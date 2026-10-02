# The School Register — running it online on Vercel
#
# Locally nothing needs configuring: run
#
#     .\.venv\Scripts\python.exe server.py
#
# and open http://127.0.0.1:5000. The register is kept in detlof_data.json
# beside this file.
#
# On Vercel a serverless function has no disk that survives between requests,
# so two environment variables must be set on the Vercel project. Without them
# sign-in will not work and nothing will be saved.
#
# ---------------------------------------------------------------------------
# 1. DATABASE_URL — where the register is kept
# ---------------------------------------------------------------------------
# Create a Postgres database (Vercel Storage > Postgres, or Neon) and set
# DATABASE_URL to its connection string, for example:
#
#     postgresql://user:password@host/dbname?sslmode=require
#
# The table is created automatically on first use, so there is no migration to
# run. The whole register is stored as one document, matching the JSON file used
# on the school computer.
#
# To bring the existing school register across, start the server locally with
# DATABASE_URL set; the file is then loaded and any later save writes to the
# database. Otherwise create the administrator accounts on the deployed site
# with:
#
#     python server.py setup-admin
#     python server.py setup-admin academic_admin
#
# ---------------------------------------------------------------------------
# 2. DETLOF_SECRET_KEY — the key that signs the sign-in cookies
# ---------------------------------------------------------------------------
# This must be the same value on every request, otherwise saved sessions are
# rejected and everyone is asked to sign in again. Generate one with:
#
#     python -c "import secrets; print(secrets.token_hex(32))"
#
# ---------------------------------------------------------------------------
# How the request routing works
# ---------------------------------------------------------------------------
# The pages, styles and scripts are served as static files. Anything under
# /api/ is rewritten to the Python function in api/index.py, which runs the same
# Flask application through the Mangum adapter.