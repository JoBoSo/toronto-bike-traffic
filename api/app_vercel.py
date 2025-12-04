# ...existing code...
import os
import sys
import traceback

# Try a set of candidate roots so "import api" will work whether Vercel
# flattened files into /var/task or preserved the api/ folder.
this_dir = os.path.dirname(__file__)          # e.g. .../api or /var/task
parent = os.path.abspath(os.path.join(this_dir, ".."))
cwd = os.getcwd()
cwd_parent = os.path.abspath(os.path.join(cwd, ".."))
candidates = [this_dir, parent, cwd, cwd_parent]

added = []
for c in candidates:
    if not c:
        continue
    # If directory looks like repo root (contains an "api" package) prefer it.
    looks_like_root = os.path.isdir(os.path.join(c, "api")) or os.path.isfile(os.path.join(c, "api.py"))
    if looks_like_root and c not in sys.path:
        sys.path.insert(0, c)
        added.append(c)

# If none of the candidates looked like the repo root, still insert parent and cwd
if not added:
    for c in (parent, cwd):
        if c and c not in sys.path:
            sys.path.insert(0, c)
            added.append(c)

# Print what was added so it shows up in Vercel startup logs
print("app_vercel sys.path additions:", added, "sys.path[0:4]:", sys.path[:4])

try:
    from api import create_app
    app = create_app()
except Exception:
    traceback.print_exc()
    from flask import Flask, Response

    fallback = Flask(__name__)

    @fallback.route("/", defaults={"path": ""})
    @fallback.route("/<path:path>")
    def _startup_error(path=""):
        return Response("Application failed to start; check Vercel logs for traceback.", status=500)

    app = fallback
# ...existing code...