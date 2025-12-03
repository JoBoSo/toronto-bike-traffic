import sqlite3
import os
from flask import g
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

DB_PATH = os.path.join(os.path.dirname(__file__), os.getenv('DB_PATH'))

# DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'db.sqlite3')

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def close_connection(exception):
    """Closes the database connection at the end of the request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()