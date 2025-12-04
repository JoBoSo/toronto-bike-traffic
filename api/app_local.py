import sys
from pathlib import Path

# Allow running from within api/ folder by adding parent to sys.path
if __name__ == '__main__':
    parent = Path(__file__).resolve().parent.parent
    if parent not in sys.path:
        sys.path.insert(0, str(parent))

from api import create_app

# start dev server: python -m api.flask_app_local
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)