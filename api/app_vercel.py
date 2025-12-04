import os
import sys
import traceback
import importlib.util

def load_module_from_path(mod_name, path):
    spec = importlib.util.spec_from_file_location(mod_name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[mod_name] = module
    spec.loader.exec_module(module)
    return module

def find_candidates():
    here = os.path.abspath(os.path.dirname(__file__))
    cwd = os.path.abspath(os.getcwd())
    parent = os.path.abspath(os.path.join(here, ".."))
    # common candidate files that may contain create_app/__init__
    candidates = [
        os.path.join(here, "__init__.py"),
        os.path.join(here, "app.py"),
        os.path.join(here, "main.py"),
        os.path.join(parent, "api", "__init__.py"),
        os.path.join(parent, "api.py"),
        os.path.join(parent, "__init__.py"),
        os.path.join(cwd, "api", "__init__.py"),
        os.path.join(cwd, "app.py"),
    ]
    # keep only existing files, preserve order
    return [p for p in candidates if os.path.isfile(p)]

print("app_vercel startup; sys.path[0:4]:", sys.path[:4], "cwd:", os.getcwd(), "file:", __file__)

app = None
# try normal import first
try:
    from api import create_app
    app = create_app()
except Exception:
    traceback.print_exc()
    tried = []
    for candidate in find_candidates():
        tried.append(candidate)
        try:
            print("Attempting to load api from:", candidate)
            mod = load_module_from_path("api", candidate)
            if hasattr(mod, "create_app"):
                app = mod.create_app()
                print("Loaded create_app from:", candidate)
                break
        except Exception:
            traceback.print_exc()
    if app is None:
        print("Tried candidates:", tried)
        # final fallback app that returns 500 and instructs to check logs
        from flask import Flask, Response
        fallback = Flask(__name__)
        @fallback.route("/", defaults={"path": ""})
        @fallback.route("/<path:path>")
        def _startup_error(path=""):
            return Response("Application failed to start; check Vercel logs for traceback.", status=500)
        app = fallback