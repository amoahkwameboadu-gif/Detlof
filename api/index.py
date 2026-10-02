"""Vercel entry point for the Detlof portal.

Vercel runs Python as serverless functions behind an adapter. Mangum takes the
ordinary Flask application and presents it in the shape Vercel expects, so the
portal itself needs no changes to run online.

Two environment variables must be set on the project, because a serverless
function has no disk that survives between requests:

  DATABASE_URL        a Postgres connection string, holding the register
  DETLOF_SECRET_KEY   the key that signs the sign-in cookies

The project folder sits one level above this file, so it is put on the import
path before the application is loaded.
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from server import app  # noqa: E402  (import follows the path change above)

try:
    from mangum import Mangum
except ImportError as error:  # pragma: no cover - only hit if Mangum is missing
    raise RuntimeError(
        "Mangum is required to run on Vercel. Add it to requirements.txt."
    ) from error

handler = Mangum(app, lifespan="off")