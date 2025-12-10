from flask import Flask
from flask_cors import CORS
# Import the Blueprint from routes
from .routes import api_bp 
# Import the DB functions from the new db.py
from .db import close_connection 

def create_app():
    """Application factory function."""
    app = Flask(__name__)

    CORS(app, origins=[
        "http://localhost:3000", 
        "https://localhost:3000", 
        "http://127.0.0.1:5000",
        "https://127.0.0.1:5000",
        "https://toronto-bike-traffic.vercel.app",
        "https://toronto-bike-traffic-backend.vercel.app",
        "http://www.torontobiketraffic.ca",
        "https://www.torontobiketraffic.ca",
    ])  # allow only your Next.js frontend
    # Or CORS(app) to allow all origins (less secure)
    
    # Register the teardown function
    app.teardown_appcontext(close_connection)
    
    # Register the Blueprint defined in routes.py
    app.register_blueprint(api_bp)

    return app