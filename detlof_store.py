"""Where the Detlof data store lives.

The school has one register: the students, the administrator accounts, the
announcements and the published website content. Two places need to hold it.

On a normal computer that is a JSON file next to the project, because it is
simple to read, simple to back up and works with no setup.

On Vercel a serverless function has no disk that survives between requests, so
the same data has to live in a database. When DATABASE_URL is present this
module reads and writes a single JSON document in Postgres instead.

The data model is deliberately identical in both cases: one document, stored
whole. Nothing else in the project needs to know which one it is talking to.
"""

import json
import os
import threading

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "detlof_data.json")

# A serverless function handles many requests at once. Saves are serialised so
# two simultaneous writes cannot interleave and lose one of the changes.
_write_lock = threading.Lock()

# Created on first use so a fresh database needs no migration step.
_SCHEMA = """
CREATE TABLE IF NOT EXISTS detlof_store (
    id INTEGER PRIMARY KEY,
    document JSONB NOT NULL
)
"""


def using_database():
    """True when a database has been configured for this deployment."""
    return bool(os.environ.get("DATABASE_URL"))


def backend_name():
    return "postgres" if using_database() else "json-file"


def read_document():
    """Return the stored document, or None when there is nothing stored yet."""
    if using_database():
        return _read_database()
    if not os.path.exists(DATA_FILE):
        return None
    with open(DATA_FILE, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_document(document):
    """Replace the stored document with the one given."""
    if using_database():
        _write_database(document)
        return
    directory = os.path.dirname(DATA_FILE)
    if directory:
        os.makedirs(directory, exist_ok=True)
    # Written to a temporary file and moved into place, so a crash midway
    # cannot leave a half-written register behind.
    temp_file = DATA_FILE + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as handle:
        json.dump(document, handle, indent=2, ensure_ascii=False)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temp_file, DATA_FILE)


# --------------------------------------------------------------------- database
def _connect():
    # Imported here rather than at module level so a computer with no database
    # driver installed can still run the school locally from the JSON file.
    import psycopg

    return psycopg.connect(os.environ["DATABASE_URL"])


def _read_database():
    with _connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(_SCHEMA)
            cursor.execute("SELECT document FROM detlof_store WHERE id = 1")
            row = cursor.fetchone()
        connection.commit()
    if row is None or row[0] is None:
        return None
    return row[0]


def _write_database(document):
    with _write_lock:
        with _connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(_SCHEMA)
                # An upsert, so the same code serves a first save and later ones.
                cursor.execute(
                    """
                    INSERT INTO detlof_store (id, document)
                    VALUES (1, %s)
                    ON CONFLICT (id) DO UPDATE SET document = EXCLUDED.document
                    """,
                    (json.dumps(document, ensure_ascii=False),),
                )
            connection.commit()