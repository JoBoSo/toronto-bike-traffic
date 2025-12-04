# ...existing code...
import os
import sys
import traceback

# Ensure the repository root is on sys.path so `import api` works when Vercel runs this file
project_root = os.path.dirname(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from api import create_app
    app = create_app()
except Exception:
    # Print the startup traceback so Vercel logs contain the real error
    traceback.print_exc()
    from flask import Flask, Response

    fallback = Flask(__name__)

    @fallback.route("/", defaults={"path": ""})
    @fallback.route("/<path:path>")
    def _startup_error(path=""):
        return Response("Application failed to start; check Vercel logs for traceback.", status=500)

    app = fallback
# ...existing code...